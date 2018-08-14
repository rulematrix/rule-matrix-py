import numpy as np
import os
import pickle
from sklearn.neural_network import MLPClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.datasets import load_breast_cancer, load_iris


def load_model(filename: str):
    if not os.path.isfile(filename):
        raise FileNotFoundError("Cannot find file: {:s}".format(os.path.abspath(filename)))
    with open(filename, "rb") as f:
        mdl = pickle.load(f)
        # assert isinstance(mdl, ModelBase)
        return mdl


def save_model(mdl, filename):
    dir_name = os.path.dirname(os.path.abspath(filename))
    if not os.path.exists(dir_name):
        os.makedirs(dir_name)
    with open(filename, 'wb') as f:
        return pickle.dump(mdl, f)


def train_nn(name, data, neurons=(20,), alpha=0.01, **kwargs):
    train_x, train_y, test_x, test_y = \
        data['train_x'], data['train_y'], data['test_x'], data['test_y']

    is_categorical = data['is_categorical']
    nn = MLPClassifier(hidden_layer_sizes=neurons, alpha=alpha, **kwargs)
    model = Pipeline(['one_hot', ])
    # nn = SKClassifier(model, name=name, standardize=True, one_hot_encoder=one_hot_encoder)
    # nn.train(train_x, train_y)
    # nn.evaluate(train_x, train_y, stage='train')
    # acc, loss, auc = nn.test(test_x, test_y)
    save_model(nn, name)

    return nn, acc


def train_surrogate(model_file, sampling_rate=5, surrogate='rule',
                    rule_maxlen=2, min_support=0.01, eta=1, _lambda=50, iters=50000, alpha=1):
    is_rule = surrogate == 'rule'
    model = load_model(model_file)
    dataset = model.name.split('-')[0]
    data = get_dataset(dataset, split=True, discrete=is_rule, one_hot=is_rule)
    train_x, train_y, test_x, test_y, feature_names, is_categorical = \
        data['train_x'], data['train_y'], data['test_x'], data['test_y'], data['feature_names'], data['is_categorical']
    # print(feature_names)
    print("Original model:")
    model.test(test_x, test_y)
    print("Surrogate model:")

    model_name = surrogate + '-surrogate-' + model.name
    if surrogate == 'rule':
        surrogate_model = RuleSurrogate(name=model_name, discretizer=data['discretizer'],
                                        rule_minlen=1, rule_maxlen=rule_maxlen, min_support=min_support,
                                        _lambda=_lambda, nchain=30, eta=eta, iters=iters, alpha=alpha)
    elif surrogate == 'tree':
        surrogate_model = TreeSurrogate(name=model_name, max_depth=None, min_samples_leaf=0.01)
    else:
        raise ValueError("Unknown surrogate type {}".format(surrogate))
    constraints = get_constraints(train_x, is_categorical)
    # sigmas = [0] * train_x.shape[1]
    # print(sigmas)
    instances = train_x
    # print('train_y:')
    # print(train_y)
    # print('target_y')
    # print(model.predict(instances))
    if isinstance(surrogate_model, RuleSurrogate):
        surrogate_model.surrogate(model, instances, constraints, sampling_rate, cov_factor=1.0, rediscretize=True)
    else:
        surrogate_model.surrogate(model, instances, constraints, sampling_rate)
    # surrogate_model.evaluate(train_x, train_y)
    # surrogate_model.describe(feature_names=feature_names)
    surrogate_model.save()
    # surrogate_model.self_test()
    self_fidelity = surrogate_model.self_test(len(train_y) * sampling_rate * 0.25)
    fidelity, acc = surrogate_model.test(test_x, test_y)
    return fidelity, acc, self_fidelity, surrogate_model.n_rules