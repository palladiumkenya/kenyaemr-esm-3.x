import { ConfigurableLink } from '@openmrs/esm-framework';
import last from 'lodash-es/last';
import React, { useMemo } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';

export interface LinkConfig {
  name: string;
  title: string;
}

export function LinkExtension({ config }: { config: LinkConfig }) {
  const { name, title } = config;
  const nameSegment = name.split('/').at(-1);
  const location = useLocation();
  const spaBasePath = window.getOpenmrsSpaBase() + 'home/billing';

  let urlSegment = useMemo(() => decodeURIComponent(last(location.pathname.split('/'))), [location.pathname]);

  const isUUID = (value: string) => {
    const regex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;
    return regex.test(value);
  };

  if (isUUID(urlSegment)) {
    if (location.pathname.includes('payment-points')) {
      urlSegment = location.pathname.split('/').at(-2);
    } else {
      urlSegment = '';
    }
  } else if (location.pathname.endsWith('claims') || location.pathname.endsWith('claims/')) {
    // Filling claims form screen
    urlSegment = '';
  }

  const isActive = nameSegment === urlSegment;
  return (
    <ConfigurableLink
      to={spaBasePath + '/' + name}
      className={`cds--side-nav__link ${isActive && 'active-left-nav-link'}`}>
      {title}
    </ConfigurableLink>
  );
}

export const createLeftPanelLink = (config: LinkConfig) => () =>
  (
    <BrowserRouter>
      <LinkExtension config={config} />
    </BrowserRouter>
  );
