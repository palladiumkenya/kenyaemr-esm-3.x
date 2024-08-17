import React from 'react';
import PatientSHRSummartTable from './tables/shr-summary-table.component';

const SHRSummaryPanel = () => {
  return (
    <div className={`omrs-main-content`}>
      <PatientSHRSummartTable />
    </div>
  );
};

export default SHRSummaryPanel;
