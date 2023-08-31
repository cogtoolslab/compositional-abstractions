# To run this script, paste the following line into terminal:
# parallel --bar --colsep ',' "sh ./run_model.sh {1} {2} {3} {4} {5} {6}" :::: input/grid_49ppts.csv
webppl dual_coordination.wppl --require webppl-json --require webppl-csv -- --numIterations=1 --chainNum=$1 --alpha=$2 --beta=$3 --epsilon=$4 --participantNumber=$5 --modelType=$6
