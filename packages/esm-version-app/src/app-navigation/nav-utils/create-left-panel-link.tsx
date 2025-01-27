import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { LinkExtension } from './link-extension.component';
import { type CarbonIconType } from '@carbon/react/icons';

type LinkConfig = {
  route: string;
  title: string;
  otherRoutes?: Array<string>;
  icon?: CarbonIconType;
};

const createLeftPanelLink = (config: LinkConfig) => {
  return () => (
    <BrowserRouter>
      <LinkExtension route={config.route} title={config.title} otherRoutes={config.otherRoutes} icon={config.icon} />
    </BrowserRouter>
  );
};

export default createLeftPanelLink;
