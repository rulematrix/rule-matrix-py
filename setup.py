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
    install_requires=['numpy'],
    extras_require={
        'server': ['flask>=1.0']
    }

)
