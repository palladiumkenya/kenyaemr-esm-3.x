import React, { useMemo } from 'react';
import classNames from 'classnames';
import last from 'lodash-es/last';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { ConfigurableLink, MaybeIcon, evaluateAsBoolean } from '@openmrs/esm-framework';
import styles from './dashboard.scss';
import { getPatientFromStore } from '@openmrs/esm-patient-common-lib';
import { usePatientEnrollment } from './useDashboard';
import { InlineLoading } from '@carbon/react';

export interface DashboardExtensionProps {
  path: string;
  title: string;
  basePath: string;
  icon: string;
  showWhenExpression?: string;
}

export const DashboardExtension = ({ path, title, basePath, icon, showWhenExpression }: DashboardExtensionProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const patient = getPatientFromStore();
  const { activePatientEnrollment, patientEnrollments, isLoading } = usePatientEnrollment(patient?.id);

  const show = evaluateAsBoolean(showWhenExpression, {
    activePatientEnrollment,
    patientEnrollments,
    patient,
  });

  const navLink = useMemo(() => decodeURIComponent(last(location.pathname) ?? ''), [location.pathname]);

  if (!show) {
    return null;
  }

  return (
    <div key={path}>
      <ConfigurableLink
        className={classNames('cds--side-nav__link', { 'active-left-nav-link': path === navLink })}
        to={`${basePath}/${encodeURIComponent(path)}`}>
        <span className={styles.menu}>
          {isLoading ? (
            <InlineLoading description={t('loading', 'Loading...')} />
          ) : (
            <>
              <MaybeIcon icon={icon} className={styles.icon} size={16} />
              <span>{t(title)}</span>
            </>
          )}
        </span>
      </ConfigurableLink>
    </div>
  );
};
