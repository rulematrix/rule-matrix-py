import os
from collections import OrderedDict
import warnings
from . import IPYTHON_VERSION
from .. import __version__

# Use the versioned_name in case of js updates
VERSIONED_NAME = 'rulematrix.v' + __version__

STATIC_LOCAL_URL = '/nbextensions/' + VERSIONED_NAME + '/'
STATIC_DIR = os.path.relpath(os.path.join(os.path.dirname(__file__), '../static'))

_local_urls = OrderedDict([
    ('rulematrix', 'rulematrix.development.js'),
    ('d3', 'd3.min.js'),
    ('react', 'react.production.min.js'),
    ('react-dom', 'react-dom.production.min.js'),
    ('rulematrix_css', 'rulematrix.development.css'),
])

_dev_remote_urls = {
    'rulematrix': 'https://rawgit.com/rulematrix/rule-matrix-py/master/rulematrix/static/rulematrix.development.js',
    'd3': 'https://cdnjs.cloudflare.com/ajax/libs/d3/4.12.0/d3.js',
    'react': 'https://cdnjs.cloudflare.com/ajax/libs/react/16.2.0/umd/react.production.min.js',
    'react-dom': 'https://cdnjs.cloudflare.com/ajax/libs/react-dom/16.2.0/umd/react-dom.production.min.js',
    'rulematrix_css': 'https://rawgit.com/rulematrix/rule-matrix-py/master/rulematrix/static/rulematrix.development.css',
}

_remote_urls = _dev_remote_urls


def get_url(name, remote=False, root_url=None):
    if remote:
        return _remote_urls[name]
    if root_url is None:
        return STATIC_LOCAL_URL + _local_urls[name]
    return root_url + _local_urls[name]


def get_id(obj, prefix="rm", suffix=""):
    objid = prefix + str(id(obj)) + suffix
    return objid


def install_static(local_path=None, target_name=None, overwrite=False):
    """
    Write the javascript libraries to the given location.
    This utility is used by the IPython notebook tools to enable easy use
    of pyLDAvis with no web connection.
    Parameters
    ----------
    local_path: string (optional)
        the path to a file or a directory
    target_name: string (optional)
        the name of the target file or directory
    overwrite: boolean (optional)
        whether to overwrite if existing file or directory exists
    Returns
    -------
    The urls of the local_files
    """
    if IPYTHON_VERSION is None or IPYTHON_VERSION[0] < '2':
        raise ModuleNotFoundError('IPython with version larger than 2.0 need to be installed!')
    if IPYTHON_VERSION[0] > '3':
        from notebook.nbextensions import install_nbextension, check_nbextension
    else:
        from IPython.html.nbextensions import install_nbextension, check_nbextension

    if local_path is None:
        local_path = STATIC_DIR
        target_name = VERSIONED_NAME
    if target_name is None:
        target_name = os.path.basename(local_path)

    if not os.path.exists(local_path):
        raise ValueError('%s not found at %s' % (target_name, local_path))

    if check_nbextension([target_name]):
        if overwrite:
            warnings.warn("Extension %s already exists. Overwriting..." % target_name)
        else:
            # skipping
            return '/nbextensions/' + target_name
    else:
        full_url = install_nbextension(local_path, overwrite=overwrite, destination=target_name)
        print(full_url)
    return '/nbextensions/' + target_name
