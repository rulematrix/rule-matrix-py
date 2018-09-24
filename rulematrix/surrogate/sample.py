from typing import Callable, List, Optional, Union
from collections import defaultdict, namedtuple

import numpy as np
from numpy.random import multivariate_normal
from scipy import stats

ArrayLike = Union[List[Union[np.ndarray, float]], np.ndarray]

INTEGER = 'integer'
CONTINUOUS = 'continuous'
CATEGORICAL = 'categorical'

data_type = {INTEGER, CONTINUOUS, CATEGORICAL}


class IntegerConstraint(namedtuple('IntegerConstraint', ['range_'])):

    def regularize(self, arr: np.ndarray):
        arr = np.round(arr)
        if self.range_ is not None:
            assert len(arr.shape) == 1
            arr[arr > self.range_[1]] = self.range_[1]
            arr[arr < self.range_[0]] = self.range_[0]
        return arr


CategoricalConstraint = namedtuple('CategoricalConstraint', ['categories'])


class ContinuousConstraint(namedtuple('ContinuousConstraint', ['range_'])):

    def regularize(self, arr: np.ndarray):
        if self.range_ is not None:
            arr = arr.copy()
            assert len(arr.shape) == 1
            arr[arr > self.range_[1]] = self.range_[1]
            arr[arr < self.range_[0]] = self.range_[0]
        return arr


def create_constraint(feature_type, **kwargs):
    if feature_type == INTEGER:
        return IntegerConstraint(kwargs['range_'])
    elif feature_type == CONTINUOUS:
        return ContinuousConstraint(kwargs['range_'])
    elif feature_type == CATEGORICAL:
        return CategoricalConstraint(None)
    else:
        raise ValueError("Unknown feature_type {}".format(feature_type))


def create_constraints(n_features, is_continuous: np.ndarray=None, is_categorical: np.ndarray=None,
                       is_integer: np.ndarray=None, ranges=None):
    is_continuous, is_categorical, is_integer = \
        check_input_constraints(n_features, is_continuous, is_categorical, is_integer)
    constraints = []
    for i in range(len(is_categorical)):
        feature_type = CATEGORICAL if is_categorical[i] else CONTINUOUS if is_continuous[i] else INTEGER
        constraints.append(create_constraint(feature_type, range_=ranges[i]))
    return constraints


def check_input_constraints(n_features, is_continuous=None, is_categorical=None, is_integer=None):
    if is_integer is None:
        is_integer = np.zeros((n_features,), dtype=np.bool)
    else:
        is_integer = np.array(is_integer, dtype=np.bool)
        if is_integer.shape != (n_features,):
            raise ValueError("is_integer should be None or an array of bool mask!")
    if is_categorical is None:
        is_categorical = np.zeros((n_features,), dtype=np.bool)
    else:
        is_categorical = np.array(is_categorical, dtype=np.bool)
        if is_categorical.shape != (n_features,):
            raise ValueError("is_categorical should be None or an array of bool mask!")
    if is_continuous is None:
        is_continuous = np.logical_not(np.logical_and(is_integer, is_categorical))
    else:
        is_continuous = np.array(is_continuous, dtype=np.bool)
        if is_continuous.shape != (n_features,):
            raise ValueError("is_continuous should be None or an array of bool mask!")

    if np.any(np.logical_and(is_categorical, np.logical_and(is_integer, is_continuous))) \
            or not np.all(np.logical_or(is_categorical, np.logical_or(is_integer, is_continuous))):
        raise ValueError("is_integer, is_categorical, and is_continuous "
                         "should be exclusive and collectively exhaustive!")

    return is_continuous, is_categorical, is_integer


def gaussian_mixture(means: np.ndarray,
                     cov: np.ndarray,
                     weights: Optional[np.ndarray] = None,
                     random_state=None
                     ) -> Callable[[int], np.ndarray]:
    if weights is None:
        weights = np.empty(len(means), dtype=np.float32)
        weights.fill(1 / len(means))
    n_features = len(means[0])

    def sample(n: int) -> np.ndarray:
        if random_state:
            norm = random_state.multivariate_normal(np.zeros((n_features,), dtype=np.float), cov, n)
            indices = random_state.choice(len(means), size=n, p=weights)
        else:
            norm = multivariate_normal(np.zeros((n_features,), dtype=np.float), cov, n)
            indices = np.random.choice(len(means), size=n, p=weights)
        return norm + means[indices]

    return sample


