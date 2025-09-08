import React, { useMemo } from 'react';
import last from 'lodash-es/last';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { ConfigurableLink, MaybeIcon } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';

import styles from './leftt-panel-link.scss';

export interface LinkConfig {
  name: string;
  title: string;
  icon?: string;
}

export function LinkExtension({ config }: { config: LinkConfig }) {
  const { name, title, icon } = config;
  const { t } = useTranslation();
  const location = useLocation();
  const spaBasePath = window.getOpenmrsSpaBase() + 'home';

  let urlSegment = useMemo(() => decodeURIComponent(last(location.pathname.split('/'))!), [location.pathname]);

  const isUUID = (value) => {
    const regex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;
    return regex.test(value);
  };

  if (isUUID(urlSegment)) {
    urlSegment = location.pathname.split('/').at(-1);
  }

  return (
    <ConfigurableLink
      className={`cds--side-nav__link ${name === urlSegment && 'active-left-nav-link'}`}
      to={spaBasePath + '/' + name}>
      <span className={styles.menu}>
        <MaybeIcon icon={icon} className={styles.icon} size={16} />
        <span>{t(title)}</span>
      </span>
    </ConfigurableLink>
  );
}

export const createLeftPanelLink = (config: LinkConfig) => () =>
  (
    <BrowserRouter>
      <LinkExtension config={config} />
    </BrowserRouter>
  );
