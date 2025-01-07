import React from 'react';
import { ExtensionSlot, PageHeader, AppointmentsPictogram, PageHeaderContent } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import styles from './dashboard-view.scss';
const DashboardView: React.FC<{ dashboardSlot: string; title: string }> = ({ dashboardSlot, title }) => {
  const { t } = useTranslation();
  return (
    <>
      <PageHeader className={styles.pageHeader}>
        <PageHeaderContent title={t('crossBorder', 'Cross Border')} illustration={<AppointmentsPictogram />} />
      </PageHeader>
      <ExtensionSlot name={dashboardSlot} state={{ dashboardTitle: title }} />
    </>
  );
};

export default DashboardView;
