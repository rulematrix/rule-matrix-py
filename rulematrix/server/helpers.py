from typing import Union, List, Tuple
from functools import lru_cache

import numpy as np
from sklearn.metrics import confusion_matrix
from flask import jsonify

from rulematrix.core import RuleList, Tree, ModelBase, SurrogateMixin
from rulematrix.core.metrics import auc_score
from rulematrix.data_processing import get_dataset
from rulematrix.server.model_cache import get_model, get_model_data
from rulematrix.server.jsonify import model_meta, model_data, get_model_x_y


@lru_cache(32)
def model_metric(model_name, data):
    try:
        model = get_model(model_name)
    except FileNotFoundError:
        return None

    if data == 'train' or data == 'test':
        dataset = get_dataset(get_model_data(model_name), split=True)
        if data == 'train':
            x = dataset['train_x']
            y = dataset['train_y']
        else:
            x = dataset['test_x']
            y = dataset['test_y']
    # elif data == 'sample_train' or 'sample_test':
    #     pass
    else:
        raise ValueError("Unknown data {}".format(data))
    conf_mat = confusion_matrix(y, model.predict(x))
    y_pred = model.predict_proba(x)
    # if y_pred.shape[1] == 2:
    #     auc = roc_auc_score(y, y_pred[:, 1])
    # else:
    auc = auc_score(y, y_pred, average=None)
    ret = {
        'confusionMatrix': conf_mat,
        'auc': auc
    }
    return jsonify(ret)


@lru_cache(32)
def get_support(model_name, data_type, support_type='simple', filters=None):
    model = get_model(model_name)
    x, y = get_model_x_y(model_name, data_type, filters)
    if support_type == 'simple':
        supports = compute_support(model, x, y)
    elif support_type == 'mat':
        supports = compute_support_matrix(model, x, y)
    else:
        raise ValueError("Unknown support_type {}. Should be one of [simple, mat].".format(support_type))
    return jsonify(supports)


def compute_support(model: ModelBase, x: np.ndarray, y: np.ndarray):
    if isinstance(model, RuleList) or isinstance(model, Tree):
        # Return a matrix of shape (n_rules, n_classes)
        supports = model.compute_support(x, y, transform=True).astype(np.float)
        supports /= x.shape[0]
        return supports
        # ret = {'truth': model.compute_support(x, y, transform=True)}
        # if isinstance(model, SurrogateMixin):
        #     y_target = model.target.predict(x).astype(np.int)
        #     ret['target'] = model.compute_support(x, y_target, transform=True)
        # return ret
    # elif isinstance(model, Tree):
    #     ret['truth'] = model.compute_support(x, y, transform=True)
    else:
        raise ValueError("Cannot calculate support for model {} of type {}".format(model, model.type))


def compute_support_matrix(model: ModelBase, x: np.ndarray, y: np.ndarray) -> np.ndarray:
    if isinstance(model, SurrogateMixin) and (isinstance(model, RuleList) or isinstance(model, Tree)):
        # n_rules x n_instances
        decision_supports = model.decision_support(x, transform=True)
        n_classes = model.n_classes
        matrices = np.empty((len(decision_supports), n_classes, n_classes), dtype=np.float)
        y_target = model.target.predict(x)
        for i, decision_support in enumerate(decision_supports):
            _y = y[decision_support]
            _y_target = y_target[decision_support]
            if len(_y):
                mat = confusion_matrix(_y, _y_target, list(range(n_classes)))
            else:
                mat = np.zeros((n_classes, n_classes), dtype=np.float)
            matrices[i, :, :] = mat
        return matrices
    else:
        raise ValueError("Cannot calculate support for model {} of type {}".format(model, model.type))


@lru_cache(32)
def get_stream(model_name, data_type, conditional=True, bins=20, filters=None):
    model = get_model(model_name)
    dataset = get_dataset(get_model_data(model_name), split=True)
    ranges = dataset['ranges']
    categories = dataset['categories']
    x, y = get_model_x_y(model_name, data_type, filters)
    streams = compute_streams(model, x, y, ranges, categories, conditional, bins)
    return jsonify(streams)


def compute_stream(col_by_label, _range, bins=20):
    """Return a stream of shape [n_classes, n_bins]"""
    stream = []
    for col in col_by_label:
        hist, bin_edges = np.histogram(col, bins, _range)
        stream.append(hist)
    return stream


def compute_bars(col_by_label, categories):
    """Return a list of bars sorted by labels, [n_classes, n_categories]"""
    bars = np.zeros((len(col_by_label), len(categories)), dtype=np.int)
    for i, col in enumerate(col_by_label):
        uniq_labels, counts = np.unique(col, return_counts=True)
        bars[i, uniq_labels.astype(np.int)] = counts
    return bars


