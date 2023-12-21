import json
from pathlib import Path

def _jupyter_labextension_paths():
    return [{
        "src": "labextension",
        "dest": "lc_index"
    }]

# nbextension
def _jupyter_nbextension_paths():
    return [dict(
        section="tree",
        src="nbextension",
        dest="lc_index",
        require="lc_index/main")]
