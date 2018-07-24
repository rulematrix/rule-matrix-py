from pysbrl import BayesianRuleList

from rulematrix.surrogate import SurrogateMixin


class RuleSurrogate(SurrogateMixin, BayesianRuleList):
    def __init__(self, min_rule_len=1, max_rule_len=2, min_support=0.02, lambda_=20, eta=1, iters=30000,
                 n_chains=30, alpha=1, fim_method='eclat', feature_names=None, category_names=None, seed=None):
        """
        Similar init as pysbrl.BayesianRuleList, copy all arguments here for better IDE hints
        """
        super(RuleSurrogate, self).__init__(min_rule_len=min_rule_len, max_rule_len=max_rule_len,
                                            min_support=min_support, lambda_=lambda_, eta=eta,
                                            iters=iters, n_chains=n_chains, alpha=alpha, fim_method=fim_method,
                                            feature_names=feature_names,
                                            category_names=category_names, seed=seed)
