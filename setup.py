#!/usr/bin/env python

from setuptools import setup

setup_args = dict(name='lc-index',
      version='0.1',
      description='',
      author='NII',
      packages=['notebook_index'],
      include_package_data=True,
      zip_safe=False,
      platforms=['Jupyter Notebook 5.x'],
      install_requires=[
          'notebook>=4.2.0',
      ]
     )

if __name__ == '__main__':
    setup(**setup_args)
