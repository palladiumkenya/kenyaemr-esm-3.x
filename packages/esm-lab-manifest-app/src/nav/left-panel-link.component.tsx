import React, { useMemo, useEffect, useState } from 'react';
import { ConfigurableLink, MaybeIcon, navigate } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { type CarbonIconType } from '@carbon/react/icons';
import styles from './left-panel.scss';

export interface DashboardLinkConfig {
  name: string;
  title: string;
  icon?: string | CarbonIconType;
}

const DashboardLink = ({ dashboardLinkConfig }: { dashboardLinkConfig: DashboardLinkConfig }) => {
  const { t } = useTranslation();
  const { name, title, icon } = dashboardLinkConfig;
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePathChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePathChange);

    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(history, args);
      handlePathChange();
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(history, args);
      handlePathChange();
    };

    return () => {
      window.removeEventListener('popstate', handlePathChange);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  const IconComp = typeof icon !== 'string' ? (icon as CarbonIconType) : null;

  const isActive = useMemo(() => {
    const relativePath = currentPath.replace('/openmrs/spa', '');

    if (name === 'lab-manifest') {
      return relativePath === '/lab-manifest' || relativePath === '/lab-manifest/';
    }

    if (name === 'overview') {
      return relativePath === `/lab-manifest/${name}` || relativePath === `/lab-manifest/${name}/`;
    }

    return relativePath === `/lab-manifest/${name}` || relativePath === `/lab-manifest/${name}/`;
  }, [name, currentPath]);

  const linkUrl = useMemo(() => {
    const basePath = '/openmrs/spa/lab-manifest';
    if (name === 'lab-manifest') {
      return basePath;
    }
    return `${basePath}/${name}`;
  }, [name]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate({ to: linkUrl });
  };

  return (
    <a
      href={linkUrl}
      onClick={handleClick}
      className={`cds--side-nav__link ${styles.dashboardLink} ${
        isActive ? `${styles.active} active-left-nav-link` : ''
      }`}>
      {typeof icon === 'string' ? (
        <MaybeIcon icon={icon} className={styles.icon} size={16} />
      ) : (
        IconComp && <IconComp className={styles.icon} />
      )}
      <span>{t(title)}</span>
    </a>
  );
};

export const createDashboardLink = (dashboardLinkConfig: DashboardLinkConfig) => () => {
  return <DashboardLink dashboardLinkConfig={dashboardLinkConfig} />;
};

export default DashboardLink;
