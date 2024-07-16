import React, { useState } from 'react';
import { LabManifestHeader } from '../header/lab-manifest-header.component';
import LabManifestMetrics from '../metrics/lab-manifest-metrics.component';
import { LabManifestTabs } from '../tabs/lab-manifest-tabs-component';
import LabManifests from '../tables/lab-manifest-table.component';

const LabManifestComponent: React.FC = () => {
  return (
    <div className={`omrs-main-content`}>
      <LabManifestHeader title={'Lab Manifest'} />
      <LabManifestMetrics />
      {/* <LabManifestTabs /> */}
      <LabManifests />
    </div>
  );
};

export default LabManifestComponent;
