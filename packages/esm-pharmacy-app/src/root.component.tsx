import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import PharmacyComponent from './pharmacy-component/pharmacy.component';
import PharmacyDetail from './pharmacy-detail/pharmacy-detail.component';

const Root: React.FC = () => {
  const baseName = window.getOpenmrsSpaBase() + 'home/pharmacy';

  return (
    <BrowserRouter basename={baseName}>
      <Routes>
        <Route path="/" element={<PharmacyComponent />} />
        <Route path="/:pharmacyUuid" element={<PharmacyDetail />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Root;
