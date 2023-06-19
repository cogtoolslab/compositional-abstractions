import pickle5 as pickle
from makeTowerTasks import *
from render import *
import os
import sys
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
import pandas as pd
sns.set()

sys.path.append('..')

def make_dir_if_not_exists(dir_name):   
    if not os.path.exists(dir_name):
        eprint('making dir!')
        os.makedirs(dir_name)

data_path = '/Volumes/Passport/Code/caml/syn/results/2/'
vis_path = './vis2/'


whole = {str(round(w, 1)): [] for w in np.arange(0.0, 10, 0.1)}
for name in range(1, 13):
    with open(data_path+f"{name}.p", "rb") as input_file:
        e = pickle.load(input_file)

    for w in range(len(e)):
        whole[str(round(0.1*w, 1))].append(['1', name, 0.])
        whole[str(round(0.1*w, 1))].append(['2', name, 0.]) 
        whole[str(round(0.1*w, 1))].append(['3', name, 0.]) 
        whole[str(round(0.1*w, 1))].append(['4', name, 0.]) 
        whole[str(round(0.1*w, 1))].append(['5', name, 0.]) 
        whole[str(round(0.1*w, 1))].append(['6', name, 0.]) 
        whole[str(round(0.1*w, 1))].append(['7', name, 0.]) 
        whole[str(round(0.1*w, 1))].append(['8', name, 0.]) 
        whole[str(round(0.1*w, 1))].append(['C', name, 0.])
        whole[str(round(0.1*w, 1))].append(['L', name, 0.]) 
        whole[str(round(0.1*w, 1))].append(['Pi', name, 0.]) 
        whole[str(round(0.1*w, 1))].append(['CL', name, 0.]) 
        whole[str(round(0.1*w, 1))].append(['CPi', name, 0.]) 
        whole[str(round(0.1*w, 1))].append(['LC', name, 0.]) 
        whole[str(round(0.1*w, 1))].append(['LPi', name, 0.]) 
        whole[str(round(0.1*w, 1))].append(['PiC', name, 0.]) 
        whole[str(round(0.1*w, 1))].append(['PiL', name, 0.])

        for item in e[w]:
            if str(item.body) in lookup.keys():
                item = lookup[str(item.body)]
                for t in item:
                    if t.name == 'C': 
                        whole[str(round(0.1*w, 1))][-9][2] += 1.
                    elif t.name == 'L': 
                        whole[str(round(0.1*w, 1))][-8][2] += 1.
                    elif t.name == 'Pi': 
                        whole[str(round(0.1*w, 1))][-7][2] += 1.
                    elif t.name == 'CL': 
                        whole[str(round(0.1*w, 1))][-6][2] += 1.
                    elif t.name == 'CPi': 
                        whole[str(round(0.1*w, 1))][-5][2] += 1.
                    elif t.name == 'LC': 
                        whole[str(round(0.1*w, 1))][-4][2] += 1.
                    elif t.name == 'LPi': 
                        whole[str(round(0.1*w, 1))][-3][2] += 1.
                    elif t.name == 'PiC': 
                        whole[str(round(0.1*w, 1))][-2][2] += 1.
                    elif t.name == 'PiL': 
                        whole[str(round(0.1*w, 1))][-1][2] += 1.
                    elif t.name == '8': 
                        whole[str(round(0.1*w, 1))][-10][2] += 1.
                    elif t.name == '7': 
                        whole[str(round(0.1*w, 1))][-11][2] += 1.
                    elif t.name == '6': 
                        whole[str(round(0.1*w, 1))][-12][2] += 1.
                    elif t.name == '5': 
                        whole[str(round(0.1*w, 1))][-13][2] += 1.
                    elif t.name == '4': 
                        whole[str(round(0.1*w, 1))][-14][2] += 1.
                    elif t.name == '3': 
                        whole[str(round(0.1*w, 1))][-15][2] += 1.
                    elif t.name == '2': 
                        whole[str(round(0.1*w, 1))][-16][2] += 1.
                    elif t.name == '1': 
                        whole[str(round(0.1*w, 1))][-17][2] += 1.

for w, sheet in whole.items():
    # print(w, sheet)
    df = pd.DataFrame(sheet, columns = ['name', 'iter', 'present'])
    # with pd.option_context('display.max_rows', None, 'display.max_columns', None):  # more options can be specified also
    #     print(df)
    df = df.pivot('iter', 'name', 'present')
    ax = sns.heatmap(df)
    plt.savefig(vis_path+'/{}.png'.format(w), format='png')
    plt.close()