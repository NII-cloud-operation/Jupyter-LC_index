import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
import { FileBrowser } from '@jupyterlab/filebrowser';

function observeFileBrowserInstance(
  fileBrowser: FileBrowser,
  callback: (fileBrowser: FileBrowser) => void
): void {
  fileBrowser.model.refreshed.connect(() => {
    callback(fileBrowser);
  });
  fileBrowser.model.pathChanged.connect(() => {
    callback(fileBrowser);
  });
  callback(fileBrowser);
}

export function observeFileBrowser(
  fileBrowserFactory: IFileBrowserFactory,
  callback: (fileBrowser: FileBrowser) => void
) {
  const fileBrowser = fileBrowserFactory.tracker.currentWidget;
  if (!fileBrowser) {
    console.warn('[lc_index] file browser is not set, waiting...');
    fileBrowserFactory.tracker.currentChanged.connect(() => {
      const fileBrowser = fileBrowserFactory.tracker.currentWidget;
      if (fileBrowser) {
        observeFileBrowserInstance(fileBrowser, callback);
      }
    });
    return;
  }
  observeFileBrowserInstance(fileBrowser, callback);
}
