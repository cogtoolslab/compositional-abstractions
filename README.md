# Learning to communicate about shared procedural abstractions

See [tutorial](https://github.com/cogtoolslab/compositional-abstractions-tutorial) for a pedagogical walkthrough of our analysis and modeling pipeline.

## Paired building task

<p style="font-size: smaller;">
  <img width="70%" alt="task schematic" src="https://github.com/cogtoolslab/compositional-abstractions/assets/5262024/650adfb9-072e-4623-8551-dceb14974ea4">
</p>

## Tasks

* Paired building experiment: `tasks/paired_building`
* Annotation task to tag referring expressions: `tasks/annotation`

## Model

* Library learning component: `model/lib_learning`
* Convention formation component: `model/convention_formation`

See `./model/README.md` for more details


## To run analysis scripts

1. Clone this repo.
2. Setup virtualenv
   1. Create a virtual env: `python3 -m venv comp_abs`
   2. Activate it: `source comp_abs/bin/activate`
   3. Install dependencies: `pip install -r requirements.txt`
   4. Install new kernel for jupyter notebook  `python -m ipykernel install --user --name=comp_abs`
   5. In the directory for this project run `jupyter notebook` > change kernel to `comp_abs`.
3. Open /analysis/paired_building/analyses.ipynb
