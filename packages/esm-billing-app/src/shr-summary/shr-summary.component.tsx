import React from 'react';
import styles from './shr-summary.scss';
import SHRSummaryHeader from './shr-summary-header.component';
import PatientSHRSummartTable from './tables/shr-summary-table.component';

const SHRSummaryPanell = () => {
  return (
    <div className={`omrs-main-content`}>
      <SHRSummaryHeader />
      <PatientSHRSummartTable />
    </div>
  );
};

export default SHRSummaryPanell;
