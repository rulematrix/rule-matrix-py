from typing import Callable
import warnings

import numpy as np

from rulematrix.surrogate import create_sampler, check_input_constraints
from rulematrix.surrogate import RuleList
from rulematrix.metrics import accuracy


def surrogate(student, teacher, X, verbose=False):
    """
    Fit a model that surrogates the target_predict function
    :param student: An object (sklearn style model) that has fit, predict method.
        The fit method: (train_x, train_y, **kwargs)
        The predict method: (x) -> y (np.int)
    :param teacher: callable: (x: np.ndarray) -> np.ndarray,
        A callable function that takes a 2D data array as input, and output an 1D label array
    :param np.ndarray X:
    :param bool verbose:
    :return:
    """
    y = teacher(X).astype(np.int)
    if verbose:
        print('Sampled', len(y), 'data')
    student.fit(X, y)
    return student


def fidelity(teacher, student, X):
    y_target = teacher(X)
    y_pred = student.predict(X)
    return accuracy(y_target, y_pred)


class Surrogate(object):
    """
    A factory like implementation of the surrogate algorithm
    Suitable for creating a Pipeline Surrogate model
    """
    def __init__(self, teacher, student=None, is_continuous=None, is_categorical=None, is_integer=None, ranges=None,
                 cov_factor=1.0, sampling_rate=2.0, seed=None, verbose=False):
        """
        :param teacher:
        :param student:
        :param np.ndarray or None is_continuous: default None.
            A bool mask array indicating whether each feature is continuous or not.
            If all three masks are all None, then by default all features are continuous.
        :param np.ndarray or None is_categorical: default None.
            A bool mask array indicating whether each feature is categorical.
        :param np.ndarray or None is_integer: default None.
            A bool mask array indicating whether each feature is integer.
        :param list or None ranges: List[Optional[(float, float)]]
            A list of (min, max) or None, indicating the ranges of each feature.
        :param float cov_factor: default 1.0
        :param float sampling_rate: default 2.0
            The sampling rate, i.e., the ratio n_samples / n_training_data
        :param int or None seed: The random seed for the algorithm
        :param boolean verbose:
        """
        self.teacher = teacher  # type: Callable
        self.student = student
        self.data_distribution = None  # type: Callable
        self.cov_factor = cov_factor
        self.sampling_rate = sampling_rate
        self.is_continuous = is_continuous
        self.is_categorical = is_categorical
        self.is_integer = is_integer
        self.n_instances = 0
        self.is_fit = False
        self.ranges = ranges
        self.seed = seed
        self.verbose = verbose

    def _validate(self, n_features):
        self.is_continuous, self.is_categorical, self.is_integer = \
            check_input_constraints(n_features, self.is_continuous, self.is_categorical, self.is_integer)
        if not callable(self.teacher):
            raise ValueError("the teacher should be a callable function!")
        if self.student is None:
            self.student = RuleList(numeric_features=np.logical_not(self.is_categorical))
        if not hasattr(self.student, 'fit'):
            raise ValueError("The student model should has fit function")
        if not hasattr(self.student, 'predict'):
            raise ValueError("The student model should has predict function")

    def fit_distribution(self, X):
        """
        Fit the distribution of the training data.
        Subclasses can override this function to support more powerful distribution estimation methods.
        An idea would be using GAN to fit a more powerful distribution on image dataset
        and use it to sample training data for rule list
        :param X:
        :return:
        """
        self.data_distribution = create_sampler(X, self.is_continuous, self.is_categorical, self.is_integer,
                                                self.ranges, self.cov_factor, seed=self.seed)
        self.n_instances = len(X)
        return self

    def fit(self, X, y=None):
        """
        :param np.ndarray X: The training data that we used for density estimation and oversampling
        :param None y: Place holder to conform with sklearn API
        :return: self
        """
        if y is not None:
            warnings.warn('Passing y to the fitting function, y will not be used!', Warning)
        self._validate(X.shape[1])
        self.fit_distribution(X)
        n_samples = int(self.sampling_rate * self.n_instances)
        sampled_x = self.sample(n_samples)
        surrogate(self.student, self.teacher, sampled_x, self.verbose)
        return self

    def sample(self, n):
        """
        An alias, that helps sampling the distribution
        :param int n: The number of samples to draw
        :return: sampled data
        """
        if self.data_distribution is None:
            raise ValueError("Call surrogate first to create a data_distribution!")
        return self.data_distribution(n)

    def score(self, X, y=None):
        if y is not None:
            print('Warning: y will not be used in the score function!')
        return fidelity(self.teacher, self.student, X)

    def self_test(self, n_sample=200):
        """
        Use data randomly sampled from the estimated distribution to test the surrogate model.
        :param n_sample: number of test data to sample
        :return: score (fidelity) on the test ata
        """
        x = self.sample(n_sample)
        return self.score(x)


def rule_surrogate(target, train_x, is_continuous=None, is_categorical=None, is_integer=None,
                   ranges=None, cov_factor=1.0, sampling_rate=2.0, seed=None, rlargs=None):
    n_features = train_x.shape[1]
    is_continuous, is_categorical, is_integer = \
        check_input_constraints(n_features, is_continuous, is_categorical, is_integer)
    if rlargs is not None:
        rl = RuleList(numeric_features=np.logical_not(is_categorical), **rlargs)
    else:
        rl = None
    surrogator = Surrogate(target, rl, is_continuous, is_categorical, is_integer,
                           ranges, cov_factor, sampling_rate, seed)
    # Fit the distribution estimation of training data
    surrogator.fit(train_x)
    return surrogator
