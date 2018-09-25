"""
Visualizable Data Model
"""

import numpy as np
from sklearn.metrics import confusion_matrix

from ..utils import filter_data, rl2json, compute_streams, dumps


def prepare_streams(model, dataset, conditional=True, bins=20):
    ranges = dataset.ranges
    categories = dataset.categories
    streams = compute_streams(model, dataset.data, dataset.target, ranges, categories, conditional, bins)
    return dumps(streams)


def prepare_model_json(model, dataset):
    # data = get_dataset(get_model_data(model))

    meta = {
        'featureNames': dataset.feature_names,
        'labelNames': dataset.label_names,
        'isCategorical': dataset.is_categorical,
        'categories': dataset.categories,
        # 'continuous': [True] * x.shape[1],
        'ranges': dataset.ranges,
    }

    ret_dict = {'meta': meta, 'dataset': dataset.name, 'name': model.name}
    ret_dict.update(rl2json(model))

    # if isinstance(model, SurrogateMixin):
    ret_dict['target'] = model.target.name

    return dumps(ret_dict)


def compute_support_matrix(model, x, y, y_pred) -> np.ndarray:
    # n_rules x n_instances
    decision_supports = model.decision_support(x, transform=True)
    n_classes = model.n_classes
    matrices = np.empty((len(decision_supports), n_classes, n_classes), dtype=np.float)
    for i, decision_support in enumerate(decision_supports):
        _y = y[decision_support]
        _y_pred = y_pred[decision_support]
        if len(_y):
            mat = confusion_matrix(_y, _y_pred, list(range(n_classes)))
        else:
            mat = np.zeros((n_classes, n_classes), dtype=np.float)
        matrices[i, :, :] = mat
    return matrices


class Dataset:
    def __init__(self, data, target, feature_names=None, label_names=None, is_categorical=None, categories=None,
                 name=None):
        self._data = data
        self._target = target
        self.feature_names = feature_names
        self.label_names = label_names
        self.is_categorical = is_categorical
        self.categories = categories
        self.name = name
        self._filters = None
        self._filtered_data = None
        self._filtered_target = None
        self._ranges = None
        self.validate()

    def set_data(self, new_data, new_target):
        self._data = new_data
        self._target = new_target
        self._reset_filters()

    def apply_filters(self, filters):
        self._filters = filters
        self._filtered_data, self._filtered_target = \
            filter_data(self.is_categorical, self._data, self._target, self._filters)

    def _reset_filters(self):
        self._filtered_data = None
        self._filtered_target = None
        self._filters = None

    @property
    def ranges(self):
        if self._ranges is None:
            self._ranges = list(zip(np.min(self._data, axis=0), np.max(self._data, axis=0)))
        return

    @property
    def target(self):
        if self._filters is not None:
            return self.filtered_target
        return self._target

    @property
    def data(self):
        if self._filters is not None:
            return self.filtered_data
        return self._data

    @property
    def filtered_data(self):
        if self._filtered_data is None:
            self._filtered_data, self._filtered_target = \
                filter_data(self.is_categorical, self._data, self._target, self._filters)
        return self._filtered_data

    @property
    def filtered_target(self):
        if self._filtered_target is None:
            self._filtered_data, self._filtered_target = \
                filter_data(self.is_categorical, self._data, self._target, self._filters)
        return self._filtered_target

    @property
    def n_features(self):
        return len(self.feature_names)

    @property
    def n_classes(self):
        return len(self.label_names)

    def validate(self):
        if len(self.target) != len(self.data):
            raise ValueError('The length of data and target should be the same! But got %d and %d'
                             % (len(self.target), len(self.data)))
        if self.feature_names is None:
            self.feature_names = ['X' + str(i) for i in range(self.n_features)]
        if self.label_names is None:
            max_target = np.max(self.target)
            self.label_names = ['C' + str(i) for i in range(max_target)]
        if self.is_categorical is None:
            self.is_categorical = np.zeros((len(self.feature_names),), dtype=np.bool)

        if len(self.feature_names) != self.data.shape[1]:
            raise ValueError('The length of feature_names should be equal to data.shape[1]! But got %d and %d'
                             % (len(self.feature_names), self.data.shape[1]))
        if len(self.label_names) >= np.max(self.target):
            raise ValueError('Must have len(target_names) >= max(target_names)! But got %d and %d'
                             % (len(self.label_names), np.max(self.target)))
        if len(self.is_categorical) != self.data.shape[1]:
            raise ValueError('The length of is_categorical should be equal to data.shape[1]! But got %d and %d'
                             % (len(self.is_categorical), self.data.shape[1]))


class DataModel:
    """The data model for visualization"""

    def __init__(self, rule_surrogate, dataset):
        self.rule_surrogate = rule_surrogate
        assert isinstance(dataset, Dataset)
        self.dataset = dataset

        self.filters = None
        self.rule_list_data = None
        self.stream_data = None
        self.support_data = None
        self.y_pred = None
        self.jsons = None

    @property
    def student(self):
        return self.rule_surrogate.student

    @property
    def teacher(self):
        return self.rule_surrogate.teacher

    def apply_filters(self, filters):
        self.filters = filters
        self.y_pred = None

    def prepare_data(self):
        if self.filters is not None:
            self.dataset.apply_filters(self.filters)
        rule_list = self.student
        if self.y_pred is None:
            # This might be slow
            self.y_pred = self.teacher(self.dataset.data)
        model_json = prepare_model_json(rule_list, self.dataset)

        stream_json = prepare_streams(rule_list, self.dataset)

        supports = compute_support_matrix(rule_list, self.dataset.data, self.dataset.target, self.y_pred)
        self.jsons = (model_json, stream_json, supports)

    def _repr_html_(self):
        return ("""
            <div>
                <script type="text/javascript" src=''/>
                <div id="demo">
                </div>
            </div>    
            
        """)
