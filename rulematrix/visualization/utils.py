import os
import time

FRONT_VERSION = '1.0.7'

STATIC_URL = os.path.join(os.path.dirname(__file__), '../static')

_local_urls = {
    'rulematrix': os.path.join(STATIC_URL, 'rulematrix.js'),
    'd3': os.path.join(STATIC_URL, 'd3.min.js'),
    'react': os.path.join(STATIC_URL, 'react.production.min.js'),
    'react-dom': os.path.join(STATIC_URL, 'react-dom.production.min.js'),
    'rulematrix_css': os.path.join(STATIC_URL, 'rulematrix.css'),
}

_remote_urls = {
    'rulematrix': os.path.join(STATIC_URL, 'rulematrix.js'),
    'd3': os.path.join(STATIC_URL, 'd3.min.js'),
    'react': os.path.join(STATIC_URL, 'react.production.min.js'),
    'react-dom': os.path.join(STATIC_URL, 'react-dom.production.min.js'),
    'rulematrix_css': os.path.join(STATIC_URL, 'rulematrix.css'),
}


def get_url(name, remote=False):
    if remote:
        return _remote_urls[name]
    return _local_urls[name]


def get_id(obj, prefix="rm", suffix=""):
    objid = prefix + str(id(obj)) + suffix
    return objid
