import csv
import numpy as np

chainNum = 0
with open('grid.csv', 'w') as csv_file :
    writer = csv.writer(csv_file, delimiter=',')
    for alpha in [1, 4, 16, 64] :
        for beta in np.linspace(0, 1, 11) :
            writer.writerow([chainNum, round(alpha, 1), round(beta, 1)])
            chainNum = chainNum + 1
