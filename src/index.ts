import { find } from '@lumino/algorithm';
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';

const fileName = 'README.md';

/**
 * Initialization data for the lc_index extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'lc_index:plugin',
  autoStart: true,
  requires: [IDocumentManager, IFileBrowserFactory],
  activate: (
    app: JupyterFrontEnd,
    documents: IDocumentManager,
    fileBrowserFactory: IFileBrowserFactory
  ) => {
    console.debug('JupyterLab extension lc_index is activated!');

    app.restored.then(() => {
      const fileBrowser = fileBrowserFactory.tracker.currentWidget;
      if (!fileBrowser) {
        throw new Error('file browser is not set');
      }

      const item = find(
        fileBrowser.model.items(),
        item => item.name === fileName
      );
      if (item) {
        documents.openOrReveal(fileName, 'Markdown Preview');
      } else {
        console.debug(fileName + ' is not found');
      }
    });
  }
};

export default plugin;
