import React, { useMemo } from 'react';
import { ConfigurableLink } from '@openmrs/esm-framework';
import { BrowserRouter, useLocation } from 'react-router-dom';

export interface UserManagementLinkConfig {
  name: string;
  title: string;
}

function UserManagementExtension({ userManagementLinkConfig }: { userManagementLinkConfig: UserManagementLinkConfig }) {
  const { name, title } = userManagementLinkConfig;
  const location = useLocation();
  const spaBasePath = `${window.spaBase}/admin`;

  const navLink = useMemo(() => {
    const pathArray = location.pathname.split('/');
    const lastElement = pathArray[pathArray.length - 1];
    return decodeURIComponent(lastElement);
  }, [location.pathname]);

  return (
    <ConfigurableLink
      to={`${spaBasePath}/${name}`}
      className={`cds--side-nav__link ${navLink.match(name) && 'active-left-nav-link'}`}>
      {title}
    </ConfigurableLink>
  );
}

export const createUserManagementLink = (userManagementLinkConfig: UserManagementLinkConfig) => () =>
  (
    <BrowserRouter>
      <UserManagementExtension userManagementLinkConfig={userManagementLinkConfig} />
    </BrowserRouter>
  );
