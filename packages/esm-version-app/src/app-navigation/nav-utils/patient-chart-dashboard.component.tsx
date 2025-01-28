import { CarbonIconType } from '@carbon/react/icons';
import { ConfigurableLink } from '@openmrs/esm-framework';
import classNames from 'classnames';
import last from 'lodash-es/last';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import styles from './nav.scss';

export interface DashboardExtensionProps {
  path: string;
  title: string;
  basePath: string;
  moduleName?: string;
  icon?: CarbonIconType;
}

const PatientChartDasboardExtension = ({
  path,
  title,
  basePath,
  moduleName = '@openmrs/esm-patient-chart-app',
  icon,
}: DashboardExtensionProps) => {
  const { t } = useTranslation(moduleName);
  const location = useLocation();
  const navLink = useMemo(() => decodeURIComponent(last(location.pathname.split('/'))), [location.pathname]);

  return (
    <div key={path}>
      <ConfigurableLink
        className={classNames('cds--side-nav__link', { 'active-left-nav-link': path === navLink }, styles.itemTitle)}
        to={`${basePath}/${encodeURIComponent(path)}`}>
        {icon && React.createElement(icon)}
        {t(title)}
      </ConfigurableLink>
    </div>
  );
};

export default PatientChartDasboardExtension;
