
if __name__ == "__main__":
    
    from towerPrimitives import primitives
    from makeTowerTasks import *
    from grammar import *
    from fragmentGrammar import *
    from gen_seq import *
    from utilities import *
    import numpy as np
    import pickle

    # blocks move along by 'teeth'- two per grid square. 
    # vertical blocks are placed with bottom right peg of block on current position
    # horizontal blocks are placed with bottom second-from-right peg of block on current position
    towers = dict(C = SupervisedTower("C", "(h (l 1) v v (r 1) h)"),
                    L = SupervisedTower("L", "(h (l 4) h (l 1) v v)"),
                    Pi = SupervisedTower("Pi", "(v (r 6) v (l 5) h (r 4) h)"),
                    CL = SupervisedTower("CL", "(h (l 1) v v (r 1) h (r 12) h (l 4) h (l 1) v v)"),
                    CPi = SupervisedTower("CPi", "(h (l 1) v v (r 1) h (r 6) v (r 6) v (l 5) h (r 4) h)"),
                    LPi = SupervisedTower("LPi", "(h (l 4) h (l 1) v v (r 9) v (r 6) v (l 5) h (r 4) h)"),
                    LC = SupervisedTower("LC", "(h (l 4) h (l 1) v v (r 12) h (l 1) v v (r 1) h)"),
                    PiC = SupervisedTower("PiC", "(v (r 6) v (l 5) h (r 4) h (r 7) h (l 1) v v (r 1) h)"),
                    PiL = SupervisedTower("PiL", "(v (r 6) v (l 5) h (r 4) h (r 9) h (l 4) h (l 1) v v)"))
    # configs = get_trial_seq(["L", "C", "Pi"])
    # primitives = primitives
    # g0 = Grammar.uniform(primitives, continuationType=ttower)
    # # prims = [p for _, _, p in g0.productions]
    # scope = list(np.arange(0.0, 10, 0.1))
    # path = '/mnt/pentagon/haw027/caml/'

    # with open(path+'configs.p', 'wb') as fp:
    #     pickle.dump(configs, fp, protocol=pickle.HIGHEST_PROTOCOL)

    # # with open(path+"configs.p", "rb") as input_file:
    # #         configs = pickle.load(input_file)
    # jobs = []
    # for i in range(len(configs)+1):
    #     job = []
    #     for config in configs[:i+1]:
    #         job.append((towers[config].original, None))
    #     jobs.append(job)

    # for i, job in enumerate(jobs):
    #     print('this job is of length', i+1)
    #     combo = [(g0, [Frontier.dummy(p, tp=tp) for p, tp in job], w) for w in scope]
    #     CPUs = 8
    #     eprint('this is len:', CPUs)
    #     results = parallelMap(CPUs, lambda param: FragmentGrammar.induceFromFrontiers(param[0], param[1], param[2]), combo)
    #     print('saving!')
    #     with open(path+'{}.p'.format(i+1), 'wb') as fp:
    #         pickle.dump(results, fp, protocol=pickle.HIGHEST_PROTOCOL)


    g0 = Grammar.uniform(primitives, continuationType=ttower)
    ws = [1.5, 3.2, 3.3, 9.6]
    path = './model/lib_learning/dsls/'

    ppt = 1

    with open(os.path.join(path, str(ppt), 'configs.p'), "rb") as input_file:
            trial_seq = pickle.load(input_file)

    jobs = []
    for i in range(len(trial_seq)+1):
        job = []
        for tower_scene in trial_seq[:i+1]:
            job.append((towers[tower_scene].original, None))
        jobs.append(job)

    for i, job in enumerate(jobs):
        print('this job is of length', i+1)
        combo = [(g0, [Frontier.dummy(p, tp=tp) for p, tp in job], w) for w in ws]
        CPUs = 8 # currently not working with >1 cpu.
        eprint('this is len:', CPUs)
        # print(combo[0])
        results = parallelMap(CPUs, lambda param: FragmentGrammar.induceFromFrontiers(param[0], param[1], param[2]), combo)
        print('saving!')
        with open(os.path.join(path, str(ppt)) +'/{}.p'.format(i+1), 'wb') as fp:
            pickle.dump(results, fp, protocol=pickle.HIGHEST_PROTOCOL)