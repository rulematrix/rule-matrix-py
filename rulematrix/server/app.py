import numpy as np
from flask import Flask, json

from rulematrix.server.utils import get_path

# path = get_path('frontend/dist/static', absolute=True)
# print("Static folder: {:s}".format(path))


class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return json.JSONEncoder.default(self, obj)


class HashableList(list):
    def __hash__(self):
        # l = [e if hasattr(e, '__hass__') else frozenset(e) for e in self]
        return hash(json.jsonify(self))


app = Flask(__name__)

app.config['FRONT_END_ROOT'] = get_path('front-end/build', absolute=True)
app.config['STATIC_FOLDER'] = get_path('front-end/build/static', absolute=True)

# This will make life easier when we have np.ndarray in the object to be jsonified
app.json_encoder = NumpyEncoder

