import { IDocumentManager } from '@jupyterlab/docmanager';
import { IRenderMimeRegistry, MimeModel } from '@jupyterlab/rendermime';
import { Widget } from '@lumino/widgets';

export type RemoveCallback = () => void;

export interface IContentOpener {
  open(
    basePath: string,
    svgPath: string | undefined,
    markdownPath: string | undefined
  ): Promise<RemoveCallback>;
}

export enum LinkFor {
  IMAGE,
  LINK
}

export type LinkedWidget = {
  filename: string;
  linkFor: LinkFor;
  widget: () => Promise<Widget>;
  path: string;
};

export abstract class BaseOpener implements IContentOpener {
  protected documents: IDocumentManager;
  protected renderMimeRegistry: IRenderMimeRegistry;

  constructor(
    documents: IDocumentManager,
    renderMimeRegistry: IRenderMimeRegistry
  ) {
    this.documents = documents;
    this.renderMimeRegistry = renderMimeRegistry;
  }

  async open(
    basePath: string,
    svgPath: string | undefined,
    markdownPath: string | undefined
  ): Promise<RemoveCallback> {
    const linkedWidgets: LinkedWidget[] = [];
    if (svgPath) {
      const svgModel = await this.documents.services.contents.get(svgPath);
      const svgMimeType = 'image/svg+xml';
      linkedWidgets.push({
        linkFor: LinkFor.IMAGE,
        filename: svgModel.name,
        widget: async () => {
          const svgRenderer =
            this.renderMimeRegistry.createRenderer(svgMimeType);
          const svgMimeModel = new MimeModel({
            data: { [svgMimeType]: svgModel.content },
            trusted: true
          });
          await svgRenderer.renderModel(svgMimeModel);
          return svgRenderer;
        },
        path: svgPath
      });
    }
    if (markdownPath) {
      const markdownModel =
        await this.documents.services.contents.get(markdownPath);
      const markdownMimeType = 'text/markdown';
      linkedWidgets.push({
        linkFor: LinkFor.LINK,
        filename: markdownModel.name,
        widget: async () => {
          const markdownRenderer =
            this.renderMimeRegistry.createRenderer(markdownMimeType);
          const markdownMimeModel = new MimeModel({
            data: { [markdownMimeType]: markdownModel.content },
            trusted: false
          });
          await markdownRenderer.renderModel(markdownMimeModel);
          this.modifySource(markdownRenderer, markdownPath);
          return markdownRenderer;
        },
        path: markdownPath
      });
    }
    return await this.addWidget(basePath, linkedWidgets);
  }

  protected abstract resolveRelativePathOrHandler(
    linkFor: LinkFor,
    path: string
  ): string | (() => boolean);

  protected resolveRelativePath(path: string, basePath: string): string {
    const parentBasePath = basePath.replace(/[^/]+$/, '');
    return parentBasePath + path;
  }

  private isRelativePath(path: string): boolean {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return false;
    }
    if (path.startsWith('/')) {
      return false;
    }
    return true;
  }

  private modifySource(widget: Widget, basePath: string) {
    widget.node.querySelectorAll('img').forEach(img => {
      const src = img.getAttribute('src');
      if (!src) {
        return;
      }
      if (!this.isRelativePath(src)) {
        return;
      }
      const url = this.resolveRelativePathOrHandler(
        LinkFor.IMAGE,
        this.resolveRelativePath(src, basePath)
      );
      if (typeof url === 'function') {
        throw new Error('Not supported');
      }
      img.setAttribute('src', url);
    });
    widget.node.querySelectorAll('a').forEach(a => {
      const href = a.getAttribute('href');
      if (!href) {
        return;
      }
      if (!this.isRelativePath(href)) {
        return;
      }
      const urlOrHandler = this.resolveRelativePathOrHandler(
        LinkFor.LINK,
        this.resolveRelativePath(href, basePath)
      );
      if (typeof urlOrHandler === 'function') {
        a.setAttribute('href', '#');
        a.onclick = urlOrHandler;
        return;
      } else {
        a.setAttribute('href', urlOrHandler);
      }
    });
  }

  protected abstract addWidget(
    basePath: string,
    widgets: LinkedWidget[]
  ): Promise<RemoveCallback>;
}
