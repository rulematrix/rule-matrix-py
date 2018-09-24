import os
import pickle
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline

from sklearn.model_selection import train_test_split
from sklearn.datasets import load_breast_cancer, load_iris

from rulematrix.surrogate import rule_surrogate


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


def train_nn(dataset, neurons=(20,), **kwargs):
    train_x, train_y, test_x, test_y = \
        dataset['train_x'], dataset['train_y'], dataset['test_x'], dataset['test_y']
    is_categorical = dataset.get('is_categorical', None)

    model = MLPClassifier(hidden_layer_sizes=neurons, **kwargs)
    if is_categorical is not None:
        model = Pipeline([
            ('one_hot', OneHotEncoder(categorical_features=is_categorical)),
            ('mlp', model)
        ])
    model.fit(train_x, train_y)
    train_score = model.score(train_x, train_y)
    test_score = model.score(test_x, test_y)
    print('Training score:', train_score)
    print('Test score:', test_score)

    return model


def train_surrogate(model, dataset, sampling_rate=2.0, **kwargs):
    train_x, train_y, test_x, test_y = \
        dataset['train_x'], dataset['train_y'], dataset['test_x'], dataset['test_y']
    is_continuous = dataset.get('is_continuous', None)
    is_categorical = dataset.get('is_categorical', None)
    is_integer = dataset.get('is_integer', None)
    feature_names = dataset.get('feature_names', None)
    # print(feature_names)

    surrogate = rule_surrogate(model.predict, train_x, sampling_rate=sampling_rate,
                               is_continuous=is_continuous,
                               is_categorical=is_categorical,
                               is_integer=is_integer,
                               rlargs={'feature_names': feature_names, 'verbose': 2},
                               **kwargs)
    student = surrogate.student
    print('The surrogate rule list:')
    if isinstance(student, Pipeline):
        print(student.named_steps['rule_list'])
    else:
        print(student)
    train_fidelity = surrogate.score(train_x)
    test_fidelity = surrogate.score(test_x)
    print('Training fidelity:', train_fidelity)
    print('Test fidelity:', test_fidelity)
    # surrogate_model.evaluate(train_x, train_y)
    # surrogate_model.describe(feature_names=feature_names)
    return surrogate


def prepare_data(name_or_path):
    if name_or_path == 'iris':
        dataset = load_iris()
    elif name_or_path == 'breast_cancer':
        dataset = load_breast_cancer()
    else:
        # Try to load a pickled dataset
        try:
            with open(name_or_path, 'rb') as f:
                dataset = pickle.load(f)
        except FileNotFoundError:
            raise ValueError('Cannot locate dataset', name_or_path)
    if 'train_x' in dataset and 'train_y' in dataset and 'test_x' in dataset and 'test_y' in dataset:
        return dataset
    dataset['train_x'], dataset['test_x'], dataset['train_y'], dataset['test_y'] = \
        train_test_split(dataset['data'], dataset['target'], test_size=0.25, random_state=42)

    return dataset


def main():
    from argparse import ArgumentParser
    parser = ArgumentParser()
    parser.add_argument('--dataset', type=str, default='iris')
    parser.add_argument('--sample_rate', type=float, default=2.0)

    args = parser.parse_args()
    dataset = prepare_data(args.dataset)
    nn = train_nn(dataset, (20, 20))
    train_surrogate(nn, dataset, args.sample_rate)


if __name__ == '__main__':
    main()
