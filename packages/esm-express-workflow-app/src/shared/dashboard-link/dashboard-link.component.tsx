import { ConfigurableLink } from '@openmrs/esm-framework';
import last from 'lodash-es/last';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, useLocation } from 'react-router-dom';

export interface LinkConfig {
  name: string;
  title: string;
}

export function LinkExtension({ config }: { config: LinkConfig }) {
  const { t } = useTranslation();
  const { name, title } = config;
  const nameSegment = name.split('/').at(-1);
  const location = useLocation();
  const spaBasePath = window.getOpenmrsSpaBase() + 'home';

  let urlSegment = useMemo(() => decodeURIComponent(last(location.pathname.split('/'))), [location.pathname]);

  const isActive = nameSegment === urlSegment;
  return (
    <ConfigurableLink
      to={spaBasePath + '/' + name}
      className={`cds--side-nav__link ${isActive && 'active-left-nav-link'}`}>
      {t(title)}
    </ConfigurableLink>
  );
}

export const createLeftPanelLink = (config: LinkConfig) => () =>
  (
    <BrowserRouter>
      <LinkExtension config={config} />
    </BrowserRouter>
  );
