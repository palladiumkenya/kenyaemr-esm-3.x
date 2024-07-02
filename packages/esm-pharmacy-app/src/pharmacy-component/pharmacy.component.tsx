import React from 'react';
import { PhamacyHeader } from '../pharmacy-header/pharmacy-header.component';

const MorgueComponent: React.FC = () => {
  return (
    <div className={`omrs-main-content`}>
      <PhamacyHeader title={'Pharmacy'} />
    </div>
  );
};

export default MorgueComponent;
