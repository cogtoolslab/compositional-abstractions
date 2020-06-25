import numpy as np
import pandas as pd
import os

def zscore(x,mu,sd):
    return (x-mu)/(sd+1e-6)

def standardize(D, dv):
    D2 = pd.DataFrame()
    trial_list = []
    dv_list = []
    rep_list = []
    game_id_list = []
    target_list = []
    condition_list = []
    phase_list = []
    
    grouped = D.groupby('gameID')  
    ## loop through games
    for gamename, group in grouped:
        mu = np.mean(np.array(group[dv]))
        sd = np.std(np.array(group[dv]))        
        ## loop through trials within games        
        trialwise = group.groupby('trialNum')
        for trialname,trial in trialwise:            
            trial_list.append(trialname)
            val = trial[dv].values[0]
            z_score = zscore(val, mu, sd)             
            dv_list.append(z_score)
            rep_list.append(trial['repetition'].values[0])       
            game_id_list.append(gamename)                           
            target_list.append(trial['targetName'].values[0])
            condition_list.append(trial['condition'].values[0])
            phase_list.append(trial['phase'].values[0])            
            
    D2['trialNum'] = trial_list
    D2[dv] = dv_list
    D2['repetition'] = rep_list
    D2['gameID'] = game_id_list
    D2['targetName'] = target_list
    D2['condition'] = condition_list    
    D2['phase'] = phase_list        
    
    return D2

def save_bis(D, csv_dir, iterationName):

    ## convert rep number for post from "1" to "4"
    D.loc[(D['condition']=='control') & (D['repetition']==1),'repetition'] = 3

    z_accuracy = standardize(D, 'rawF1DiscreteScore')
    z_buildTime = standardize(D, 'buildTime')    
    Z = z_accuracy.merge(z_buildTime) ## combine both standardized dataframes
    Z = Z.assign(bis = pd.Series(Z['rawF1DiscreteScore'] - Z['buildTime']))
    Z.to_csv(os.path.join(csv_dir,'block_silhouette_bis_{}.csv'.format(iterationName)),index=False)
    print('Saved BIS dataframe out!')
    return Z
