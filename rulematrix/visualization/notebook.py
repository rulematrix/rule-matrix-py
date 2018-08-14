"""
Embed visualizations in Jupyter Notebook
"""

from rulematrix.surrogate import Surrogate


def show(surrogator, **kwargs):
    pass


def enable_notebook_auto_display():
    try:
        from IPython.core.getipython import get_ipython
    except ImportError as e:
        print('Install ipython to use this function')
        raise e

    ipy = get_ipython()
    if ipy is None:
        raise ValueError("No ipython shell running!")


def prepare_html(surrogator, dataset):
    pass
