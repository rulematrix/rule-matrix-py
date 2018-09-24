from pysbrl import BayesianRuleList
from rulematrix.surrogate.discretize import get_discretizer, compute_mdlp_all_intervals


class RuleList(BayesianRuleList):
    def __init__(self, min_rule_len=1, max_rule_len=2, min_support=0.02,
                 lambda_=20, eta=1, iters=30000, n_chains=30, alpha=1,
                 fim_method='eclat', feature_names=None, category_names=None, seed=None, verbose=0,
                 discretize_method='mdlp', numeric_features=None):
        """
        Similar init as pysbrl.BayesianRuleList, copy all arguments here for better IDE hints
        """
        super(RuleList, self).__init__(min_rule_len=min_rule_len, max_rule_len=max_rule_len,
                                       min_support=min_support, lambda_=lambda_, eta=eta,
                                       iters=iters, n_chains=n_chains, alpha=alpha, fim_method=fim_method,
                                       feature_names=feature_names,
                                       category_names=category_names, seed=seed)
        self.discretize_method = discretize_method
        self.numeric_features = numeric_features
        self.discretizer = None

    def _validate_discretizer(self):
        if type(self.discretize_method) == str:
            self.discretizer = get_discretizer(
                self.discretize_method, continuous_features=self.numeric_features, random_state=self.seed)
        else:
            self.discretizer = self.discretize_method
        if not hasattr(self.discretizer, 'fit'):
            raise ValueError('discretizer should have method fit!')
        if not hasattr(self.discretizer, 'transform'):
            raise ValueError('discretizer should have method transform!')

    def fit(self, X, y):
        self._validate_discretizer()
        self.discretizer.fit(X, y)
        X_disc = self.discretizer.transform(X)
        self.category_names = compute_mdlp_all_intervals(self.discretizer)
        super(RuleList, self).fit(X_disc, y)
        
    def predict(self, x):
        if self.discretizer is not None:
            x = self.discretizer.transform(x)
        return super(RuleList, self).predict(x)


# def rule_surrogate(target, train_x, is_continuous=None, is_categorical=None, is_integer=None,
#                    ranges=None, cov_factor=1.0, sampling_rate=2.0, seed=None, discretizer
#                    **kwargs):

#     if is_continuous is None:
#         # then we check if all the input are already discretized
#         try:
#             train_x = train_x.as_type(np.int, casting='safe')
#             student = BayesianRuleList()
#         except TypeError:
#             # We failed the casting, create a default discretizer for continuous features
#             if is_categorical is not None:
#                 numeric_features = np.logircal_not(is_categorical)
#             continuous_features = is_continuous

#     student = create_student_model(discretizer, **kwargs)
#     surrogator = Surrogate(target, student, is_continuous, is_categorical, is_integer,
#                            ranges, cov_factor, sampling_rate, seed)
#     # Fit the distribution estimation of training data
#     surrogator.fit(train_x)
#     return surrogator