def scotts_factor(n, d):
    return n ** (-1. / (d + 4))


def create_sampler(instances: np.ndarray, is_continuous=None, is_categorical=None, is_integer=None, ranges=None,
                   cov_factor=1.0, seed=None, verbose=False) -> Callable[[int], np.ndarray]:
    """
    We treat the sampling of categorical values as a multivariate categorical distribution.
    We sample categorical values first, then sample the continuous and integer variables
    using the conditional distribution w.r.t. to the categorical vector.

    Note: each category feature only support at most **128** number of choices

    :param instances: np.ndarray
        the data that we used for building estimation and sampling new data.
        A 2D array of shape [n_instances, n_features]
    :param is_continuous: np.ndarray (default=None)
        A bool mask array indicating whether each feature is continuous or not.
        If all three masks are all None, then by default all features are continuous.
    :param is_categorical: np.ndarray (default=None)
        A bool mask array indicating whether each feature is categorical.
    :param is_integer: np.ndarray (default=None)
        A bool mask array indicating whether each feature is integer.
    :param ranges: List[Optional[(float, float)]]
        A list of (min, max) or None, indicating the ranges of each feature.
    :param cov_factor: float (default=1.0)
        A multiplier that scales the covariance matrix.
    :param seed: Random seed for the sampling
    :param verbose: a flag for debugging output
    :return: a function handle (n: int) -> np.ndarray that creates samples from the estimated distribution
    """

    # Check the shape of input
    instances = np.array(instances)
    assert len(instances.shape) == 2
    n_features = instances.shape[1]
    n_samples = len(instances)

    is_continuous, is_categorical, is_integer = check_input_constraints(
        n_features, is_continuous, is_categorical, is_integer)
    is_numeric = np.logical_or(is_integer, is_continuous)
    if ranges is None:
        ranges = [None] * n_features

    # Build up constraints
    constraints = create_constraints(n_features, is_continuous, is_categorical, is_integer, ranges)

    # Create RandomState
    random_state = np.random.RandomState(seed=seed)

    def _build_cache():
        categoricals = instances[:, is_categorical].astype(np.int8)

        categorical_samples = defaultdict(list)
        for i in range(n_samples):
            key = bytes(categoricals[i, :])
            categorical_samples[key].append(instances[i])

        keys = []
        probs = []
        key2instances = []
        for key, value in categorical_samples.items():
            keys.append(key)
            probs.append(len(value) / n_samples)
            key2instances.append(np.array(value))
        if verbose:
            print("# of categories:", len(keys))
            print("Distribution of # of instances per categories:")
            hists, bins = np.histogram(probs * n_samples, 5)
            print("hists:", hists.tolist())
            print("bins:", bins.tolist())
        return keys, probs, key2instances

    cat_keys, cat_probs, cat2instances = _build_cache()

    # Try stats.gaussian_kde
    continuous_data = instances[:, is_numeric]
    n_numeric = np.sum(is_numeric)

    # Estimate the covariance matrix for kde
    if n_numeric != 0:
        glb_kde = stats.gaussian_kde(continuous_data.T, 'silverman')
        cov = cov_factor * glb_kde.covariance
    else:
        cov = []

    # The sampling function
    def sample(n: int) -> np.ndarray:
        samples = []
        # Sample categorical features by multinomial
        sample_nums = random_state.multinomial(n, cat_probs)
        for idx, num in enumerate(sample_nums):
            if num == 0:
                continue
            sample_buffer = np.empty((num, n_features), dtype=np.float)

            # Sample continuous part
            if n_numeric != 0:
                sample_buffer[:, is_numeric] = gaussian_mixture(cat2instances[idx][:, is_numeric], cov,
                                                                random_state=random_state)(num)
            # Fill the categorical part
            categorical_part = np.frombuffer(cat_keys[idx], dtype=np.int8)
            sample_buffer[:, is_categorical] = np.tile(categorical_part, (num, 1)).astype(np.float)

            samples.append(sample_buffer)
        sample_mat = np.vstack(samples)

        # regularize numeric part
        for i, constraint in enumerate(constraints):
            if isinstance(constraint, IntegerConstraint) or isinstance(constraint, ContinuousConstraint):
                sample_mat[:, i] = constraint.regularize(sample_mat[:, i])

        return sample_mat

    return sample
