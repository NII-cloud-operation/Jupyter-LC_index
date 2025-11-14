import { IDocumentManager } from '@jupyterlab/docmanager';
import { Platform, PlatformType } from '../platform';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { JupyterFrontEnd } from '@jupyterlab/application';

import { JupyterLabOpener } from './lab';
import { IContentOpener } from './base';
import { JupyterNotebook7Opener } from './notebook7';

export function createOpener(
  app: JupyterFrontEnd,
  platform: Platform,
  documents: IDocumentManager,
  renderMimeRegistry: IRenderMimeRegistry
): IContentOpener {
  if (platform.type === PlatformType.JUPYTER_LAB) {
    return new JupyterLabOpener(app, documents, renderMimeRegistry);
  }
  if (platform.type === PlatformType.JUPYTER_NOTEBOOK7_TREE) {
    if (!platform.notebook7TreePanels) {
      throw new Error('Jupyter Notebook7 Tree Panels are not available');
    }
    return new JupyterNotebook7Opener(
      documents,
      renderMimeRegistry,
      platform.notebook7TreePanels
    );
  }
  throw new Error('Unknown platform: ' + platform.type);
}
