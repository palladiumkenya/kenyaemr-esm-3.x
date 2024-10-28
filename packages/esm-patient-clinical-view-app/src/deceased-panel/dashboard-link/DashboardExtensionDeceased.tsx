import { ConfigurableLink } from '@openmrs/esm-framework';
import { getPatientUuidFromUrl } from '@openmrs/esm-patient-common-lib';
import classNames from 'classnames';
import last from 'lodash-es/last';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

export interface DashboardExtensionProps {
  path: string;
  title: string;
  basePath: string;
  moduleName?: string;
}

export const DashboardExtension = ({
  path,
  title,
  basePath,
  moduleName = '@openmrs/esm-patient-chart-app',
}: DashboardExtensionProps) => {
  const { t } = useTranslation(moduleName);
  const location = useLocation();

  // Determine if the current link is active
  const navLink = useMemo(() => decodeURIComponent(last(location.pathname.split('/')) ?? ''), [location.pathname]);
  const isActive = path === navLink;
  const patientUuid = getPatientUuidFromUrl();
  const url = `${basePath}/patient/${patientUuid}/chart/deceased-panel`;

  return (
    <div>
      <ConfigurableLink className={classNames('cds--side-nav__link', { 'active-left-nav-link': isActive })} to={url}>
        {t(title)}
      </ConfigurableLink>
    </div>
  );
};
