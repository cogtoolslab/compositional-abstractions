import pickle5 as pickle
from makeTowerTasks import *
from render import *
import os
import sys
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import pandas as pd
import re
sns.set()

sys.path.append('..')

def sorted_alphanumeric(data):
    convert = lambda text: int(text) if text.isdigit() else text.lower()
    alphanum_key = lambda key: [ convert(c) for c in re.split('([0-9]+)', key) ] 
    return sorted(data, key=alphanum_key)

def get_freq(chunk):
    pair = 0
    tower = 0
    frag = 0
    for item in chunk:
        if str(item.body) in lookup.keys():
            item = lookup[str(item.body)]
            for t in item:
                if t.name == 'C': 
                    tower += 1.
                elif t.name == 'L': 
                    tower += 1.
                elif t.name == 'Pi': 
                    tower += 1.
                elif t.name == 'CL': 
                    pair += 1.
                elif t.name == 'CPi': 
                    pair += 1.
                elif t.name == 'LC': 
                    pair += 1.
                elif t.name == 'LPi': 
                    pair += 1.
                elif t.name == 'PiC': 
                    pair += 1.
                elif t.name == 'PiL': 
                    pair += 1.
                elif t.name == '8': 
                    frag += 1.
                elif t.name == '7': 
                    frag += 1.
                elif t.name == '6': 
                    frag += 1.
                elif t.name == '5': 
                    frag += 1.
                elif t.name == '4': 
                    frag += 1.
                elif t.name == '3': 
                    frag += 1.
                elif t.name == '2': 
                    frag += 1.
                elif t.name == '1': 
                    frag += 1.
    norm = frag+tower+pair
    if norm == 0:
        return 0, 0, 0
    return frag/norm, tower/norm, pair/norm

path = '/Volumes/Passport/Code/caml/syn/results/revised/'

ffrags_low_mean = []
ffrags_med_mean = []
ffrags_high_mean = []
ttowers_low_mean = []
ttowers_med_mean = []
ttowers_high_mean = []
ppairs_low_mean = []
ppairs_med_mean = []
ppairs_high_mean = []

lst = sorted_alphanumeric(os.listdir(path))
for dirname in lst:
    ffrags_low = []
    ffrags_med = []
    ffrags_high = []
    ttowers_low = []
    ttowers_med = []
    ttowers_high = []
    ppairs_low = []
    ppairs_med = []
    ppairs_high = []

    data_path = path + dirname + '/'
    # print(data_path)
    for name in range(1, 13):
        with open(data_path+f"{name}.p", "rb") as input_file:
            e = pickle.load(input_file)

        for i, w in enumerate(range(len(e))):
            if i == 0:
                frag, tower, pair = get_freq(e[w])
                ffrags_low.append(frag)
                ttowers_low.append(tower)
                ppairs_low.append(pair)
            elif i == 1:
                frag, tower, pair = get_freq(e[w])
                ffrags_med.append(frag)
                ttowers_med.append(tower)
                ppairs_med.append(pair)
            elif i == 3:
                frag, tower, pair = get_freq(e[w])
                ffrags_high.append(frag)
                ttowers_high.append(tower)
                ppairs_high.append(pair)
    ffrags_low_mean.append(ffrags_low)
    ffrags_med_mean.append(ffrags_med)
    ffrags_high_mean.append(ffrags_high)
    ttowers_low_mean.append(ttowers_low)
    ttowers_med_mean.append(ttowers_med)
    ttowers_high_mean.append(ttowers_high)
    ppairs_low_mean.append(ppairs_low)
    ppairs_med_mean.append(ppairs_med)
    ppairs_high_mean.append(ppairs_high)

for i, item in enumerate(ffrags_low_mean):
    if i == 15 or i == 17 or i == 22 or i == 30 or i == 32 or i == 36:
        print(item)
print("***********************************************")
for i, item in enumerate(ttowers_low_mean):
    if i == 15 or i == 17 or i == 22 or i == 30 or i == 32 or i == 36:
        print(item)
print("***********************************************")
for i, item in enumerate(ppairs_low_mean):
    if i == 15 or i == 17 or i == 22 or i == 30 or i == 32 or i == 36:
        print(item)
print("***********************************************")
print("***********************************************")
for item in ffrags_high_mean:
    print(item)
print("***********************************************")
for item in ttowers_high_mean:
    print(item)
print("***********************************************")
for item in ppairs_high_mean:
    print(item)
