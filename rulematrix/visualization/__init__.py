import warnings

IPYTHON_VERSION = None

try:
    import IPython
    IPYTHON_VERSION = IPython.__version__
except ImportError:
    warnings.warn('The visualization package only works under IPython/Jupyter notebook! Try install them first')
