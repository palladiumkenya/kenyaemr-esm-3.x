import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { DashboardExtension } from '@openmrs/esm-styleguide';
import { useTranslation } from 'react-i18next';

export interface DashboardLinkConfig {
  path: string;
  title: string;
  titleKey?: string;
  icon: string;
}

const DashboardLinkWithTranslation = ({ config, basePath }: { config: DashboardLinkConfig; basePath: string }) => {
  const { t } = useTranslation();
  const translatedTitle = config.titleKey ? t(config.titleKey, config.title) : config.title;

  return <DashboardExtension basePath={basePath} title={translatedTitle} path={config.path} icon={config.icon} />;
};

export const createDashboardLink = (config: DashboardLinkConfig) => {
  return ({ basePath }: { basePath: string }) => {
    return (
      <BrowserRouter>
        <DashboardLinkWithTranslation config={config} basePath={basePath} />
      </BrowserRouter>
    );
  };
};
