"""
File IO utils
"""

import os
import json
import io
import csv

from typing import Dict, Union, Optional, Tuple, Callable, Any

# import dill as pickle
import numpy as np
import pandas as pd

from rule_surrogate.config import Config


def get_path(path, filename=None, absolute=False):
    """
    A helper function that get the real/abs path of a file on disk, with the project dir as the base dir.
    Note: there is no checking on the illegality of the args!
    :param path: a relative path to ROOT_DIR, optional file_name to use
    :param filename: an optional file name under the path
    :param absolute: return the absolute path
    :return: return the path relative to the project root dir, default to return relative path to the called place.
    """
    return Config.get_path(path, filename, absolute)


def write2file(s_io, filename=None, mode='w', encoding=None):
    """
    This is a wrapper function for writing files to disks,
    it will automatically check for dir existence and create dir or file if needed
    :param s_io: a io.StringIO instance or a str
    :param filename: the path of the file to write to
    :param mode: the writing mode to use
    :return: None
    """
    before_save(filename)
    with open(filename, mode, encoding=encoding) as f:
        if isinstance(s_io, io.StringIO):
            f.write(s_io.getvalue())
        else:
            f.write(s_io)


def obj2pkl(obj, filename=None, *args, **kwargs):
    if filename is not None:
        before_save(filename)
        with open(filename, 'wb') as f:
            return pickle.dump(obj, f, *args, **kwargs)
    return pickle.dumps(obj, **kwargs)


def pkl2obj(filename=None):
    assert_file_exists(filename)
    with open(filename, 'rb') as f:
        return pickle.load(f)


def dict2json(obj, filename=None, *args, **kwargs):
    if filename is not None:
        before_save(filename)
        with open(filename, 'w') as f:
            return json.dump(obj, f, *args, **kwargs)
    return json.dumps(obj, **kwargs)


def json2dict(filename, *args, **kwargs):
    assert_file_exists(filename)
    with open(filename, 'r') as f:
        return json.load(f, *args, **kwargs)


def df2csv(df, filename, **kwargs):
    if not isinstance(df, pd.DataFrame):
        df = pd.DataFrame(df)
    return df.to_csv(filename, index=False, **kwargs)


def csv2df(filename):
    assert_file_exists(filename)
    return pd.read_csv(filename)


def array2csv(array, filename, **kwargs):
    df = pd.DataFrame(array)
    return df.to_csv(filename, index=False, **kwargs)


def csv2array(filename):
    assert_file_exists(filename)
    return pd.read_csv(filename).as_matrix()


def array2npy(array: np.ndarray, filename, *args, **kwargs):
    return np.save(filename, array, *args, **kwargs)


def npy2array(filename, *args, **kwargs):
    assert_file_exists(filename)
    return np.load(filename, *args, **kwargs)


def lists2csv(list_of_list, file_path, delimiter=',', encoding=None):
    with io.StringIO() as s_io:
        writer = csv.writer(s_io, delimiter=delimiter)
        for ls in list_of_list:
            writer.writerow([str(i) for i in ls])
        write2file(s_io, file_path, 'w', encoding=encoding)


def csv2lists(file_path, delimiter=',', mode='r', encoding=None, skip=0):
    assert_file_exists(file_path)
    lists = []
    with open(file_path, mode, newline='', encoding=encoding) as f:
        csv_reader = csv.reader(f, delimiter=delimiter)
        for i in range(skip):
            next(csv_reader)
        for row in csv_reader:
            lists.append(row)
    return lists


def text2list(file_path, delimiter='|', mode='r'):
    assert_file_exists(file_path)
    with open(file_path, mode) as f:
        s = f.read()
        return s.split(delimiter)


def save2text(a_list, file_path, delimiter='|'):
    s = delimiter.join([str(e) for e in a_list])
    write2file(s, file_path, 'w')


def path_exists(file_or_dir):
    return os.path.exists(file_or_dir)


def file_exists(file_path):
    return os.path.isfile(file_path)


def assert_file_exists(file_path):
    if file_exists(file_path):
        return
    else:
        raise FileNotFoundError("Cannot find file: {:s}".format(os.path.abspath(file_path)))


def assert_path_exists(file_or_dir):
    if os.path.exists(file_or_dir):
        return
    else:
        raise FileNotFoundError("Cannot find file or dir: {:s}".format(os.path.abspath(file_or_dir)))


def before_save(file_or_dir):
    """
    make sure that the dedicated path exists (create if not exist)
    :param file_or_dir:
    :return:
    """
    dir_name = os.path.dirname(os.path.abspath(file_or_dir))
    if not os.path.exists(dir_name):
        os.makedirs(dir_name)


def get_ext(filename):
    _, ext = os.path.splitext(filename)
    return ext


Saver = Callable[[Any, str], Any]
Loader = Callable[[str], Any]

_ext_table = {
    '.pkl': (obj2pkl, pkl2obj),
    '.json': (dict2json, json2dict),
    '.csv': (array2csv, csv2array),
    '.npy': (array2npy, npy2array),
}  # type: Dict[str, Tuple[Saver, Loader]]


def register_file_handling(ext: str, saver: Saver, loader: Loader):
    assert ext not in _ext_table
    _ext_table[ext] = (saver, loader)


def save_file(obj, filename, *args, **kwargs):

    ext = get_ext(filename)
    if ext in _ext_table:
        before_save(filename)
        return _ext_table[ext][0](obj, filename, *args, **kwargs)
    else:
        raise ValueError("Unsupported file {} with file extension {}".format(filename, ext))


def load_file(filename, *args, **kwargs):
    ext = get_ext(filename)
    if ext in _ext_table:
        return _ext_table[ext][1](filename, *args, **kwargs)
    else:
        raise ValueError("Unsupported file {} with file extension {}".format(filename, ext))