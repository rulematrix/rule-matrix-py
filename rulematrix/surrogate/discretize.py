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
