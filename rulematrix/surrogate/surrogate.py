from typing import Callable

import numpy as np

from rulematrix.surrogate import create_sampler
from rulematrix.metrics import accuracy
from rulematrix.utils import save_file


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

    def self_test(self, n_sample=200, save_test: str = None):
        x = self.data_distribution(n_sample)
        fidelity = self.fidelity(x)
        print("Self test fidelity: {:.5f}".format(fidelity))
        self.self_test_fidelity = fidelity
        if save_test:
            save_file({'data': x, 'label': None}, save_test)
        return fidelity


class Surrogate(object):
    """
    A factory like implementation of the surrogate algorithm
    Suitable for creating a Pipeline Surrogate model
    """
    def __init__(self, is_continuous=None, is_categorical=None, is_integer=None, ranges=None,
                 cov_factor: float = 1.0, seed=None):
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
        :param seed: The random seed for the algorithm
        """
        self.surrogator = None
        self.target = None  # type: Callable
        self.data_distribution = None  # type: Callable

        self.cov_factor = cov_factor
        self.is_continuous = is_continuous
        self.is_categorical = is_categorical
        self.is_integer = is_integer
        self.n_instances = 0
        self.ranges = ranges
        self.seed = seed

    def surrogate(self, surrogator, target, sampling_rate=2.0):
        """
        Fit a model that surrogates the target_predict function
        :param surrogator: An object (sklearn style model) that has fit, predict method.
            The fit mehotd: (train_x, train_y, **kwargs)
            The predict method: (x) -> y (np.int)
        :param target: callable: (x: np.ndarray) -> np.ndarray,
            a callable function that takes a 2D data array as input, and output an 1D label array
        :param sampling_rate: float (default=2.0). The sampling rate

        :param kwargs: additional arguments passed to the model's fit function
        :return:
        """
        assert callable(target)
        assert hasattr(surrogator, 'fit')
        assert hasattr(surrogator, 'predict')

        n_samples = int(sampling_rate * self.n_instances)
        train_x = self.sample(n_samples)
        train_y = target(train_x).astype(np.int)
        print('Sampled', len(train_y), 'data')
        surrogator.fit(train_x, train_y)
        self.surrogator = surrogator
        self.target = target

        # self.evaluate(train_x, train_y, stage='train')
        # self.self_test(int(n_samples * 0.2), cache=cache)

    def fit(self, train_x):
        """
        :param train_x: np.ndarray. The training data that we used for density estimation and oversampling
        :return:
        """
        self.data_distribution = create_sampler(train_x, self.is_continuous, self.is_categorical, self.is_integer,
                                                self.ranges, self.cov_factor, seed=self.seed)
        self.n_instances = len(train_x)

    def sample(self, n: int):
        """
        An alias, that helps sampling the distribution
        :param n:
        :return:
        """
        assert self.data_distribution is not None
        return self.data_distribution(n)

    def fidelity(self, x):
        if self.target is None:
            raise RuntimeError("The target model has to be set before calling this method!")
        assert hasattr(self, 'predict')
        y_target = self.target(x)
        y_pred = self.surrogator.predict(x)

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
