import React from 'react';
import { useParams } from 'react-router-dom';
import LabManifestDetailHeader from '../header/lab-manifest-detail-header.component';
import LabManifestActiveRequests from '../tables/lab-manifest-active-requests.component';
import LabManifestSamples from '../tables/lab-manifest-samples.component';

const LabManifestDetail = () => {
  const { manifestUuid } = useParams();
  return (
    <div>
      <LabManifestDetailHeader manifestUuid={manifestUuid} />
      <LabManifestSamples manifestUuid={manifestUuid} />
      <LabManifestActiveRequests manifestUuid={manifestUuid} />
    </div>
  );
};

export default LabManifestDetail;
