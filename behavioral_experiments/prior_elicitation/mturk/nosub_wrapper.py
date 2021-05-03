import os, glob, sys, shutil
import numpy as np
import datetime
import json
import pandas as pd
from pandas.io.json import json_normalize

## to run: python nosub_wrapper.py --sandbox=False --action=status

##### TODO 7/6/18: adapt this to work with nosub b/c it is currently using nosub syntax

if __name__ == '__main__':
    '''
    nosub_wrapper is a way to run nosub multiple times
    to post, download multiple batches of HITs by running
    nosub in separate modular folders.
    
    Each subdir can maintain one hit at a time, with a number of assignments that you define.
    
    '''
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--action', type=str, default='download',
                        help="upload|expire|status|download|approve|reset")
    parser.add_argument('--sandbox', type=str, default="True",
                        help="True if running on sandbox else False")
    parser.add_argument('--app', type=str, default="",
                        help="Name of dallinger app")
    args = parser.parse_args()
    def call_nosub (cmd) :
        os.system("nosub {} {}".format(
            '-p' if args.sandbox=="False" else '',
            cmd
        ))

    assert args.action in ['upload', 'expire', 'download', 'approve', 'reset', 'status']    
    print('Sandbox mode: ' + str(args.sandbox))
    print('Current action is: ' + args.action)
    # # go into each template folder and use nosub to upload
    if args.action == 'upload':
        print('Now trying to upload HITs...')
        call_nosub("upload")
    elif args.action == 'expire':
        print('Now expiring HITs from all batches...')
        call_nosub("expire")
    elif args.action == 'download':
        print('Now trying to download results')
        call_nosub("download --deanonymize")
    elif args.action == 'status':
        print('Now checking the status')
        call_nosub('status')
    elif args.action == 'approve':
        print('generating source from production-data')
        jsons_data = pd.DataFrame(columns=['wID', 'aID', 'bonus'])
        path_to_json = './production-results/'
        json_files = [pos_json for pos_json in os.listdir(path_to_json)
                      if pos_json.endswith('.json')]

        # we need both the json and an index number so use enumerate()
        for index, js in enumerate(json_files):
            with open(os.path.join(path_to_json, js)) as json_file:
                json_text = json.load(json_file)

                # here you need to know the layout of your json and each json has to have
                # the same structure (obviously not the structure I have here)
                wID = json_text['WorkerId']
                aID = json_text['AssignmentId']
                bonus = json_text['answers']['bonus']
                jsons_data.loc[index] = [wID, aID, bonus]

        jsons_data.to_csv('./bonus_source.csv')
        print('Now trying to approve work')
        # try:
        #     cmd = 'python approve-work.py {} --source ./bonus_source.csv'.format(
        #         '-p' if args.sandbox=="False" else ''
        #     )
        #     os.system(cmd)
        # except:
        #     raise
    elif args.action == 'reset':
        curr_time = str(datetime.datetime.now())
        print('Now renaming hit-ids.json to hit-ids_{}.json and moving to hit-ids folder'
              .format(curr_time))
        if not os.path.exists('hit-ids'):
            os.makedirs('hit-ids')
        if args.sandbox=="True":
            os.rename('hit-ids.json','sandbox_hit-ids/hit-ids_{}.json'.format(curr_time))
        elif args.sandbox=="False":
            os.rename('hit-ids.json','hit-ids/hit-ids_{}.json'.format(curr_time))
