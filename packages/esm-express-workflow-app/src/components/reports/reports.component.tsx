import React from 'react';
import capitalize from 'lodash-es/capitalize';
import { PageHeader, HomePictogram } from '@openmrs/esm-framework';

import styles from './reports.scss';

type ReportsProps = {
  dashboardTitle: string;
};

const Reports: React.FC<ReportsProps> = ({ dashboardTitle }) => {
  return (
    <div>
      <PageHeader className={styles.pageHeader} title={capitalize(dashboardTitle)} illustration={<HomePictogram />} />
    </div>
  );
};

export default Reports;
