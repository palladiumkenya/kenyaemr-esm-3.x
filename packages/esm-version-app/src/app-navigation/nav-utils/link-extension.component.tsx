import { ConfigurableLink } from '@openmrs/esm-framework';
import React, { ReactNode, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { parseParams } from './utils';
import { CarbonIconType } from '@carbon/react/icons';
import styles from './nav.scss';
export interface LinkConfig {
  route: string;
  title: string;
  otherRoutes?: Array<string>;
  icon?: CarbonIconType;
}

export const LinkExtension: React.FC<LinkConfig> = ({ route, title, otherRoutes = [], icon }) => {
  const spaBasePath = window.getOpenmrsSpaBase();
  const location = useLocation();
  const path = useMemo(() => location.pathname.replace(spaBasePath, ''), [spaBasePath, location]);
  // Parse params to see if the current route matches the location path
  const matcher = useCallback(
    (route: string) => {
      const staticMatch = `/${route}/`.replaceAll('//', '/') === `/${path}/`.replaceAll('//', '/'); // Exact match for static routes
      const paramMatch = !staticMatch && parseParams(route, path) !== null; // Check parameterized match if not exact

      return staticMatch || paramMatch;
    },
    [path],
  );
  // Check if the route is active
  const isActive = matcher(route);
  const isOtherRoutesActive = useMemo(() => {
    return otherRoutes.some(matcher);
  }, [otherRoutes, matcher]);
  // Generate the `to` URL for the ConfigurableLink
  const to = useMemo(() => {
    return (spaBasePath + route).replaceAll('//', '/');
  }, [spaBasePath, route]);

  return (
    <ConfigurableLink
      to={to}
      className={`cds--side-nav__link ${isActive || isOtherRoutesActive ? 'active-left-nav-link' : ''} ${
        styles.itemTitle
      }`}>
      {icon && React.createElement(icon)}
      {title}
    </ConfigurableLink>
  );
};
