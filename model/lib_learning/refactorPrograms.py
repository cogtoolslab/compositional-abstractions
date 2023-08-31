# loop over all participants
from towerPrimitives import primitives
from grammar import *
from fragmentGrammar import *
from makeTowerTasks import *
from parsePrograms import *
import json

import os

tower_strings = {"CL" :"(h (l 1) v v (r 1) h (r 12) h (l 4) h (l 1) v v)",
                "CPi": "(h (l 1) v v (r 1) h (r 6) v (r 6) v (l 5) h (r 4) h)",
                "LPi": "(h (l 4) h (l 1) v v (r 9) v (r 6) v (l 5) h (r 4) h)",
                "LC": "(h (l 4) h (l 1) v v (r 12) h (l 1) v v (r 1) h)",
                "PiC": "(v (r 6) v (l 5) h (r 4) h (r 7) h (l 1) v v (r 1) h)",
                "PiL": "(v (r 6) v (l 5) h (r 4) h (r 9) h (l 4) h (l 1) v v)"}

manual_tower_programs = {"CL" :"h l_1 v v r_1 h r_12 h l_4 h l_1 v v",
                         "CPi": "h l_1 v v r_1 h r_6 v r_6 v l_5 h r_4 h",
                         "PiC": "v r_6 v l_5 h r_4 h r_7 h l_1 v v r_1 h",
                         "LPi": "h l_4 h l_1 v v r_9 v r_6 v l_5 h r_4 h",
                         "LC": "h l_4 h l_1 v v r_12 h l_1 v v r_1 h",
                         "PiL": "v r_6 v l_5 h r_4 h r_9 h l_4 h l_1 v v"}

base_dsl = ['h', 
            'v', 
            'l_0',
            'l_1',
            'l_2',
            'l_3',
            'l_4',
            'l_5',
            'l_6',
            'l_7',
            'l_8',
            'l_9',
            'l_10',
            'l_11',
            'l_12',
            'r_0',
            'r_1',
            'r_2',
            'r_3',
            'r_4',
            'r_5',
            'r_6',
            'r_7',
            'r_8',
            'r_9',
            'r_10',
            'r_11',
            'r_12']

def get_partially_chunked_programs(trial_datum):
    '''
    This helper function converts minimum length programs into longer versions that replace each chunk with its base-DSL equivalent.
    '''
    
    chunk_lambdas = trial_datum['dsl_lambda'][16:]
    chunk_names = trial_datum['chunks']

    progs = [trial_datum['min_program']]

    for prog in progs:
        for i, chunk_name in enumerate(chunk_names):
            new_prog = prog.replace(chunk_name, parse(chunk_lambdas[i], base_dsl_only=True))
            if not(new_prog in progs):
                progs.append(new_prog)
    
    progs_with_length = {p: len(p.split(' ')) for p in progs}
    return progs_with_length


def refactor_programs(dsls, # dictionary of dsls (one for each ppt)
                      trial_seqs, # dictionary of trial sequences (one for each ppt)
                      w_position = 3, # what is the index of the dsl we want to check?
                      file_path = "./data/language_output/",
                      verbose = False):
    '''
    This function takes in a dictionary of DSLs, a dictionary of trial sequences, and a w_position (default 3) and returns a dictionary of programs for each participant. Each dictionary contains a minimum length program (involving the most abstract program fragments), as well as other programs that replace each fragment with its base-DSL equivalent.
    '''

    for ppt in dsls.keys():
        
        assert ppt in trial_seqs.keys()

        trial_data = []

        # towerpairs plus trial numbers
        trial_tasks = [SupervisedTower(tower_pair + str(i+1), tower_strings[tower_pair]) for i, tower_pair in enumerate(trial_seqs[ppt])]

        # get dsls for all trials
        trial_grammars = {trial_tasks[i]: Grammar.uniform(primitives + dsls[ppt][i][w_position]) for i in range (1,12)}
        trial_grammars[trial_tasks[0]] = Grammar.uniform(primitives)

        for trial_num in range(1,13):

            scene = trial_seqs[ppt][trial_num-1] # get trial scene
            if verbose: print(scene)
            chunks = list(map(lambda x: parse(str(x)), trial_grammars[trial_tasks[trial_num-1]].primitives[16:]))
            manual_program = manual_tower_programs[scene]
            min_program = manual_program

            if len(dsls[ppt][trial_num][w_position]) == 0: # if no chunks learned, take input program

                if verbose: print(min_program)

            else: # if some chunks learned, swap in chunks into input program

                # find translation between dsl substring and chunk
                chunk_tranlations_trimmed = list(map(lambda x: parse(str(x), base_dsl_only=True), dsls[ppt][trial_num-1][w_position]))

                # order chunks from largest to smallest
                chunk_dict = {chunks[i]: chunk_tranlations_trimmed[i] for i in range(0, len(chunks))}
                sorted_chunk_dict = sorted(chunk_dict.items(), key=lambda item: len(item[1].split()), reverse=True)
                if verbose: print(sorted_chunk_dict)

                # start with base dsl program
                chunked_program = manual_program

                # swap chunks in from largest to smallest
                for key, value in sorted_chunk_dict:
                    chunked_program = chunked_program.replace(value, key)

                if verbose:
                    print('manual:', manual_program)
                    print('chunked:', chunked_program)

                min_program = chunked_program


            trial_data.append(
                {
                'ppt' : ppt, # just added
                'trial_num': trial_num,
                'towers': scene,
                'dsl_lambda': [str(p) for p in trial_grammars[trial_tasks[trial_num-1]].primitives],
                'chunks': chunks,
                'dsl': base_dsl + list(map(lambda s: parse(str(s)), trial_grammars[trial_tasks[trial_num-1]].primitives[16:])),
                #         'trial_programs': trial_programs_sorted,
                'min_program': min_program
                })

        # find programs with abstractions replaced with base dsl only
        for i, trial_datum in enumerate(trial_data):
            trial_datum['programs_with_length'] = get_partially_chunked_programs(trial_datum)

        if not os.path.exists(file_path):
            os.makedirs(file_path)
            
    #     # # This will save results within lib-learning directory. 
        with open(file_path + "programs_ppt_" + str(ppt) +".json", "w") as write_file:
             json.dump(trial_data, write_file)

    print('Programs saved in ' + file_path + 'programs_ppt_[ppt].json')
    
