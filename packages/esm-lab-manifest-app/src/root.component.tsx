import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LabManifestComponent from './component/lab-manifest.component';

const Root: React.FC = () => {
  const baseName = window.getOpenmrsSpaBase() + 'home/lab-manifest';

  return (
    <BrowserRouter basename={baseName}>
      <Routes>
        <Route path="/" element={<LabManifestComponent />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Root;
