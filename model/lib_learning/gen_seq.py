from numpy.random import permutation
from itertools import combinations

def get_trial_seq (towers) :
    # randomize initial order of towers in scenes
    combos = [list(permutation(combo)) for combo in combinations(towers, 2)]
    seq = []
    for rep in range(4) :
        for combo in permutation(combos) :
            if rep % 2 == 0 :
                seq.append(''.join(list(combo)))
            else :
                seq.append(''.join(list(combo[::-1])))

    return seq

# print(get_trial_seq(["L", "C", "Pi"]))
