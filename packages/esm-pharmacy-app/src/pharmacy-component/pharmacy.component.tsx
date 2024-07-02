import React from 'react';
import { PhamacyHeader } from '../pharmacy-header/pharmacy-header.component';
import PharmacyMetrics from '../pharmacy-metrics/pharmacy-metrics.component';
import PharmaciesTable from '../pharmacy-tables/pharmacy-table.component';

const PharmacyComponent: React.FC = () => {
  return (
    <div className={`omrs-main-content`}>
      <PhamacyHeader title={'Pharmacy'} />
      <PharmacyMetrics />
      <PharmaciesTable />
    </div>
  );
};

export default PharmacyComponent;
