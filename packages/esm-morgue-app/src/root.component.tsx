import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { UserHasAccess } from '@openmrs/esm-framework';
import MainComponent from './component/main.component';
import { AdmittedQueue } from './tables/admitted-queue.component';

const Root: React.FC = () => {
  const baseName = window.getOpenmrsSpaBase() + 'home/morgue';

  return (
    <BrowserRouter basename={baseName}>
      <UserHasAccess privilege="o3 : View Mortuary Dashboard">
        <Routes>
          <Route path="/" element={<MainComponent />} />
          <Route path="/allocation" element={<AdmittedQueue />} />
        </Routes>
      </UserHasAccess>
    </BrowserRouter>
  );
};

export default Root;
