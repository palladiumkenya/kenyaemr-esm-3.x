import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MainComponent from './component/main.component';
import DeceasedDetailsView from './details/deceased-details.component';
import { AdmittedQueue } from './tables/admitted-queue.component';

const Root: React.FC = () => {
  const baseName = window.getOpenmrsSpaBase() + 'home/morgue';

  return (
    <BrowserRouter basename={baseName}>
      <Routes>
        <Route path="/" element={<MainComponent />} />
        <Route path="/allocation" element={<AdmittedQueue />} />
        <Route path="/patient/:patientUuid" element={<DeceasedDetailsView />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Root;
