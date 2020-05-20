FROM jupyter/scipy-notebook

USER root

RUN pip install --no-cache  jupyter_nbextensions_configurator

COPY . /tmp/nbindex
RUN pip install --no-cache /tmp/nbindex

RUN mv /tmp/nbindex/example $HOME/ && chown $NB_USER -R $HOME/example && \
    cp /tmp/nbindex/README.md $HOME/
USER $NB_UID

RUN jupyter nbextensions_configurator enable --user && \
    jupyter nbextension install --py --user notebook_index && \
    jupyter nbextension enable --py --user notebook_index
