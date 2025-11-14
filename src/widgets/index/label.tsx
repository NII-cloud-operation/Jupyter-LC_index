import React from 'react';
import { ReactWidget } from '@jupyterlab/ui-components';
import { Header } from './header';

export class LabelWidget extends ReactWidget {
  label: string;
  onClick?: () => void;
  constructor(label: string, onClick?: () => void) {
    super();
    this.label = label;
    this.onClick = onClick;
    this.addClass('lc-index-widget-label');
  }

  render(): JSX.Element {
    return <Header label={this.label} onClick={this.onClick} />;
  }
}
