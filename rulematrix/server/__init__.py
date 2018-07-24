try:
    import flask
except ImportError as e:
    print("Install flask to enable the server function!")
    raise e

from rulematrix.server.model_cache import get_model, available_models, get_model_data
from rulematrix.server.app import app, HashableList
from rulematrix.server.routes import *
