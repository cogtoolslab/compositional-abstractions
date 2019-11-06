"""Chatroom game."""

import logging
import socket
import json
import threading
import random

from dallinger import networks
from dallinger.compat import unicode
from dallinger.config import get_config
from dallinger.experiment import Experiment
from dallinger.nodes import Agent
from dallinger.models import Network, Node, Info, Participant

from dallinger.db import redis_conn

from interesting_structures import structures

logger = logging.getLogger(__name__)

def extra_parameters():
    config = get_config()
    config.register("network", unicode)
    config.register("repeats", int)
    config.register("n", int)

class RefGame :
    def __init__(self, network_id) :
        self.network_id = network_id
        self.players = []
        self.trialList = structures.copy()
        self.numRepetitions = 6
        self.trialNum = -1
 
    def newRound (self) :
        # TODO: this would be a lot more elegant if diff networks had diff channels
        # instead of sending everything through single channel (so everyone has to check if they're recipient)
        self.trialNum = self.trialNum + 1
        newTrial = self.trialList[self.trialNum]
        packet = json.dumps({
            'type': 'newRound',
            'networkid' : self.network_id,
            'trialNum' : self.trialNum,
            'currStim' : newTrial['blocks'],
            'roles' : {'speaker' : self.players[0], 'listener' : self.players[1]}
        })
        redis_conn.publish('refgame', packet)

class RefGameServer(Experiment):
    """Define the structure of the experiment."""

    def __init__(self, session=None):
        """Initialize the experiment."""
        super(RefGameServer, self).__init__(session)
        self.channel = 'refgame'
        self.games = {}
        if session:
            self.setup()

    def configure(self):
        config = get_config()
        self.experiment_repeats = repeats = config.get("repeats")
        self.network_class = config.get("network")
        self.quorum = config.get("n")

        # Recruit for all networks at once
        self.initial_recruitment_size = repeats * self.quorum

    def create_network(self):
        """Create a new network by reading the configuration file."""
        class_ = getattr(networks, self.network_class)
        return class_(max_size=self.quorum)

    def choose_network(self, networks, participant):
        # Choose first available network rather than random
        return networks[0]

    def info_post_request(self, node, info):
        """Run when a request to create an info is complete."""
        for agent in node.neighbors():
            node.transmit(what=info, to_whom=agent)

    def create_node(self, participant, network):
        """Create a node for a participant."""
        return Agent(network=network, participant=participant)

    def handle_done(self, msg) :
        """ When we find out listener has made response, schedule next round to begin """
        currGame = self.games[msg['networkid']]
        t = threading.Timer(2, currGame.newRound)
        t.start()
        
    def handle_connect(self, msg):
        network_id = msg['networkid']

        # create game object if first player in network to join
        if network_id not in self.games :
            self.games[network_id] = RefGame(network_id)

        # Once participant connects, add them to their respective game list
        game = self.games[network_id]
        game.players.append(msg['participantid'])

        # After everyone is properly connected, send packet for first trial
        if len(game.players) == self.quorum :
            game.newRound()
            
    def record (self, msg) :
        node = Participant.query.get(msg['participantid']).all_nodes[0]
        info = Info(origin=node, contents=msg['type'], details=msg)
        self.session.add(info)
        self.session.commit()
        
    def send(self, raw_message) :
        """override default send to handle participant messages on channel"""
        handlers = {
            'connect' : self.handle_connect,
            'done' : self.handle_done
        }
        if raw_message.startswith(self.channel + ":") :
            logger.info("We received a message for our channel: {}".format(raw_message))
            body = raw_message.replace(self.channel + ":", "")
            msg = json.loads(body)

            # Record message as event in database
            self.record(msg)
            if msg['type'] in handlers:
                handlers[msg['type']](msg)
            else :
                logger.info("Received message: {}".format(raw_message))
