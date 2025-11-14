import { IDocumentManager } from '@jupyterlab/docmanager';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { Panel } from '@lumino/widgets';
import { JupyterFrontEnd } from '@jupyterlab/application';

import {
  BaseOpener,
  IContentOpener,
  RemoveCallback,
  LinkFor,
  LinkedWidget
} from './base';
import { LabelWidget } from './label';

export class JupyterLabOpener extends BaseOpener implements IContentOpener {
  private app: JupyterFrontEnd;

  constructor(
    app: JupyterFrontEnd,
    documents: IDocumentManager,
    renderMimeRegistry: IRenderMimeRegistry
  ) {
    super(documents, renderMimeRegistry);
    this.app = app;
  }

  protected async addWidget(
    basePath: string,
    widgets: LinkedWidget[]
  ): Promise<RemoveCallback> {
    const panel = new Panel();
    const widgetInstances = await Promise.all(
      widgets.map(async ({ widget }) => await widget())
    );
    widgets.forEach(({ filename }, index) => {
      panel.addWidget(new LabelWidget(filename));
      const w = widgetInstances[index];
      panel.addWidget(w);
    });
    panel.addClass('lc-index-widget');
    panel.id = 'lc_index:index-widget';
    panel.title.label = `Index of ${basePath}/`;
    panel.title.closable = true;
    this.app.shell.add(panel, 'main');
    return () => {
      panel.dispose();
    };
  }

  protected resolveRelativePathOrHandler(
    linkFor: LinkFor,
    path: string
  ): string | (() => boolean) {
    if (linkFor === LinkFor.IMAGE) {
      return '/files/' + path;
    }
    return () => {
      this.documents.openOrReveal(decodeURI(path));
      return false;
    };
  }
}
