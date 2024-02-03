import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CommunityReferrals from './community-referrals/community-referrals.component';

const SHRRootComponent: React.FC = () => {
  const baseName = `${window.spaBase}/home/community-referrals`;

  return (
    <BrowserRouter basename={baseName}>
      <Routes>
        <Route path="/" element={<CommunityReferrals />} />
      </Routes>
    </BrowserRouter>
  );
};

export default SHRRootComponent;
