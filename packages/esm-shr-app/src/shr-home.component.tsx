import React from 'react';
import { useLeftNav, WorkspaceContainer } from '@openmrs/esm-framework';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import styles from './shr-home.scss';
import ReferralWrap from './referrals-wrap';

const SHRHome: React.FC = () => {
  const shrBasePath = window.getOpenmrsSpaBase() + 'referrals';
  useLeftNav({ name: 'shr-dashboard-slot', basePath: shrBasePath });

  return (
    <BrowserRouter basename={shrBasePath}>
      <main className={styles.container}>
        <Routes>
          <Route path="/" element={<ReferralWrap />} />
        </Routes>
      </main>
      <WorkspaceContainer key="referrals" contextKey="referrals" />
    </BrowserRouter>
  );
};

export default SHRHome;
