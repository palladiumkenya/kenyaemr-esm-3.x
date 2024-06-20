import React, { useMemo } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { ConfigurableLink } from '@openmrs/esm-framework';

export interface DashboardLinkConfig {
  name: string;
  title: string;
}

function SHRDashboardLinkExtension({ dashboardLinkConfig }: { dashboardLinkConfig: DashboardLinkConfig }) {
  const { name, title } = dashboardLinkConfig;
  const spaBasePath = window.getOpenmrsSpaBase() + 'home';
  const pathName = useLocation().pathname;

  const isLinkActive = useMemo(() => pathName === `${spaBasePath}/${name}`, [pathName, spaBasePath, name]);

  return (
    <ConfigurableLink
      to={spaBasePath + '/' + name}
      className={`cds--side-nav__link ${isLinkActive && 'active-left-nav-link'}`}>
      {title}
    </ConfigurableLink>
  );
}

export const createHomeDashboardLink = (dashboardLinkConfig: DashboardLinkConfig) => () =>
  (
    <BrowserRouter>
      <SHRDashboardLinkExtension dashboardLinkConfig={dashboardLinkConfig} />
    </BrowserRouter>
  );
