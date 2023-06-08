import pickle
import sys
import path

import numpy as np

from towerPrimitives import primitives
from makeTowerTasks import *
from grammar import *
from fragmentGrammar import *
from gen_seq import *
from utilities import *
from enumeration import *
from program import *

data_path = './results/2/'
dsls = {}
for trial in range(1, 13):
    with open(data_path+f"{trial}.p", "rb") as input_file:
            dsls[trial] = pickle.load(input_file)

with open("./results/2/configs.p", "rb") as config_file:
    trial_seq = pickle.load(config_file)


tower_strings = {"CL" :"(h (l 1) v v (r 1) h (r 12) h (l 4) h (l 1) v v)",
                "CPi": "(h (l 1) v v (r 1) h (r 6) v (r 6) v (l 5) h (r 4) h)",
                "LPi": "(h (l 4) h (l 1) v v (r 9) v (r 6) v (l 5) h (r 4) h)",
                "LC": "(h (l 4) h (l 1) v v (r 12) h (l 1) v v (r 1) h)",
                "PiC": "(v (r 6) v (l 5) h (r 4) h (r 7) h (l 1) v v (r 1) h)",
                "PiL": "(v (r 6) v (l 5) h (r 4) h (r 9) h (l 4) h (l 1) v v)"}

# select a single w
w = 3.3
w_position = int(w*10)

trial_tasks = [SupervisedTower(tower_pair + str(i+1), tower_strings[tower_pair]) for i, tower_pair in enumerate(trial_seq)]

# get grammar from trials up to that point
trial_grammars = {trial_tasks[i]: Grammar.uniform(primitives + dsls[i][w_position]) for i in range (1,12)}
trial_grammars[trial_tasks[0]] = Grammar.uniform(primitives)

print('warning: only running trials 4 and 5')

# attempt multicore with different grammars
multicoreEnumeration(trial_grammars, 
                         trial_tasks[3:5], 
                         maximumFrontier=100.0, 
                         enumerationTimeout=50000, 
                         solver='python',
                         filepath='./results/2/enumeration/',
                         filename='enumeration_50000')

#pickle.dump(f, open( './results/2/enumeration_30000_timeout.p', "wb" ))