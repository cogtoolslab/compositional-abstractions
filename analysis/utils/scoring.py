import numpy as np
import pandas as pd
import os
import json

target_maps = {}

# with open(os.path.abspath('../results/csv/targetMaps.txt')) as json_file:
#     target_maps = json.load(json_file)

def get_precision(arr1,arr2):
    prod = np.multiply(arr1,arr2)
    false_pos = np.subtract(arr2,prod)
    numerator = np.sum(prod)
    denominator = np.add(numerator,np.sum(false_pos))
    recall = numerator/denominator
    return recall

def get_recall(arr1,arr2):
    prod = np.multiply(arr1,arr2)
    false_neg = np.subtract(arr1,prod)
    numerator = np.sum(prod)
    denominator = np.add(np.sum(prod),np.sum(false_neg))
    recall = numerator/denominator
    return recall

# def get_f1_score(targetName, discreteWorld):
#     targetMap = targetMaps[targetName]
#     arr1 = 1*np.logical_not(np.array(targetMap))
#     arr2 = 1*np.logical_not(np.array(discreteWorld))
#     recall = get_recall(arr1, arr2)
#     precision = get_precision(arr1, arr2)
#     numerator = np.multiply(precision, recall)
#     denominator = np.add(precision, recall)
#     quotient = np.divide(numerator, denominator)
#     f1Score = np.multiply(2, quotient)
#     #print('recall ' + recall);
#     return f1Score

def get_f1_score(arr1, arr2):
    recall = get_recall(arr1, arr2)
    precision = get_precision(arr1, arr2)
    numerator = np.multiply(precision, recall)
    denominator = np.add(precision, recall)
    if (denominator>0):
        quotient = np.divide(numerator, denominator)
        f1Score = np.multiply(2, quotient)
    else:
        f1Score = 0
    #print('recall ' + recall);
    return f1Score

# def get_f1_score_lambda(row):
#     target_map = 1*np.logical_not(np.array(target_maps[row['targetName']]))
#     discrete_world = row['discreteWorld']
#     return(get_f1_score(target_map, discrete_world))

def get_jaccard(arr1, arr2):
    prod = np.multiply(arr1,arr2)
    true_pos = np.sum(prod)
    false_pos = np.sum(np.subtract(arr2,prod))
    false_neg = np.sum(np.subtract(arr1,prod))
    
    denomenator = np.add(false_neg,np.add(false_pos,true_pos))
    jaccard = np.nan
    if denomenator > 0:
        jaccard = np.divide(true_pos,denomenator)
    return jaccard


# def getJaccard(targetName, discreteWorld):
#     targetMap = targetMaps[targetName]
#     arr1 = 1*np.logical_not(np.array(targetMap))
#     arr2 = 1*np.logical_not(np.array(discreteWorld))
    
#     prod = np.multiply(arr1,arr2)
#     true_pos = np.sum(prod)
#     false_pos = np.sum(np.subtract(arr2,prod))
#     false_neg = np.sum(np.subtract(arr1,prod))
# #     print(true_pos)
# #     print(false_pos)
# #     print(false_neg)

#     denomenator = np.add(false_neg,np.add(false_pos,true_pos))
#     jaccard = np.divide(true_pos,denomenator)
#     #print('recall ' + recall);
#     return jaccard


# def get_jaccard_lambda(row):
#     return(getJaccard(row['targetName'], row['discreteWorld']))

# def getNullScore(targetName):
#     targetMap = targetMaps[targetName]
#     arr1 = 1*np.logical_not(np.array(targetMap))
#     arr2 = 1*np.zeros(arr1.shape)
#     recall = getRecall(arr1, arr2)
#     precision = getPrecision(arr1, arr2)
#     numerator = np.multiply(precision, recall)
#     denominator = np.add(precision, recall)
#     quotient = np.divide(numerator, denominator)
#     f1Score = np.multiply(2, quotient)
#     print('recall ', str(recall));
#     print('precision ', str(precision));
#     print('quotient ', str(quotient));
#     return f1Score