FROM jupyter/scipy-notebook:latest

USER root

RUN pip install --no-cache  jupyter_nbextensions_configurator

COPY . /tmp/nbindex
RUN pip install --no-cache /tmp/nbindex

RUN jupyter labextension enable lc_index

RUN mv /tmp/nbindex/example $HOME/ && chown $NB_USER -R $HOME/example && \
    cp /tmp/nbindex/README.* $HOME/ && chown $NB_USER $HOME/README.*

RUN jupyter nbclassic-extension install --py jupyter_nbextensions_configurator --sys-prefix && \
    jupyter nbclassic-extension enable --py jupyter_nbextensions_configurator --sys-prefix && \
    jupyter nbclassic-serverextension enable --py jupyter_nbextensions_configurator --sys-prefix && \
    jupyter nbclassic-extension install --py --user lc_index && \
    jupyter nbclassic-extension enable --py --user lc_index && \
    fix-permissions /home/$NB_USER

USER $NB_USER