import time
import logging

from rulematrix import Config
from rulematrix.core import ModelInterface, load_model, FILE_EXTENSION
from rulematrix.server.utils import json2dict


logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


def model_name2file(model_name):
    return Config.get_path(Config.model_dir(), model_name + FILE_EXTENSION)


class ModelCache:
    """A wrapper that """

    def __init__(self):
        # self.name2file = {}
        self.cache = {}
        self.model2dataset = {}

    def init(self, config_path=None):
        if config_path is None:
            config_path = Config.config_dir()
        config = json2dict(config_path)
        if 'models' in config:
            for model_config in config['models']:
                self.model2dataset[model_config['model']] = model_config['dataset']
        # print(path)
        return self

    def load_model(self, model_name):
        filename = model_name2file(model_name)
        print('Loading model {} from {}'.format(model_name, filename))
        start = time.time()
        model = load_model(filename)
        if isinstance(model, ModelInterface):
            self.cache[model_name] = model
            print('Model {} loaded. Total time {:.4f}s'.format(model_name, time.time() - start))
            return model
        else:
            raise RuntimeError("Mal-format! Cannot load model file {}!".format(filename))

    def get_model(self, model_name):
        if model_name in self.cache:
            return self.cache[model_name]
        return self.load_model(model_name)

    def get_model_data(self, model_name: str):
        if model_name in self.model2dataset:
            return self.model2dataset[model_name]
        # try:
        print("Try find model data name by parsing the model_name")
        specs = model_name.split('-')
        if specs[1] == 'surrogate':
            return specs[2]
        else:
            return specs[0]


_cache = ModelCache().init()


def get_model(model_name):
    return _cache.get_model(model_name)


def available_models():
    return list(_cache.model2dataset.keys())


def get_model_data(model_name):
    return _cache.get_model_data(model_name)


def register_model_dataset(model_name, dataset):
    _cache.model2dataset[model_name] = dataset
