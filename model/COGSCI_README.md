# Compositional Abstractions Model (COGSCI 2021)

This model has two components- library learning and language coordination- which are run in series.


## Library Learning using DreamCoder

`./lib_learning` contains code for learning abstractions. 

Program fragments are extracted with DreamCoder for each set of trials 1 to N-1, for N trials. 
Resulting libraries are stored in `./results/revised`.

Libraries trained on trials 1-N are then used to define minimum length program for trial N, in `cogsci21_program_enumeration.ipynb`.
We enumerate programs. 
In some cases, particularly where few abstractions are learned, this is unsucessful. In these cases, we swap in abstractions learned into the original programs fed into DreamCoder.
Results from this stage are stored in `./lib_learning_output`


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