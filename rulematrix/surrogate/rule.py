import numpy as np
from pysbrl import BayesianRuleList
from rulematrix.surrogate import SurrogateMixin, Surrogate
from rulematrix.surrogate import get_discretizer


class RuleSurrogate(SurrogateMixin, BayesianRuleList):
    def __init__(self, min_rule_len=1, max_rule_len=2, min_support=0.02,
                 lambda_=20, eta=1, iters=30000, n_chains=30, alpha=1,
                 fim_method='eclat', feature_names=None, category_names=None, seed=None):
        """
        Similar init as pysbrl.BayesianRuleList, copy all arguments here for better IDE hints
        """
        super(RuleSurrogate, self).__init__(min_rule_len=min_rule_len, max_rule_len=max_rule_len,
                                            min_support=min_support, lambda_=lambda_, eta=eta,
                                            iters=iters, n_chains=n_chains, alpha=alpha, fim_method=fim_method,
                                            feature_names=feature_names,
                                            category_names=category_names, seed=seed)


# TODO: Remove the dependency of scikit-learn to make the package lighter
def create_student_model(discretizer=None, **kwargs):
    if discretizer is None:
        return BayesianRuleList(**kwargs)
    try:
        from sklearn.pipeline import Pipeline
        return Pipeline([('discretize', discretizer), ('rule_list', BayesianRuleList(**kwargs))])
    except ImportError as e:
        print("Install sklearn to enable the Pipeline!")
        raise e


def rule_surrogate(target, train_x, discretizer=None,
                   is_continuous=None, is_categorical=None, is_integer=None,
                   ranges=None, cov_factor=1.0, sampling_rate=2.0, seed=None,
                   **kwargs):
    surrogator = Surrogate(is_continuous, is_categorical, is_integer,
                           ranges, cov_factor, sampling_rate, seed)
    # Fit the distribution estimation of training data
    surrogator.fit(train_x)
    if discretizer is None:
        # then we check if all the input are already discretized
        try:
            train_x = train_x.as_type(np.int, casting='safe')
        except:
            # We failed the casting, create a default discretizer for continuous features
            continuous_features = is_continuous
            if is_integer is not None:
                if continuous_features is None:
                    continuous_features = is_integer
                else:
                    continuous_features = np.logical_or(continuous_features, is_integer)
            discretizer = get_discretizer('mdlp', continuous_features=continuous_features,
                                          random_state=seed)
    student = create_student_model(discretizer, **kwargs)
    surrogator.surrogate(student, target)
    return surrogator
