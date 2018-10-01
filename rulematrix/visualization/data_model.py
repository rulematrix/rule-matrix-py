"""
Visualizable Data Model
"""

import numpy as np
from sklearn.metrics import confusion_matrix

from ..utils import filter_data, rl2json, compute_streams, dumps
from .utils import get_url, get_id
from .templates import VIS_HTML, render_scripts
from .utils import install_static
from ..surrogate import RuleList, Surrogate


def prepare_streams(model, dataset, conditional=True, bins=20):
    ranges = dataset.ranges
    categories = dataset.categories
    streams = compute_streams(model, dataset.data, dataset.target, ranges, categories, conditional, bins)
    return dumps(streams)


def prepare_rule_list_json(rule_list, support_mat, dataset):
    # data = get_dataset(get_model_data(model))

    meta = {
        'featureNames': dataset.feature_names,
        'labelNames': dataset.target_names,
        'isCategorical': dataset.is_categorical,
        'categories': dataset.categories,
        # 'continuous': [True] * x.shape[1],
        'ranges': dataset.ranges,
    }

    ret_dict = {'meta': meta, 'dataset': getattr(dataset, 'name', 'data'), 'name': getattr(rule_list, 'name', 'model')}
    ret_dict.update(rl2json(rule_list, support_mat))

    return dumps(ret_dict)


def compute_support_matrix(rule_list, x, y, y_pred) -> np.ndarray:
    # n_rules x n_instances
    caught_matrix = rule_list.caught_matrix(x)
    n_classes = rule_list.n_classes
    matrices = np.empty((len(caught_matrix), n_classes, n_classes), dtype=np.float)
    for i, caught_vector in enumerate(caught_matrix):
        _y = y[caught_vector]
        _y_pred = y_pred[caught_vector]
        if len(_y):
            # row idx means real label, col idx means predicted label
            mat = confusion_matrix(_y, _y_pred, list(range(n_classes)))
        else:
            mat = np.zeros((n_classes, n_classes), dtype=np.float)
        matrices[i, :, :] = mat
    return matrices


class Dataset:
    def __init__(self, data, target, feature_names=None, target_names=None, is_categorical=None, categories=None,
                 name=None):
        self._data = data
        self._target = target
        self.feature_names = feature_names
        self.target_names = target_names
        self.is_categorical = is_categorical
        self._categories = categories
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
    def categories(self):
        if self._categories is None:
            return [None] * self.n_features
        return self._categories

    @property
    def ranges(self):
        if self._ranges is None:
            self._ranges = list(zip(np.min(self._data, axis=0), np.max(self._data, axis=0)))
        return self._ranges

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
        return len(self.target_names)

    def validate(self):
        if len(self.target) != len(self.data):
            raise ValueError('The length of data and target should be the same! But got %d and %d'
                             % (len(self.target), len(self.data)))
        if self.feature_names is None:
            self.feature_names = ['X' + str(i) for i in range(self.n_features)]
        if self.target_names is None:
            max_target = np.max(self.target)
            self.target_names = ['C' + str(i) for i in range(max_target + 1)]
        if self.is_categorical is None:
            self.is_categorical = np.zeros((len(self.feature_names),), dtype=np.bool)

        if len(self.feature_names) != self.data.shape[1]:
            raise ValueError('The length of feature_names should be equal to data.shape[1]! But got %d and %d'
                             % (len(self.feature_names), self.data.shape[1]))
        if len(self.target_names) < np.max(self.target):
            raise ValueError('Must have len(target_names) >= max(target_names)! But got %d and %d'
                             % (len(self.target_names), np.max(self.target)))
        if len(self.is_categorical) != self.data.shape[1]:
            raise ValueError('The length of is_categorical should be equal to data.shape[1]! But got %d and %d'
                             % (len(self.is_categorical), self.data.shape[1]))


class DataModel:
    """The data model for visualization"""

    def __init__(self, dataset, student=None, teacher=None,
                 use_remote_resource=False, styles=None):
        assert isinstance(dataset, Dataset)
        self.dataset = dataset
        self.student = student
        assert isinstance(student, RuleList)
        self.teacher = teacher

        self.use_remote_resource = use_remote_resource
        self.styles = styles

        self.filters = None
        self.rule_list_data = None
        self.stream_data = None
        self.support_data = None
        self.y_pred = None
        self.jsons = None
        self.cached_html = None

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
        supports = compute_support_matrix(rule_list, self.dataset.data, self.dataset.target, self.y_pred)
        model_json = prepare_rule_list_json(rule_list, supports, self.dataset)

        stream_json = prepare_streams(rule_list, self.dataset)

        support_json = dumps(supports)
        self.jsons = (model_json, stream_json, support_json)

    def update_styles(self, styles):
        self.styles = styles

    def _repr_html_(self):
        if self.jsons is None:
            self.prepare_data()
        if not self.use_remote_resource:
            install_static()
        d3_url = get_url('d3', self.use_remote_resource)
        react_url = get_url('react', self.use_remote_resource)
        react_dom_url = get_url('react-dom', self.use_remote_resource)
        rulematrix_url = get_url('rulematrix', self.use_remote_resource)
        rulematrix_css_url = get_url('rulematrix_css', self.use_remote_resource)

        model_json, stream_json, support_json = self.jsons
        vis_id = get_id(self.jsons)
        div_tag = VIS_HTML.render(id=vis_id, rulematrix_css_url=rulematrix_css_url)
        script_tag = render_scripts.render(
            id=vis_id, d3_url=d3_url, react_url=react_url,
            react_dom_url=react_dom_url, rulematrix_url=rulematrix_url,
            model_json=model_json, stream_json=stream_json,
            support_json=support_json, styles=self.styles)
        return div_tag + script_tag


def render(data, target, rule_surrogate=None, student=None, teacher=None, local=False,
           feature_names=None, target_names=None, is_categorical=None, categories=None, data_name=None):
    """
    Entry point to render the RuleMatrix visualization.
    :param np.ndarray data: 2-D array
    :param np.ndarray target: 1-D array of integer type
    :param Surrogate rule_surrogate: (optional)
        An instance of Surrogate, with RuleList as the student.
        Must not be `None` when `student` and `teacher` are `None`
    :param RuleList student: (optional) an instance of RuleList, will be ignored when rule_surrogate is presented
    :param teacher: (optional) The teacher function, of signature (x) -> y
    :param boolean local: (optional) The mode of the notebook
    :param list feature_names: (optional) A List of feature names, must have len(feature_names) == data.shape[1]
    :param list target_names: (optional) A List of class names, must have len(target_names) >= np.max(target)
    :param np.ndarray is_categorical: (optional)
        An bool array representing whether each feature is categorical or not.
        If not provided, all features are treated as numeric.
    :param list categories: (optional)
        A list of categories, the ith element is a list of category strings,
        denoting the possible values of the ith feature, which should be a categorical feature.
        If the ith element is `None`, then the categories of this feature would be auto generated,
        or this feature is numeric.
        If `categories` is `None` (default), the categories would be auto generated.
    :param string data_name: (optional) The name of the data
    :return: an instance of DataModel
    """
    if rule_surrogate is None:
        if student is None and teacher is None:
            raise ValueError('student and teacher cannot be None if no rule_surrogate is provided!')
    else:
        student = rule_surrogate.student
        teacher = rule_surrogate.teacher
    dataset = Dataset(data, target, feature_names, target_names, is_categorical, categories, data_name)
    return DataModel(dataset, student=student, teacher=teacher, use_remote_resource=not local)
