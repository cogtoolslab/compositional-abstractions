# To run this script, paste the following line:
# parallel --bar --colsep ',' "sh ./run_model.sh {1} {2} {3}" :::: input/grid.csv
webppl coordinate_DSL_pragmatic_speaker.wppl --require webppl-json --require webppl-csv -- --numIterations=100 --chainNum=$1 --alpha=$2 --beta=$3 --participantNumber=$4
