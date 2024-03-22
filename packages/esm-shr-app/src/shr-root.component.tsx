import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CommunityReferral from './community-referrals';
const SHRRootComponent: React.FC = () => {
  const baseName = window.getOpenmrsSpaBase() + 'home/community-referrals';
  return (
    <BrowserRouter basename={baseName}>
      <Routes>
        <Route path="/" element={<CommunityReferral />} />
      </Routes>
    </BrowserRouter>
  );
};

export default SHRRootComponent;
