import { find } from '@lumino/algorithm';
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
import { Platform, getPlatform } from './widgets/platform';
import { observeFileBrowser } from './widgets/files';
import { createOpener } from './widgets/index/open';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';

const MarkdownFileName = 'README.md';
const SvgFileName = 'README.svg';

async function checkPlatform(app: JupyterFrontEnd): Promise<Platform> {
  await app.restored;
  return await getPlatform(app);
}

/**
 * Initialization data for the lc_index extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'lc_index:plugin',
  autoStart: true,
  requires: [IDocumentManager, IFileBrowserFactory, IRenderMimeRegistry],
  activate: (
    app: JupyterFrontEnd,
    documents: IDocumentManager,
    fileBrowserFactory: IFileBrowserFactory,
    renderMimeRegistry: IRenderMimeRegistry
  ) => {
    console.log('JupyterLab extension lc_index is activated!');

    checkPlatform(app).then((platform: Platform) => {
      let detectedPath: string | null = null;
      let removeOldWidget: (() => void) | null = () => {};
      const opener = createOpener(app, platform, documents, renderMimeRegistry);
      observeFileBrowser(fileBrowserFactory, fileBrowser => {
        if (detectedPath === fileBrowser.model.path) {
          return;
        }
        if (!find(fileBrowser.model.items(), item => item.name.length > 0)) {
          return;
        }
        // README.svg
        const svgItem = find(fileBrowser.model.items(), item =>
          new RegExp(`^${SvgFileName}$`, 'i').test(item.name)
        );
        // README.md
        const markdownItem = find(fileBrowser.model.items(), item =>
          new RegExp(`^${MarkdownFileName}$`, 'i').test(item.name)
        );
        detectedPath = fileBrowser.model.path;
        if (removeOldWidget) {
          removeOldWidget();
        }
        if (svgItem || markdownItem) {
          console.log('[lc_index] open:', svgItem?.path, markdownItem?.path);
          opener
            .open(fileBrowser.model.path, svgItem?.path, markdownItem?.path)
            .then((remove: () => void) => {
              removeOldWidget = remove;
            })
            .catch((reason: any) => {
              console.error('[lc_index]', reason);
            });
        } else {
          console.log(
            '[lc_index] ' +
              MarkdownFileName +
              ' nor ' +
              SvgFileName +
              ' are not found'
          );
        }
      });
    });
  }
};

export default plugin;