print("***********************************************")
ffrags_low_mean = np.array(ffrags_low_mean)
ffrags_med_mean = np.array(ffrags_med_mean)
ffrags_high_mean = np.array(ffrags_high_mean)
ttowers_low_mean = np.array(ttowers_low_mean)
ttowers_med_mean = np.array(ttowers_med_mean)
ttowers_high_mean = np.array(ttowers_high_mean)
ppairs_low_mean = np.array(ppairs_low_mean)
ppairs_med_mean = np.array(ppairs_med_mean)
ppairs_high_mean = np.array(ppairs_high_mean)

ffrags_low = ffrags_low_mean.mean(axis=0)
ffrags_med = ffrags_med_mean.mean(axis=0)
ffrags_high = ffrags_high_mean.mean(axis=0)
ttowers_low = ttowers_low_mean.mean(axis=0)
ttowers_med = ttowers_med_mean.mean(axis=0)
ttowers_high = ttowers_high_mean.mean(axis=0)
ppairs_low = ppairs_low_mean.mean(axis=0)
ppairs_med = ppairs_med_mean.mean(axis=0)
ppairs_high = ppairs_high_mean.mean(axis=0)

df_const = np.array([ffrags_high, ffrags_med, ffrags_low])
df_one = np.array([ttowers_high, ttowers_med, ttowers_low])
df_two = np.array([ppairs_high, ppairs_med, ppairs_low])

xticks = ['high', 'med', 'low']
with sns.axes_style("white"):
    sns.set_style("ticks")
    sns.set_context("talk")        

    # plot details
    bar_width = 0.25
    two_bar_positions = np.arange(3)
    one_bar_positions = two_bar_positions + bar_width
    const_bar_positions = one_bar_positions + bar_width

    rgba_colors_const = np.zeros((3,4))
    rgba_colors_const[:,0] = 1.0
    rgba_colors_one = np.zeros((3,4))
    rgba_colors_one[:,1] = 0.5019607843137255
    rgba_colors_two = np.zeros((3,4))
    rgba_colors_two[:,2] = 1.0

    for i in range(12):
        rgba_colors_const[:, 3] = df_const[:,i]
        rgba_colors_one[:, 3] = df_one[:,i]
        rgba_colors_two[:, 3] = df_two[:,i]
        const_labels = [str(x) for x in rgba_colors_const]
        one_labels = [str(x) for x in rgba_colors_one]
        two_labels = [str(x) for x in rgba_colors_two]

        const_bar = plt.barh(const_bar_positions, [1, 1, 1], bar_width,
                                color=rgba_colors_const,
                                left=i*1,
                                tick_label=const_labels)
        for j, p in enumerate(const_bar.patches):
            if rgba_colors_const[j][3]>=0.6:
                clr = 'white'
            else:
                clr = 'black'
            plt.text(p.get_x()+0.5*p.get_width(),p.get_y()+0.5*p.get_height(),str(round(rgba_colors_const[j][3],2)),color=clr,ha='center', va='center', fontsize=12.5)
        one_bar = plt.barh(one_bar_positions, [1, 1, 1], bar_width,
                                color=rgba_colors_one,
                                left=i*1,
                                tick_label=one_labels)
        for j, p in enumerate(one_bar.patches):
            if rgba_colors_one[j][3]>=0.6:
                clr = 'white'
            else:
                clr = 'black'
            plt.text(p.get_x()+0.5*p.get_width(),p.get_y()+0.5*p.get_height(),str(round(rgba_colors_one[j][3],2)),color=clr,ha='center', va='center', fontsize=12.5)
        two_bar = plt.barh(two_bar_positions, [1, 1, 1], bar_width,
                                color=rgba_colors_two,
                                left=i*1,
                                tick_label=two_labels)
        for j, p in enumerate(two_bar.patches):
            if rgba_colors_two[j][3]>=0.6:
                clr = 'white'
            else:
                clr = 'black'
            plt.text(p.get_x()+0.5*p.get_width(),p.get_y()+0.5*p.get_height(),str(round(rgba_colors_two[j][3],2)),color=clr,ha='center', va='center', fontsize=12.5)
    plt.yticks(one_bar_positions, xticks)
    plt.xticks(np.arange(0.5, 12, step=1), [x for x in np.arange(1, 13, step=1)])
    plt.xlabel('trial num')
    plt.ylabel('cost of learning')
    const_patch = mpatches.Patch(color='red', label='const')
    one_patch = mpatches.Patch(color='green', label='one')
    two_patch = mpatches.Patch(color='blue', label='two')
    # plt.legend(handles=[const_patch, two_patch, one_patch], bbox_to_anchor=(.91, .55))
    sns.despine()  
    plt.show()
#     plt.savefig('/Users/cogtoolslab/Desktop/fig.pdf')