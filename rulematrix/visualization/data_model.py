"""
Visualizable Data Model
"""

import numpy as np
from sklearn.metrics import confusion_matrix

from ..utils import filter_data, rl2json, compute_streams, dumps


def apply_filters(data_dict, filters=None):
    if filters is None:
        return data_dict

    X, Y = filter_data(data_dict["is_categorical"], data_dict["data"], data_dict["target"], filters)
    new_data_dict = data_dict.copy()
    new_data_dict.update({"data": X, "target": Y})
    return new_data_dict


def prepare_streams(model, data_dict, conditional=True, bins=20):
    ranges = data_dict["ranges"]
    categories = data_dict["categories"]
    streams = compute_streams(model, data_dict["data"], data_dict["target"], ranges, categories, conditional, bins)
    return dumps(streams)


def prepare_model_json(model, data_dict):
    # data = get_dataset(get_model_data(model))

    meta = {
        'featureNames': data_dict['feature_names'],
        'labelNames': data_dict['label_names'],
        'isCategorical': data_dict["is_categorical"],
        'categories': data_dict["categories"],
        # 'continuous': [True] * x.shape[1],
        'ranges': data_dict["ranges"],
    }

    ret_dict = {'meta': meta, 'dataset': data_dict["data_name"], 'name': model.name}
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


def prepare(rule_list, dataset, y_pred, filters=None):

    dataset = apply_filters(dataset, filters)

    model_json = prepare_model_json(rule_list, dataset)

    stream_json = prepare_streams(rule_list, dataset)

    supports = compute_support_matrix(rule_list, dataset["data"], dataset["target"], y_pred)
    return model_json, stream_json, supports


class Dataset:
    def __init__(self, data, target, feature_names=None, target_names=None, is_categorical=None, categories=None):
        self.data = data
        self.target = target
        self.feature_names = feature_names
        self.target_names = target_names
        self.is_categorical = is_categorical
        self.categories = categories
        self.validate()

    @property
    def n_features(self):
        return len(self.feature_names)

    @property
    def n_classes(self):
        return len(self.target_names)

    def validate(self):
        if self.feature_names is None:
            self.feature_names = ['X' + str(i) for i in range(self.n_features)]
        if self.target_names is None:
            max_target = np.max(self.target)
            self.target_names = ['C' + str(i) for i in range(max_target)]
        if self.is_categorical is None:
            self.is_categorical = np.zeros((len(self.feature_names), ), dtype=np.bool)

        if len(self.feature_names) != self.data.shape[1]:
            raise ValueError('The length of feature_names should be equal to data.shape[1]! But got %d and %d'
                             %(len(self.feature_names), self.data.shape[1]))
        if len(self.target_names) >= np.max(self.target):
            raise ValueError('Must have len(target_names) >= max(target_names)! But got %d and %d'
                             %(len(self.target_names), np.max(self.target)))
        if len(self.is_categorical) != self.data.shape[1]:
            raise ValueError('The length of is_categorical should be equal to data.shape[1]! But got %d and %d'
                             %(len(self.is_categorical), self.data.shape[1]))


class DataModel:

    def __init__(self, rule_surrogate, dataset):
        self.rule_surrogate = rule_surrogate
        self.dataset = dataset

        self.filters = None
        self.rule_list_data = None
        self.stream_data = None
        self.support_data = None

    def prepare_data(self):
        pass

    def _repr_html_(self):
        return ("""
            <div>
                <script type="text/javascript" src=''/>
                <div id="demo">
                </div>
            </div>    
            
        """)
