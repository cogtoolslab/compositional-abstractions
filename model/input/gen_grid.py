'''
Used to generate parameters for run_model.sh, which runs coordinate_DSL_pragmatic_speaker.wppl
'''

import csv
import numpy as np

chainNum = 0
with open('grid_49ppts.csv', 'w') as csv_file :
    writer = csv.writer(csv_file, delimiter=',')
    for alpha in [1, 4, 16, 64] :
        for beta in np.linspace(0, 1, 11) :
            for participantNumber in range(1, 50) :
                writer.writerow([chainNum, round(alpha, 1), round(beta, 1), participantNumber])
                chainNum = chainNum + 1
