import React from 'react';
import { PhamacyHeader } from '../pharmacy-header/pharmacy-header.component';
import PharmaciesTable from '../pharmacy-tables/pharmacy-table.component';

const PharmacyComponent: React.FC = () => {
  return (
    <div className={`omrs-main-content`}>
      <PhamacyHeader title={'Pharmacy'} />
      <PharmaciesTable />
    </div>
  );
};

export default PharmacyComponent;