def _compute_streams(
        x: np.ndarray,
        idx_by_label: List[np.ndarray],
        ranges: np.ndarray,
        categories: list = None,
        bins=20
) -> List[np.ndarray]:
    """
    Compute the streams of a given dataset x.
    :param x: a dataset of shape [n_instances, n_features]
    :param idx_by_label: a partition of the dataset x along the axis 0
    :param ranges: a list of [min, max] range for each of the feature
    :param bins: the number of bins to calculate the sections of the streams
    :return: a list of n_feature dicts
        [{
            stream: np.ndarray of shape [n_classes, n_bins]
            xs: the xs of each section of the stream, an np.ndarray of shape [n_bnis,]
        }, ...
        ]
    """
    streams = []
    categories = categories if categories is not None else [None] * len(ranges)
    # print(categories)
    for col, _range, category in zip(x.T, ranges, categories):
        col_by_label = [col[idx] for idx in idx_by_label]
        bin_edges = np.linspace(_range[0], _range[1], bins + 1)
        if category is None:
            xs = (bin_edges[:-1] + bin_edges[1:]) / 2
            stream = compute_stream(col_by_label, _range, bins)
        elif isinstance(category, list):
            xs = list(range(len(category)))
            stream = compute_bars(col_by_label, category)
        else:
            # print(_range)
            # print(category)
            raise ValueError('each element in categories should be either None or a list')
        streams.append({
            'stream': stream,
            'xs': xs
        })
    for stream in streams:
        stream['yMax'] = int(np.max(np.sum(stream['stream'], axis=0)))
    return streams


def compute_streams(model: Union[RuleList, Tree], x, y, ranges, categories=None, conditional=True, bins=20):
    """
    :param model: a RuleList or a Tree
    :param x: the data, of shape [n_instances, n_features]
    :param y: the target np.ndarray of shape [n_instances,]
    :param ranges: the ranges of each feature, of shape [n_features, 2], used for uniform binning
    :param categories: each element should be a list or None
    :param conditional: whether to compute the stream conditional on previous rules/nodes, default to True
    :param bins: number of bins to compute the stream, default to 20
    :return:
        if not conditional, return a list of n_features streams,
        each stream is a np.ndarray of shape [n_classes, n_bins].
        if conditional, return a 2D np.ndarray of streams, the array is of shape [n_rules/n_nodes, n_features]
    """
    idx_by_label = []
    for label in range(model.n_classes):
        idx_by_label.append(y == label)
    if not conditional:
        return _compute_streams(x, idx_by_label, ranges, categories, bins)

    if isinstance(model, RuleList):
        decision_paths = model.decision_path(x, transform=True)
        streams = []
        # supports per rule: a bool array of shape [n_instances,]
        for support in decision_paths:
            local_idx_by_label = [np.logical_and(support, idx) for idx in idx_by_label]
            streams.append(_compute_streams(x, local_idx_by_label, ranges, categories, bins))
        first_stream = streams[0]
        y_maxs = [stream['yMax'] for stream in first_stream]
        for streams_of_rule in streams:
            for i, stream in enumerate(streams_of_rule):
                stream['yMax'] = y_maxs[i]
        return streams

    if isinstance(model, Tree):
        decision_supports = model.decision_support(x, transform=True)
        streams = []
        for i in range(model.n_nodes):
            row = decision_supports.getrow(i)
            local_idx_by_label = [np.logical_and(row, idx) for idx in idx_by_label]
            streams.append(_compute_streams(x, local_idx_by_label, ranges, categories, bins))
        # for support in decision_supports:
        #     local_idx_by_label = [np.logical_and(support, idx) for idx in idx_by_label]
        #     streams.append(_compute_streams(x, local_idx_by_label, ranges, bins))
        return streams
    raise ValueError("Unknown model type {}".format(model.__class__))

#
# @lru_cache(32)
# def get_grouped_rule_list(model_name, data_type, support_type='simple'):
#     model = get_model(model_name)
#     dataset = get_dataset(get_model_data(model_name), split=True)
#     if data_type == 'train' or data_type == 'test':
#         x = dataset[data_type + '_x']
#         y = dataset[data_type + '_y']
#     elif data_type == 'sample train' or 'sample test':
#         x, y = get_surrogate_data(model, data_type)
#     else:
#         raise ValueError(
#             'Unknown data type {}. Should be one of [train, test, sample_train, sample_test]'.format(data_type))
#
#
# def group_by_supports(supports: np.ndarray, min_support: float = 0.01) -> Tuple[np.ndarray, List[int, List[int]]]:
#     support_sums = [np.sum(support) for support in supports]
#     # ret = [supports[0]]
#     # ret_sums = [support_sums[0]]
#     ret_idx = []
#     tmp_list = []
#     sums = 0.
#     for i, v in enumerate(support_sums):
#         if v > min_support:
#             if len(tmp_list) > 0:
#                 ret_idx.append(tmp_list)
#                 tmp_list = []
#                 sums = 0.
#             ret_idx.append(i)
#         else:
#             tmp_list.append(i)
#             sums += v
#     if len(tmp_list) > 0:
#         ret_idx.append(tmp_list)
#     ret_support = np.empty((len(ret_idx), supports[0].shape))
#     for i, l in enumerate(ret_idx):
#         if isinstance(l, list):
#             ret_support[i] = np.sum(supports[l], axis=0)
#         else:
#             ret_support[i] = supports[l]
#     return ret_support, ret_idx
