from math import inf
from typing import List
from functools import lru_cache, reduce

import numpy as np
# import flask
from flask import jsonify
from mdlp.discretization import MDLP

from rulematrix.server import get_model, get_model_data
from rulematrix.core import NeuralNet, RuleList, Tree, SurrogateMixin
from rulematrix.data_processing import get_dataset


def get_surrogate_data(model, data_type):
    if isinstance(model, SurrogateMixin):
        x = model.load_cache(data_type == 'sample train')
        y = model.target.predict(x).astype(np.int)
    else:
        raise ValueError("Model {} is not a surrogate, cannot load data with type {}".format(model.name, data_type))
    return x, y


def nn2json(nn: NeuralNet) -> dict:
    return {
        'type': nn.type,
        'neurons': list(nn.neurons),
        'activation': nn.activation,
        'weights': nn.model.coefs_,
        'bias': nn.model.intercepts_
    }


def tree2json(tree: Tree) -> dict:
    return {
        'type': 'tree',
        'root': tree.to_dict(),
        'nNodes': tree.n_nodes,
        'maxDepth': tree.max_depth,
        'nClasses': tree.n_classes,
        'nFeatures': tree.n_features,
    }


def get_category_ratios(data, discretizer: MDLP, categories: List[List[str]]=None) -> List[List[float]]:
    continuous = set(discretizer.continuous_features)
    ratios = []
    for idx in range(data.shape[1]):
        # print(idx)
        col = data[:, idx]
        if idx in continuous:
            cats = discretizer.cts2cat(col, idx)
            unique_cats, _counts = np.unique(cats, return_counts=True)
            n_cats = len(discretizer.cut_points_[idx]) + 1
        else:
            unique_cats, _counts = np.unique(col.astype(np.int), return_counts=True)
            n_cats = len(categories[idx]) if categories is not None else (max(unique_cats) + 1)
        counts = np.zeros(shape=(n_cats,))
        counts[unique_cats] = _counts
        ratios.append(counts / len(col))
    return ratios


def surrogate2json(model: SurrogateMixin):
    return {
        'target': model.target.name
    }


@lru_cache(32, typed=True)
def model2json(model_name):
    # data = get_dataset(get_model_data(model))
    try:
        model = get_model(model_name)
    except FileNotFoundError:
        return None
    data_name = get_model_data(model_name)
    ret_dict = {'meta': model_meta(model_name), 'dataset': data_name, 'name': model.name}
    if isinstance(model, RuleList):
        ret_dict.update(rl2json(model))
        # ret_dict['discretizers'] = discretizer2json(model.discretizer)
    elif isinstance(model, NeuralNet):
        ret_dict.update(nn2json(model))
    elif isinstance(model, Tree):
        ret_dict.update(tree2json(model))
    else:
        raise ValueError("Unsupported model of type {}".format(model.__class__))
    if isinstance(model, SurrogateMixin):
        ret_dict.update(surrogate2json(model))

    return jsonify(ret_dict)
    # ret_dict['featureNames'] = data['feature_names']
    # ret_dict['labelNames'] = data['target_names']


@lru_cache(32)
def model_meta(model_name):

    data_name = get_model_data(model_name)
    try:
        data = get_dataset(data_name, split=True, verbose=0, discrete=True)
    except LookupError:
        print("Cannot find data with name {}".format(data_name))
        return None
    discretizer = data['discretizer']
    ranges = None if 'ranges' not in data else data['ranges']
    categories = None if 'categories' not in data else data['categories']
    is_categorical = data['is_categorical']

    ret = {
        'featureNames': data['feature_names'],
        'labelNames': data['target_names'],
        'isCategorical': is_categorical,
        'categories': categories,
        # 'continuous': [True] * x.shape[1],
        'ranges': ranges,
        # 'discretizers': discretizer2json(discretizer),
    }
    return ret


def data2histogram(data, n_bins: int = 20, ranges=None):
    hists = []
    for i, col in enumerate(data.T):
        counts, bin_edges = np.histogram(col, n_bins, range=None if ranges is None else ranges[i])
        # bin_size = bin_edges[1] - bin_edges[0]
        # bin_centers = [edge + bin_size / 2 for edge in bin_edges.tolist()[:-1]]
        hists.append(counts)
    return hists


@lru_cache(32)
def model_data(model_name, data_type='train', bins=20, filters=None):
    x, y = get_model_x_y(model_name, data_type, filters)

    ret = construct_data(model_name, x, y, bins)
    ret.update({
        'name': data_type,
    })
    return ret


@lru_cache(32)
def get_model_x_y(model_name, data_type='train', filters=None):

    data_name = get_model_data(model_name)
    model = get_model(model_name)
    try:
        data = get_dataset(data_name, split=True, verbose=0, discrete=True)
    except LookupError:
        print("Cannot find data with name {}".format(data_name))
        return None
    if data_type == 'train' or data_type == 'test':
        x = data[data_type + '_x']
        y = data[data_type + '_y']
    elif data_type == 'sample train' or 'sample test':
        x, y = get_surrogate_data(model, data_type)
    else:
        raise ValueError("Unkown data_type {}".format(data_type))
    return filter_data(data['is_categorical'], x, y, filters)


def construct_data(model_name, x, y, bins=20):
    model = get_model(model_name)
    data_name = get_model_data(model_name)
    try:
        data = get_dataset(data_name, split=True, verbose=0, discrete=True)
    except LookupError:
        print("Cannot find data with name {}".format(data_name))
        return None
    ranges = data['ranges']
    categories = data['categories']
    discretizer = data['discretizer']
    hists = data2histogram(x, bins, ranges)
    confidence = model.fidelity(x) if isinstance(model, SurrogateMixin) else None
    score = model.score(y, model.predict(x))
    ret = {
        'data': x,
        'target': y,
        # 'featureNames': data['feature_names'],
        # 'labelNames': data['target_names'],
        # 'isCategorical': is_categorical,
        # 'categories': categories,
        # 'continuous': [True] * x.shape[1],
        'hists': hists,
        # 'ranges': ranges,
        'ratios': get_category_ratios(x, discretizer, categories),
        # 'discretizers': discretizer2json(discretizer, x),
        'confidence': confidence,
        'score': score
    }
    return ret


@lru_cache(32)
def model_data2json(model_name, data_type='train', bins=20, filters=None):
    return jsonify(model_data(model_name, data_type, bins, filters))
