
# nbextension
def _jupyter_nbextension_paths():
    return [dict(section="tree",
                 src="nbextension",
                 dest="notebook_index",
                 require="notebook_index/main")]
