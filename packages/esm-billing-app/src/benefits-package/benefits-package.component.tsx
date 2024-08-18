import React from 'react';
import BenefitsHeader from './benefits-header.components';
import BenefitsTable from './table/benefits-table.component';

const BenefitsPackage = () => {
  return (
    <div className={`omrs-main-content `}>
      <BenefitsHeader />
      <BenefitsTable />
    </div>
  );
};

export default BenefitsPackage;
