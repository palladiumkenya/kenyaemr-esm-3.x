import React from 'react';
import PharmacyDetailHeader from '../pharmacy-detail-header/pharmacy-detail-header.component';
import { PharmacyTabs } from '../pharmacy-tabs/pharmacy-tabs-component';

const PharmacyDetail = () => {
  return (
    <div>
      <PharmacyDetailHeader />
      <PharmacyTabs />
    </div>
  );
};

export default PharmacyDetail;
