import { ConfigurableLink, MaybeIcon } from '@openmrs/esm-framework';
import last from 'lodash-es/last';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { type CarbonIconType } from '@carbon/react/icons';

import styles from './dashboard-link.scss';

export interface LinkConfig {
  name: string;
  title: string;
  icon?: string | CarbonIconType;
}

export function LinkExtension({ config }: { config: LinkConfig }) {
  const { t } = useTranslation();
  const { name, title, icon } = config;
  const nameSegment = name.split('/').at(-1);
  const location = useLocation();
  const spaBasePath = window.getOpenmrsSpaBase() + 'home';

  let urlSegment = useMemo(() => decodeURIComponent(last(location.pathname.split('/'))), [location.pathname]);
  const IconComp = typeof icon !== 'string' ? (icon as CarbonIconType) : null;

  const isActive = nameSegment === urlSegment;
  return (
    <ConfigurableLink
      to={spaBasePath + '/' + name}
      className={`cds--side-nav__link ${isActive && 'active-left-nav-link'}`}>
      {typeof icon === 'string' ? (
        <MaybeIcon icon={icon} className={styles.icon} size={16} />
      ) : (
        IconComp && <IconComp className={styles.icon} />
      )}
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
