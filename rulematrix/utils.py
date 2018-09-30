from functools import reduce
import json
import numpy as np


class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return json.JSONEncoder.default(self, obj)


def dumps(obj):
    return json.dumps(obj, cls=NumpyEncoder)


def filter_data(is_categorical, x, y, query=None):
    if query is None:
        return x, y

    assert len(x) == len(y)
    satisfied = []
    for i, _filter in enumerate(query):
        if _filter is None:
            continue
        assert isinstance(_filter, list)
        if i == x.shape[1]:
            category = True
            col = y
        else:
            col = x[:, i]
            category = is_categorical[i]

        if category:
            sats = [col == c for c in _filter]
            satisfied += [reduce(np.logical_or, sats)]
        else:
            low = _filter[0] if _filter[0] is not None else -np.inf
            high = _filter[1] if _filter[1] is not None else np.inf
            satisfied += [np.logical_and(low < col, col < high)]

    selected = reduce(np.logical_and, satisfied, np.ones((len(y),), dtype=np.bool))
    return x[selected], y[selected]


def discretizer2json(discretizer):
    cut_points = discretizer.cut_points_  # type: list
    category_intervals = [None] * len(cut_points)
    cut_points = [None if cut_point is None else cut_point for cut_point in cut_points]
    maxs = discretizer.maxs_
    mins = discretizer.mins_
    # print(cut_points)
    for i, _cut_points in enumerate(cut_points):
        if _cut_points is None:
            continue
        cats = np.arange(len(_cut_points)+1)
        intervals = [[None if low == -np.inf else low, None if high == np.inf else high]
                     for low, high in discretizer.assign_intervals(cats, i)]
        category_intervals[i] = intervals

    return [{
        'cutPoints': cut_points[i],
        'intervals': category_intervals[i],
        'max': maxs[i],
        'min': mins[i],
        # 'ratios': category_ratios[i]
        } for i in range(len(cut_points))]


def rl2json(rl, supports):
    """

    :param RuleList rl:
    :param np.ndarray supports: shape (n_rules, n_classes, n_classes)
    :return:
    """
    # supports = np.array([rule.support for rule in rl.rule_list], dtype=np.float)
    # supports /= np.sum(supports)
    return {
        'type': 'rule',
        'nClasses': rl.n_classes,
        'nFeatures': rl.n_features,
        'rules':
            [{
                'conditions': [{
                    'feature': feature,
                    'category': category
                } for feature, category in rule.clauses],
                'output': rule.output,
                'cover': np.sum(supports[i]),
                'support': supports[i],
                'totalSupport': np.sum(supports[i]),
                'label': int(np.argmax(rule.output)),
                'idx': i
                # 'support': rule.support.tolist()
              } for i, rule in enumerate(rl.rule_list)],
        'supports': supports,
        'discretizers': discretizer2json(rl.discretizer)
    }


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
        x,
        idx_by_label,
        ranges,
        categories=None,
        bins=20
):
    """
    Compute the streams of a given dataset x.
    :param np.ndarray x: a dataset of shape [n_instances, n_features]
    :param list[np.ndarray] idx_by_label: a partition of the dataset x along the axis 0
    :param np.ndarray ranges: a list of [min, max] range for each of the feature
    :param categories:
    :param bins: the number of bins to calculate the sections of the streams
    :rtype: list[np.ndarray]
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


def compute_streams(model, x, y, ranges, categories=None, conditional=True, bins=20):
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

    decision_paths = model.decision_path(x)
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
