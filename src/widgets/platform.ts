import { JupyterFrontEnd } from '@jupyterlab/application';
import { TabPanel, Widget } from '@lumino/widgets';

export enum PlatformType {
  JUPYTER_LAB,
  JUPYTER_NOTEBOOK7_TREE
}

export type Notebook7TreePanels = {
  tab: TabPanel;
  tree: Widget;
  shell: JupyterFrontEnd.IShell;
};

export type Platform = {
  type: PlatformType;
  notebook7TreePanels?: Notebook7TreePanels;
};

function checkPlatform(
  app: JupyterFrontEnd,
  callback: (platform: Platform) => void
) {
  const widgets = Array.from(app.shell.widgets('main'));
  if (widgets.length === 0) {
    setTimeout(() => {
      checkPlatform(app, callback);
    }, 10);
    return;
  }
  const tab = widgets[0] as TabPanel;
  const type = !tab.addWidget
    ? PlatformType.JUPYTER_LAB
    : PlatformType.JUPYTER_NOTEBOOK7_TREE;
  const platform: Platform = {
    type
  };
  if (type === PlatformType.JUPYTER_NOTEBOOK7_TREE) {
    platform.notebook7TreePanels = new Notebook7TreePanelsImpl(app, tab);
  }
  callback(platform);
}

export function getPlatform(app: JupyterFrontEnd): Promise<Platform> {
  return new Promise<Platform>((resolve, reject) => {
    checkPlatform(app, platform => {
      resolve(platform);
    });
  });
}

class Notebook7TreePanelsImpl {
  app: JupyterFrontEnd;
  tab: TabPanel;

  constructor(app: JupyterFrontEnd, tab: TabPanel) {
    this.app = app;
    this.tab = tab;
  }

  get shell() {
    return this.app.shell;
  }

  get tree(): Widget {
    const w = this.tab.widgets.find(w => w.hasClass('jp-FileBrowser'));
    if (!w) {
      throw new Error('jp-FileBrowser is not found');
    }
    return w;
  }
}
