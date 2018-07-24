import numpy as np
from sklearn.preprocessing import OneHotEncoder
from sklearn.metrics import roc_auc_score, log_loss


def label2binary(y):
    return OneHotEncoder().fit_transform(y.reshape([-1, 1])).toarray()


def auc_score(y_true, y_pred, average=None):
    return roc_auc_score(label2binary(y_true), y_pred, average=average)


def accuracy(y_true, y_pred, weights=None):
    score = y_true == y_pred
    return np.average(score, weights=weights)


def mse(y_true, y_pred, weights=None):
    return np.average((y_true - y_pred) ** 2, weights=weights)


def evaluate_classifier(classifier, x, y, verbose=True):
    acc = accuracy(y, classifier.predict(x))
    y_proba = classifier.predict_proba(x)
    loss = log_loss(y, y_proba)
    auc = auc_score(y, y_proba, average='macro')
    if verbose:
        print("Accuracy: {:.4f}; loss: {:.4f}; auc: {:.4f}".format(acc, loss, auc))
    return acc, loss, auc