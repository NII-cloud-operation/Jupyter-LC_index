import { find } from '@lumino/algorithm';
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';

const MarkdownFileName = 'README.md';
const SvgFileName = 'README.svg';

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
    console.log('JupyterLab extension lc_index is activated!');

    app.restored.then(() => {
      const fileBrowser = fileBrowserFactory.tracker.currentWidget;
      if (!fileBrowser) {
        throw new Error('file browser is not set');
      }

      // README.md
      let item = find(fileBrowser.model.items(), item =>
        new RegExp(MarkdownFileName, 'i').test(item.name)
      );
      let widgetName = 'Markdown Preview';
      if (!item) {
        // README.svg
        item = find(fileBrowser.model.items(), item =>
          new RegExp(SvgFileName, 'i').test(item.name)
        );
        widgetName = 'Image';
      }
      if (item) {
        console.log('open: ' + item.path);
        const ret = documents.openOrReveal(item.path, widgetName);
        console.log(ret);
      } else {
        console.log(
          MarkdownFileName + ' nor ' + SvgFileName + ' are not found'
        );
      }
    });
  }
};

export default plugin;
