import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CommunityReferralTabs from './community-referrals/community-referral-tabs/community-referrals-tabs.component';
const SHRRootComponent: React.FC = () => {
  const baseName = window.getOpenmrsSpaBase() + 'home/community-referrals';
  return (
    <BrowserRouter basename={baseName}>
      <Routes>
        <Route path="/" element={<CommunityReferralTabs />} />
      </Routes>
    </BrowserRouter>
  );
};

export default SHRRootComponent;
