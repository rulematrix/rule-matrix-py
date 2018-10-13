import numpy as np
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
        """
        Fit the rule list on given training data
        :param X: 2D array
        :param y: 1D integer array
        :return: self
        """
        self._validate_discretizer()
        self.discretizer.fit(X, y)
        X_disc = self.discretizer.transform(X)
        self.category_names = compute_mdlp_all_intervals(self.discretizer)
        super(RuleList, self).fit(X_disc, y)
        return self
        
    def predict_proba(self, x):
        """
        Give the probability output (prediction) on the given data
        :param x:
        :return:
        """
        if self.discretizer is not None:
            x = self.discretizer.transform(x)
        return super(RuleList, self).predict_proba(x)

    def caught_matrix(self, x):
        """
        compute the caught matrix of x
        Each rule has an array of bools, showing whether each instances is caught by this rule
        :param np.ndarray x: 2D array (n_instances, n_features) should be categorical data, must be of type int
        :return:
            a bool np.ndarray of shape (n_rules, n_instances)
        """
        if self.discretizer is not None:
            x = self.discretizer.transform(x)
        return super(RuleList, self).caught_matrix(x)

    def decision_path(self, x):
        if self.discretizer is not None:
            x = self.discretizer.transform(x)
        return super(RuleList, self).decision_path(x)

    def explain(self, x, trace_all=False):
        """
        Explain the prediction of a given input using rule(s)
        :param x: 1D array of a single input instance
        :param bool trace_all:
        :return:
            if `trace_all`, then all queried rules would be returned,
            else a single rule that captured the input would be returned
        """
        x = x.reshape(1, -1)
        assert x.shape[1] == self.n_features
        decision_path = self.decision_path(x)
        queried_rules = np.arange(self.n_rules)[decision_path]
        if trace_all:
            return [self.rule_list[i] for i in queried_rules]
        return self.rule_list[queried_rules[-1]]
