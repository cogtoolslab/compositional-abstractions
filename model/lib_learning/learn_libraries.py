from towerPrimitives import primitives
from makeTowerTasks import *
from grammar import *
from fragmentGrammar import *
from gen_seq import *
from utilities import *
import numpy as np
import pickle
from pathos.multiprocessing import ProcessPool
import os


g0 = Grammar.uniform(primitives, continuationType=ttower)
ws = [1.5, 3.2, 3.3, 9.6]
path = './model/lib_learning/dsls/'
n_ppts = 49

towers = dict(C = SupervisedTower("C", "(h (l 1) v v (r 1) h)"),
                    L = SupervisedTower("L", "(h (l 4) h (l 1) v v)"),
                    Pi = SupervisedTower("Pi", "(v (r 6) v (l 5) h (r 4) h)"),
                    CL = SupervisedTower("CL", "(h (l 1) v v (r 1) h (r 12) h (l 4) h (l 1) v v)"),
                    CPi = SupervisedTower("CPi", "(h (l 1) v v (r 1) h (r 6) v (r 6) v (l 5) h (r 4) h)"),
                    LPi = SupervisedTower("LPi", "(h (l 4) h (l 1) v v (r 9) v (r 6) v (l 5) h (r 4) h)"),
                    LC = SupervisedTower("LC", "(h (l 4) h (l 1) v v (r 12) h (l 1) v v (r 1) h)"),
                    PiC = SupervisedTower("PiC", "(v (r 6) v (l 5) h (r 4) h (r 7) h (l 1) v v (r 1) h)"),
                    PiL = SupervisedTower("PiL", "(v (r 6) v (l 5) h (r 4) h (r 9) h (l 4) h (l 1) v v)"))

# def load_data(ppt, path):
#     with open(os.path.join(path, str(ppt), 'configs.p'), "rb") as input_file:
#         return pickle.load(input_file)

# def process_job(job, w):
#     combo = (g0, [Frontier.dummy(p, tp=tp) for p, tp in job], w)
#     result = FragmentGrammar.induceFromFrontiers(*combo)
#     return result

# def save_results(results, path, ppt, i):
#     print('saving!')
#     with open(os.path.join(path, str(ppt)) +'/{}.p'.format(i+1), 'wb') as fp:
#         pickle.dump(results, fp, protocol=pickle.HIGHEST_PROTOCOL)

# def process_ppt(ppt, path):
#     trial_seq = load_data(ppt, path)
#     jobs = [[(towers[tower_scene].original, None) for tower_scene in trial_seq[:i+1]] for i in range(len(trial_seq)+1)]

#     for i, job in enumerate(jobs):
#         print('this job is of length', i+1)
#         with ProcessPool() as pool:
#             results = pool.map(process_job, [job]*len(ws), ws)
#         print(results)
#         save_results(results, path, ppt, i)

# def main():
#     for ppt in range(1, n_ppts+1):
#         process_ppt(ppt, path)

# if __name__ == "__main__":
#     main()


def load_data(ppt, path):
    with open(os.path.join(path, str(ppt), 'configs.p'), "rb") as input_file:
        return pickle.load(input_file)

def process_job(param):
    job, w = param
    combo = (g0, [Frontier.dummy(p, tp=tp) for p, tp in job], w)
    result = FragmentGrammar.induceFromFrontiers(*combo)
    return result

def save_results(results, path, ppt, i):
    print('saving!')
    with open(os.path.join(path, str(ppt)) +'/{}.p'.format(i+1), 'wb') as fp:
        pickle.dump(results, fp, protocol=pickle.HIGHEST_PROTOCOL)

def process_ppt(ppt, path):
    trial_seq = load_data(ppt, path)
    jobs = [[(towers[tower_scene].original, None) for tower_scene in trial_seq[:i+1]] for i in range(len(trial_seq)+1)]

    for i, job in enumerate(jobs):
        print('this job is of length', i+1)
        job_w_combinations = [(job, w) for w in ws]
        with ProcessPool() as pool:
            results = pool.map(process_job, job_w_combinations)
        print(results)
        save_results(results, path, ppt, i)

def main():
    for ppt in range(1, n_ppts+1):
        process_ppt(ppt, path)

if __name__ == "__main__":
    main()
