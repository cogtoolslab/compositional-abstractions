import numpy as np
import pandas as pd
import boto3
import xmltodict
import csv
import os
import argparse

from botocore.exceptions import ClientError

# looks for a credentials.py defining the ACCESS_ID and SECRET_KEY
import credentials

# parse args
parser = argparse.ArgumentParser()
parser.add_argument('--source', type=str)
parser.add_argument('--production', '-p', action='store_true',
                    help="mimicks nosub convention for running on production")
args = parser.parse_args()
MTURK_SANDBOX = 'https://mturk-requester-sandbox.us-east-1.amazonaws.com'
MTURK_PROD = 'https://mturk-requester.us-east-1.amazonaws.com'

class Bonuser :
    def __init__(self, client) :
        self.client = client
        self.bonus_target_file = os.path.join('bonus', 'already_bonused.csv')
        self.bonus_multiplier = 1
        self.reason = (
            "Thanks for participating, here's your bonus!" \
            "Send us an email at hawkrobe@gmail.com if you have any questions."
        )
        self.setup_files()

    def setup_files (self) :
        """ prepare filesystem with a bonus subfolder """
        if not os.path.exists('bonus'):
            os.makedirs('bonus')

        if not os.path.exists(self.bonus_target_file) :
            with open(self.bonus_target_file, 'w') as f:
                fieldnames = ['wID', 'aID', 'bonus']                    
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()

        self.already_bonused_df = pd.read_csv(self.bonus_target_file)

    def check_already_bonused (self, info) :
        df = self.already_bonused_df[['wID', 'aID']]
        a = np.array([info['wID'], info['aID']])
        return (df == a).all(1).any()

    def assign_qualification(self, wID) :
        self.client.associate_qualification_with_worker(
            QualificationTypeId=("3TDQPWMDS7OUWE8HQKH6O5MTD5GNA0"
                                 if args.production
                                 else "3VSNMHAUD85G7UYCZW8T6UPBSVHYRX"),
            WorkerId=wID,
            SendNotification=False
        )
        
    def handle_assignment(self, info) :
        # self.assign_qualification(info['wID'])
        self.client.send_bonus(
            WorkerId = info['wID'],
            BonusAmount = str(round(info['bonus'], 2)),
            AssignmentId = info['aID'],
            Reason = self.reason
        )
        self.record_bonus(info)

    def record_bonus (self, info):
        """ append newly bonused workers to master list """
        print("Granting bonus of {} to {}".format(info['bonus'], info['aID']))
        with open(self.bonus_target_file, 'a') as f:
            writer = csv.writer(f)
            writer.writerow([info['wID'], info['aID'], info['bonus']])

# Define client with credentials and initialize bonuser
client = boto3.client(
    'mturk',
    aws_access_key_id = credentials.ACCESS_ID,
    aws_secret_access_key = credentials.SECRET_KEY,
    region_name = 'us-east-1',
    endpoint_url = MTURK_PROD if args.production else MTURK_SANDBOX
)
bonuser = Bonuser(client)
source = pd.read_csv(args.source)

for i, row in source.iterrows() :
    if not bonuser.check_already_bonused(row) and float(row['bonus']) > 0:
        try :
            assert float(row['bonus']) < 4
            print('would bonus', row['wID'], ' $', row['bonus'])
            bonuser.handle_assignment(row)
        except ClientError as e:
            print("failed to bonus row: {}".format(row))
            print("unexpected error: {}".format(e))
