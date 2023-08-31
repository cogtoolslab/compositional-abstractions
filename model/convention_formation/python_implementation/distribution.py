import json
import itertools
import lexicon

import numpy as np
import pandas as pd 

from scipy.special import logsumexp
from numpy.random import choice

class SimulationOutput() :
    def __init__(self) :
        self.d = pd.DataFrame({"trial": [], "utterance": [], "response": [], "intention":[],
                               "target_program": [], "dsl": [], "target_length" : [], "acc": []})
        self.utts, self.responses, self.accs, self.intents = [], [], [], []
    
    def save(self, intent, utt, response) :
        self.utts.append(utt)
        self.responses.append(response)
        self.intents.append(intent)
        self.accs.append(1.0 * (response == intent))

    def flush(self, trial, target_program) :
        self.d = pd.concat([self.d, pd.DataFrame({
            "trial": trial['trial_num'],
            "utterance": self.utts,
            "response": self.responses,
            "intention" : self.intents,
            "target_program": target_program,
            "acc": self.accs,
            "dsl" : [trial['dsl']] * len(self.utts),
            "target_length" : trial['programs_with_length'][target_program],
        })])
        self.utts, self.responses, self.accs, self.intents = [], [], [], []

    def get_df(self) :
        return self.d
        
class Distribution() :
    def __init__(self, support, probabilities, log_space = False):
        self.log_space = log_space
        self.d = {}
        for element, probability in zip(support, probabilities) :
            self.d.update({element: probability})

    def __hash__(self):
        return hash(json.dumps(self.d, sort_keys=True))

    def __str__(self) :
        return json.dumps({k if isinstance(k, str) else str(hash(k)): v for k, v in self.d.items()}, indent = 4)
 
    def copy(self) :
        return Distribution(self.support(), [self.score(k) for k in self.support()], log_space = self.log_space)
    
    def update(self, element):
        for k, val in element.items():
            if k in self.d :
                # if it already exists in the distribution, aggregate probabilities
                self.d[k] = np.logaddexp(self.d[k], val) if self.log_space else self.d[k] + val
            else : 
               # otherwise add as a new element of the distribution
                self.d[k] = val
               
    def score(self, val) :
        return self.d[val] if val in self.d else self.epsilon()

    def sample(self) :
        return choice(a = [*self.support()], p = [self.score(a) for a in self.support()])
    
    def epsilon(self) :
        return np.log(0.01) if self.log_space else 0.01
    
    def support(self) :
        return list(self.d.keys())
    
    def renormalize(self) :
        Z = logsumexp(list(self.d.values())) if self.log_space else sum(self.d.values()) 
        for k, prob in self.d.items():
            self.d[k] = prob - Z if self.log_space else prob / Z
        
    def marginalize(self, f) :
        d_new = EmptyDistribution()
        for k, val in self.d.items():
            d_new.update({f(k): val})
        return d_new
        
    def to_logspace(self) :
        self.log_space = True
        for k, prob in self.d.items():
            self.d[k] = np.log(prob)

    def from_logspace(self) :
        self.log_space = False
        for k, prob in self.d.items():
            self.d[k] = np.exp(prob)
            
class UniformDistribution(Distribution) :
    def __init__(self, support):
        uniform_probabilities = [ 1/len(support) ] * len(support)
        super().__init__(support, uniform_probabilities)
        
class EmptyDistribution(Distribution) :
    def __init__(self):
        super().__init__([], [])

class LexiconPrior(UniformDistribution) :
    def __init__(self, dsl, lexemes):
        # we cap the number of possible lexemes for simplicity 
        # (the more theoretically sound way to solve this is 
        # to make an 'empty meaning' to assign if there are no more chunks)
        chunks = [k for k in dsl if k[:5] == 'chunk']
        usable_lexemes = lexemes[:len(chunks)]
        possible_lexicons = [lexicon.BlockLexicon(dsl, list(mapping)) 
                             for mapping in itertools.permutations(usable_lexemes)]
        super().__init__(possible_lexicons)
