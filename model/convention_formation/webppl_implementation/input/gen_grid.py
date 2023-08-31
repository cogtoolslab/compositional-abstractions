'''
Used to generate parameters for run_model.sh, which runs coordinate_DSL_pragmatic_speaker.wppl
'''

import csv
import numpy as np

chainNum = 0
with open('grid_49ppts.csv', 'w') as csv_file :
    writer = csv.writer(csv_file, delimiter=',')
    for alpha in [5] :
        for beta in np.linspace(0, .5, 6) :
            for epsilon in np.linspace(0.001, .1, 5) :
                for modelType in ['full', 'noDSL', 'noConvention']:
                    for pid in range(1, 50) :
                        writer.writerow([chainNum, round(alpha, 1), round(beta, 2), round(epsilon,3), pid, modelType])
                        chainNum = chainNum + 1
