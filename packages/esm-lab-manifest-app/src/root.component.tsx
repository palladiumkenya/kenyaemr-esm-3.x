import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LabManifestComponent from './component/lab-manifest.component';
import LabManifestDetail from './component/lab-manifest-detail.component';
import LabManifestOverview from './component/lab-manifest-overview.component';

const Root: React.FC = () => {
  const baseName = window.getOpenmrsSpaBase() + 'home/lab-manifest';

  return (
    <BrowserRouter basename={baseName}>
      <Routes>
        <Route path="/" element={<LabManifestComponent />} />
        <Route path="/overview" element={<LabManifestOverview />} />
        <Route path="/:manifestUuid" element={<LabManifestDetail />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Root;
