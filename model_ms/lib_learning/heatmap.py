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
        os.makedirs(dir_name)

data_path = './results/'
vis_path = './vis/'

with open(data_path+"configs.p", "rb") as input_file:
    configs = pickle.load(input_file)
eprint('this is configs:', configs, '\n')
exit()
whole = {str(round(w, 1)): [] for w in np.arange(0.0, 10, 0.1)}
for name in range(1, 13):
    dir_name = vis_path+f"{name}/"
    # make_dir_if_not_exists(dir_name)
    # eprint(configs[:name], '\n')
    with open(data_path+f"{name}.p", "rb") as input_file:
        e = pickle.load(input_file)

    for w in range(len(e)):
        # print('this is w:', w)
        # if name == 2:
        #     print('1')
        #     print(whole)
        whole[str(round(0.1*w, 1))].append(['C', name, 0.])
        whole[str(round(0.1*w, 1))].append(['L', name, 0.]) 
        whole[str(round(0.1*w, 1))].append(['Pi', name, 0.]) 
        whole[str(round(0.1*w, 1))].append(['CL', name, 0.]) 
        whole[str(round(0.1*w, 1))].append(['CPi', name, 0.]) 
        whole[str(round(0.1*w, 1))].append(['LC', name, 0.]) 
        whole[str(round(0.1*w, 1))].append(['LPi', name, 0.]) 
        whole[str(round(0.1*w, 1))].append(['PiC', name, 0.]) 
        whole[str(round(0.1*w, 1))].append(['PiL', name, 0.])
        # if name == 2:
        #     print('2')
        #     print(whole)
        for item in e[w]:
            if str(item.body) in lookup.keys():
                t = lookup[str(item.body)]
                if t.name == 'C': 
                    whole[str(round(0.1*w, 1))][-9][2] = 1.
                elif t.name == 'L': 
                    whole[str(round(0.1*w, 1))][-8][2] = 1.
                elif t.name == 'Pi': 
                    whole[str(round(0.1*w, 1))][-7][2] = 1.
                elif t.name == 'CL': 
                    whole[str(round(0.1*w, 1))][-6][2] = 1.
                elif t.name == 'CPi': 
                    whole[str(round(0.1*w, 1))][-5][2] = 1.
                elif t.name == 'LC': 
                    whole[str(round(0.1*w, 1))][-4][2] = 1.
                elif t.name == 'LPi': 
                    whole[str(round(0.1*w, 1))][-3][2] = 1.
                elif t.name == 'PiC': 
                    whole[str(round(0.1*w, 1))][-2][2] = 1.
                elif t.name == 'PiL': 
                    whole[str(round(0.1*w, 1))][-1][2] = 1.
                # t.exportImage(new_dir_name+"learned_%d.png"%(i+1), drawHand=False)
    # if name == 2:
    #     print('3')
    #     print(whole)
    #     exit()
    # eprint('\n\n')

# print(whole)
for w, sheet in whole.items():
    # print(w, sheet)
    df = pd.DataFrame(sheet, columns = ['name', 'iter', 'present'])
    # with pd.option_context('display.max_rows', None, 'display.max_columns', None):  # more options can be specified also
    #     print(df)
    df = df.pivot('iter', 'name', 'present')
    ax = sns.heatmap(df)
    plt.savefig(vis_path+'/{}.png'.format(w), format='png')
    plt.close()
# whole = np.array(np.flip(whole, 1)).T
# df = pd.DataFrame(whole, columns =['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],index=[str(i+1) for i in reversed(range(100))])  
# sns.heatmap(df, cmap="YlGnBu")
# plt.savefig(vis_path+'heatmap.png', format='png')
# plt.close()
