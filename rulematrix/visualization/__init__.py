IPYTHON_VERSION = None
try:
    import IPython
    IPYTHON_VERSION = IPython.__version__
except ImportError:
    raise
