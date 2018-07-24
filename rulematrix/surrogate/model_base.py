import dill as pickle

from rulematrix.utils import obj2pkl, assert_file_exists

FILE_EXTENSION = '.mdl'

CLASSIFICATION = 'classification'
REGRESSION = 'regression'


def _format_name(name):
    return "{}{}".format(name, FILE_EXTENSION)


class ModelBase:
    def __init__(self, name):
        self.name = name

    def fit(self, x, y, **kwargs):
        raise NotImplementedError("Base class")

    # def test(self, x, y):
    #     """
    #
    #     :param x:
    #     :param y:
    #     :return: accuracy
    #     """
    #     # raise NotImplementedError("Base class")
    #     return self.evaluate(x, y, stage='test')

    # def evaluate(self, x, y, stage='train'):
    #     raise NotImplementedError("Base class")

    # def predict_prob(self, x):
    #     raise NotImplementedError("Base class")

    def predict(self, x):
        raise NotImplementedError("Base class")

    def score(self, y_true, y_pred):
        raise NotImplementedError("Base class")

    def save(self, filename=None):
        if filename is None:
            filename = _format_name(self.name)
        obj2pkl(self, filename)

    @classmethod
    def load(cls, filename):
        mdl = load_model(filename)
        if isinstance(mdl, cls):
            return mdl
        else:
            raise RuntimeError("The loaded file is not a Tree model!")


def load_model(filename: str) -> ModelBase:
    assert_file_exists(filename)
    with open(filename, "rb") as f:
        mdl = pickle.load(f)
        # assert isinstance(mdl, ModelBase)
        return mdl
