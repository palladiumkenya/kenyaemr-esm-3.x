import React from 'react';
import capitalize from 'lodash-es/capitalize';
import { PageHeader, HomePictogram, ExtensionSlot, PageHeaderContent } from '@openmrs/esm-framework';

import styles from './reports.scss';

type ReportsProps = {
  dashboardTitle: string;
};

const Reports: React.FC<ReportsProps> = ({ dashboardTitle }) => {
  return (
    <div className={`omrs-main-content`}>
      <PageHeader className={styles.pageHeader}>
        <PageHeaderContent title={capitalize(dashboardTitle)} illustration={<HomePictogram />} />

        <ExtensionSlot name="provider-banner-info-slot" />
      </PageHeader>
    </div>
  );
};

export default Reports;
