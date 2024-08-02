import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ReferralWrap from './referrals-wrap';
const SHRRootComponent: React.FC = () => {
  const baseName = window.getOpenmrsSpaBase() + 'home/referrals';
  return (
    <BrowserRouter basename={baseName}>
      <Routes>
        <Route path="/" element={<ReferralWrap />} />
      </Routes>
    </BrowserRouter>
  );
};

export default SHRRootComponent;
