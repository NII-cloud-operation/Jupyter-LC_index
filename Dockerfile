FROM jupyter/scipy-notebook:latest

USER root

RUN pip install --no-cache  jupyter_nbextensions_configurator

COPY . /tmp/nbindex
RUN pip install --no-cache /tmp/nbindex

RUN mv /tmp/nbindex/example $HOME/ && chown $NB_USER -R $HOME/example && \
    cp /tmp/nbindex/README.* $HOME/ && chown $NB_USER $HOME/README.*

RUN jupyter nbclassic-extension install --py jupyter_nbextensions_configurator --sys-prefix && \
    jupyter nbclassic-extension enable --py jupyter_nbextensions_configurator --sys-prefix && \
    jupyter nbclassic-serverextension enable --py jupyter_nbextensions_configurator --sys-prefix && \
    jupyter nbextension install --py --sys-prefix notebook_index && \
    jupyter nbextension enable --py --sys-prefix notebook_index

USER $NB_UID

# Make classic notebook the default
ENV DOCKER_STACKS_JUPYTER_CMD=nbclassic
