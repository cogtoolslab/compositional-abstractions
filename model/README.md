# Compositional Abstractions Model

This model has two components- library learning and language coordination- which are run in series.

## Library Learning using DreamCoder

`./lib_learning` contains code for learning abstractions. 

Program fragments are extracted with DreamCoder for each set of trials 1 to N-1, for N trials. 
Resulting libraries are stored in `./lib_learning_output/`.

The output of this process is a series of DSLs, one for each trial for each participant.
From these we infer the minimum length program that can be used to express each task.
The input to the language coordination component is a set containing this program, plus a number of longer programs with learned chunks replaced their base DSL equivalents.

Results from this stage are stored in `./language_output/`.


## Language Coordination using WebPPL


### Installation

Install webppl

```
npm install -g webppl
```

Install [webppl-json](https://github.com/stuhlmueller/webppl-json) package

```
mkdir -p ~/.webppl
npm install --prefix ~/.webppl webppl-json
```

### Running

Run

Stand alone:
```
webppl coordinate_DSL.wppl --require webppl-json
```

Batch:
```
cd input
python gen_grid.py
cd ..
run_model.sh
```

Results from this stage are stored in `language_output`