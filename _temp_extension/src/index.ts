import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization data for the lc_index extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'lc_index:plugin',
  description: 'Open README on started',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension lc_index is activated!');
  }
};

export default plugin;
