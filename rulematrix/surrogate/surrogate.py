from typing import Callable

import numpy as np

from rulematrix.surrogate import create_sampler
from rulematrix.metrics import accuracy


class SurrogateMixin(object):

    def __init__(self, *args, **kwargs):
        super(SurrogateMixin, self).__init__(*args, **kwargs)
        self.target = None  # type: Callable
        self.data_distribution = None  # type: Callable
        self.train_fidelity = None
        self.test_fidelity = None
        self.self_test_fidelity = None

    def surrogate(self, target_predict, instances: np.ndarray,
                  sampling_rate: float = 2., cov_factor: float = 1.0,
                  is_continuous=None, is_categorical=None, is_integer=None, ranges=None,
                  seed=None, **kwargs):
        """
        Fit a model that surrogates the target_predict function
        :param target_predict: callable: (x: np.ndarray) -> np.ndarray,
            a callable function that takes a 2D data array as input, and output an 1D label array
        :param instances: np.ndarray. The training data that we used for density estimation and oversampling
        :param sampling_rate: float (default=2.0). The sampling rate
        :param cov_factor: float (default 1.0)
        :param is_continuous: np.ndarray (default=None)
            A bool mask array indicating whether each feature is continuous or not.
            If all three masks are all None, then by default all features are continuous.
        :param is_categorical: np.ndarray (default=None)
            A bool mask array indicating whether each feature is categorical.
        :param is_integer: np.ndarray (default=None)
            A bool mask array indicating whether each feature is integer.
        :param ranges: List[Optional[(float, float)]]
            A list of (min, max) or None, indicating the ranges of each feature.
        :param seed: The random seed for the algorithm
        :param kwargs: additional arguments passed to the model's fit function
        :return:
        """
        assert callable(target_predict)
        assert hasattr(self, 'fit')
        self.target = target_predict
        self.data_distribution = create_sampler(instances, is_continuous, is_categorical, is_integer, ranges,
                                                cov_factor, seed=seed)

        n_samples = int(sampling_rate * len(instances))
        train_x = self.data_distribution(n_samples)
        train_y = target_predict(train_x).astype(np.int)
        print('Sampled', len(train_y), 'data')
        self.fit(train_x, train_y, **kwargs)
        # self.evaluate(train_x, train_y, stage='train')
        # self.self_test(int(n_samples * 0.2), cache=cache)

    def sample(self, n: int):
        assert self.data_distribution is not None
        return self.data_distribution(n)

    def fidelity(self, x):
        if self.target is None:
            raise RuntimeError("The target model has to be set before calling this method!")
        assert hasattr(self, 'predict')
        y_target = self.target(x)
        y_pred = self.predict(x)

        return accuracy(y_target, y_pred)

    def self_test(self, n_sample=200):
        x = self.data_distribution(n_sample)
        fidelity = self.fidelity(x)
        print("Self test fidelity: {:.5f}".format(fidelity))
        self.self_test_fidelity = fidelity
        return fidelity


class Surrogate(object):
    """
    A factory like implementation of the surrogate algorithm
    Suitable for creating a Pipeline Surrogate model
    """
    def __init__(self, is_continuous=None, is_categorical=None, is_integer=None, ranges=None,
                 cov_factor=1.0, sampling_rate=2.0, seed=None):
        """
        :param is_continuous: np.ndarray (default=None)
            A bool mask array indicating whether each feature is continuous or not.
            If all three masks are all None, then by default all features are continuous.
        :param is_categorical: np.ndarray (default=None)
            A bool mask array indicating whether each feature is categorical.
        :param is_integer: np.ndarray (default=None)
            A bool mask array indicating whether each feature is integer.
        :param ranges: List[Optional[(float, float)]]
            A list of (min, max) or None, indicating the ranges of each feature.
        :param cov_factor: float (default 1.0)
        :param sampling_rate: float (default 2.0)
            The sampling rate, i.e., the ratio n_samples / n_training_data
        :param seed: The random seed for the algorithm
        """
        self.surrogator = None
        self.target = None  # type: Callable
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

    def surrogate(self, student, teacher):
        """
        Fit a model that surrogates the target_predict function
        :param student: An object (sklearn style model) that has fit, predict method.
            The fit method: (train_x, train_y, **kwargs)
            The predict method: (x) -> y (np.int)
        :param teacher: callable: (x: np.ndarray) -> np.ndarray,
            a callable function that takes a 2D data array as input, and output an 1D label array
        :return:
        """
        assert callable(teacher)
        assert hasattr(student, 'fit')
        assert hasattr(student, 'predict')

        if not self.is_fit:
            raise ValueError('Must call the fit function before using surrogate method!')
        if self.surrogator is not None or self.target is not None:
            print('Warning: already having a surrogator or a target, rewriting...')
        n_samples = int(self.sampling_rate * self.n_instances)
        train_x = self.sample(n_samples)
        train_y = teacher(train_x).astype(np.int)
        print('Sampled', len(train_y), 'data')
        student.fit(train_x, train_y)
        self.surrogator = student
        self.target = teacher

        # self.evaluate(train_x, train_y, stage='train')
        # self.self_test(int(n_samples * 0.2), cache=cache)

    def fit(self, X, y=None):
        """
        :param X: np.ndarray. The training data that we used for density estimation and oversampling
        :param y: None. place holder to conform with sklearn API
        :return: self
        """
        if y is not None:
            print('Warning: y will not be used in the fitting function!')
        self.data_distribution = create_sampler(X, self.is_continuous, self.is_categorical, self.is_integer,
                                                self.ranges, self.cov_factor, seed=self.seed)
        self.n_instances = len(X)
        self.is_fit = True
        return self

    def sample(self, n: int):
        """
        An alias, that helps sampling the distribution
        :param n:
        :return:
        """
        assert self.data_distribution is not None
        return self.data_distribution(n)

    def score(self, X, y=None):
        if y is not None:
            print('Warning: y will not be used in the fitting function!')
        return self.fidelity(X)

    def fidelity(self, X):
        if self.target is None:
            raise RuntimeError("The target model has to be set before calling this method!")
        assert hasattr(self.surrogator, 'predict')
        y_target = self.target(X)
        y_pred = self.surrogator.predict(X)

        return accuracy(y_target, y_pred)

    def self_test(self, n_sample=200):
        x = self.data_distribution(n_sample)
        fidelity = self.fidelity(x)
        return fidelity

    # def evaluate(self, x, y, stage='train'):
    #     prefix = 'Training'
    #
    #     y_pred = self.predict(x)
    #     fidelity = self.fidelity(x)
    #     score = self.score(y, y_pred)
    #     if stage == 'test':
    #         prefix = 'Testing'
    #         self.train_fidelity = fidelity
    #     else:
    #         self.test_fidelity = fidelity
    #     print(prefix + " fidelity: {:.5f}; score: {:.5f}".format(fidelity, score))
    #     return fidelity, score
