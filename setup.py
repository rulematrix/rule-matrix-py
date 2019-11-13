#!/usr/bin/env python

"""
setup.py file
"""

from setuptools import setup, find_packages

setup(
    name='rulematrix',
    version='0.1',
    author="Yao, Ming",
    description="""A package for generating explanatory rule-based interface for machine learning models""",
    long_description="""
            RuleMatrix is a package for creating rule-based visualizations that explains 
            given machine learning models. It is build with Python, Javascript and C. 
        """,
    url='https://github.com/rulematrix/rule-matrix-py',
    packages=find_packages(),
    install_requires=[
        'fim @ https://github.com/myaooo/pyfim-clone/tarball/master#egg=fim-6.28',
        # 'python-s3 @ http://github.com/robot-republic/python-s3/tarball/master.tar.gz'
        'numpy', 
        'pysbrl>=0.4.2',
        'mdlp-discretization',
        'jinja2'
    ],
    # dependency_links=[
    #     'https://github.com/myaooo/pyfim-clone/tarball/master#egg=fim-6.28'
    # ],
    extras_require={
        'server': ['flask>=1.0']
    }

)
