import { IDocumentManager } from '@jupyterlab/docmanager';
import { PlatformType, Notebook7TreePanels } from '../platform';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { LabIcon } from '@jupyterlab/ui-components';
import { Panel } from '@lumino/widgets';
import { URLExt } from '@jupyterlab/coreutils';
import { ServerConnection } from '@jupyterlab/services';
import { faPager } from '@fortawesome/free-solid-svg-icons';

import {
  BaseOpener,
  IContentOpener,
  LinkedWidget,
  LinkFor,
  RemoveCallback
} from './base';
import { extractSvgString } from './util';
import { LabelWidget } from './label';

export class JupyterNotebook7Opener
  extends BaseOpener
  implements IContentOpener
{
  private panels: Notebook7TreePanels;
  private settings: ServerConnection.ISettings;

  constructor(
    documents: IDocumentManager,
    renderMimeRegistry: IRenderMimeRegistry,
    panels: Notebook7TreePanels
  ) {
    super(documents, renderMimeRegistry);
    this.panels = panels;
    this.settings = ServerConnection.makeSettings();
  }

  protected async addWidget(
    basePath: string,
    linkedWidgets: LinkedWidget[]
  ): Promise<RemoveCallback> {
    const oldPanels = this.panels.tab.widgets.filter(widget =>
      widget.title.label.match(/^Index of .*\//)
    );
    oldPanels.forEach(panel => panel.dispose());
    let mainPanel: { panel: Panel; widgets: LabelWidget[] } | null = null;
    const leftPanel = await this.createLeftPanel(
      basePath,
      linkedWidgets,
      async (index: number) => {
        const targetIndex = this.panels.tab.widgets.findIndex(
          widget => widget.title.label === `Index of ${basePath}/`
        );
        if (targetIndex < 0 || !mainPanel) {
          mainPanel = await this.createMainPanel(basePath, linkedWidgets);
          this.panels.tab.addWidget(mainPanel.panel);
          setTimeout(() => {
            this.panels.tab.currentIndex = this.panels.tab.widgets.length - 1;
            const scroll = () => {
              const mainWidgets = mainPanel!.widgets;
              if (!mainWidgets || !mainWidgets[index]) {
                return;
              }
              mainWidgets[index].node.scrollIntoView({ behavior: 'smooth' });
            };
            setTimeout(scroll, 100);
          }, 100);
          return;
        }
        const scroll = () => {
          const mainWidgets = mainPanel!.widgets;
          if (!mainWidgets || !mainWidgets[index]) {
            return;
          }
          mainWidgets[index].node.scrollIntoView({ behavior: 'smooth' });
        };
        if (this.panels.tab.currentIndex === targetIndex) {
          scroll();
          return;
        }
        this.panels.tab.currentIndex = targetIndex;
        setTimeout(scroll, 100);
      }
    );
    this.panels.shell.add(leftPanel, 'left');
    this.panels.shell.activateById(leftPanel.id);
    return () => {
      leftPanel.dispose();
    };
  }

  private async createLeftPanel(
    basePath: string,
    linkedWidgets: LinkedWidget[],
    onClick: (index: number) => Promise<void>
  ) {
    const panel = new Panel();
    panel.id = `lc_index:index-left-widget:${basePath}`;
    panel.addClass('lc-index-widget');
    const widgetInstances = await Promise.all(
      linkedWidgets.map(async ({ widget }) => await widget())
    );
    linkedWidgets.forEach(({ filename }, index) => {
      panel.addWidget(
        new LabelWidget(filename, () => {
          onClick(index).then(() => {
            console.log('[lc_index] Clicked:', filename);
          });
        })
      );
      const widgetPanel = new Panel();
      widgetPanel.title.caption = filename;
      widgetPanel.title.closable = false;
      widgetPanel.title.label = filename;
      widgetPanel.addWidget(widgetInstances[index]);
      panel.addWidget(widgetPanel);
    });
    panel.title.caption = 'Index';
    panel.title.icon = new LabIcon({
      name: 'lc_index::lc_index',
      svgstr: extractSvgString(PlatformType.JUPYTER_NOTEBOOK7_TREE, faPager)
    });
    return panel;
  }

  private async createMainPanel(
    basePath: string,
    linkedWidgets: LinkedWidget[]
  ) {
    const panel = new Panel();
    panel.id = 'lc_index:index-main-widget';
    panel.addClass('lc-index-widget');
    panel.title.closable = true;
    const widgetInstances = await Promise.all(
      linkedWidgets.map(async ({ widget }) => await widget())
    );
    const headers: LabelWidget[] = [];
    linkedWidgets.forEach(({ filename }, index) => {
      const label = new LabelWidget(filename);
      headers.push(label);
      panel.addWidget(label);
      panel.addWidget(widgetInstances[index]);
    });
    panel.title.caption = `Index of ${basePath}/`;
    panel.title.label = `Index of ${basePath}/`;
    panel.title.icon = new LabIcon({
      name: 'lc_index::lc_index',
      svgstr: extractSvgString(PlatformType.JUPYTER_NOTEBOOK7_TREE, faPager)
    });
    return {
      panel,
      widgets: headers
    };
  }

  protected resolveRelativePathOrHandler(
    linkFor: LinkFor,
    subPath: string
  ): string {
    const { baseUrl } = this.settings;
    if (linkFor === LinkFor.IMAGE) {
      return URLExt.join(baseUrl, 'files', subPath);
    }
    if (subPath.match(/\.ipynb$/i)) {
      return URLExt.join(baseUrl, 'notebooks', subPath);
    }
    return URLExt.join(baseUrl, 'edit', subPath);
  }
}
