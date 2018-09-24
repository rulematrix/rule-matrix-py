import numpy as np

try:
    from mdlp.discretization import MDLP
except ImportError as e:
    print("Install mdlp-discretization to enable MDLP discretizer!")
    raise e


def get_discretizer(method='mdlp', *args, **kwargs):
    if method == 'mdlp':
        return MDLP(*args, **kwargs)
    else:
        raise ValueError("Not supporting method %s" % method)


def compute_mdlp_all_intervals(mdlp_discretizer):
    category_names = []
    for i, cut_points in enumerate(mdlp_discretizer.cut_points_):
        if cut_points is None:
            category_names.append(None)
            continue
        idxs = np.arange(len(cut_points) + 1)
        names = mdlp_discretizer.assign_intervals(idxs, i)
        category_names.append(names)
    return category_names
