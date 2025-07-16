import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { UserHasAccess } from '@openmrs/esm-framework';
import MainComponent from './home/home.component';
import DeceasedDetailsView from './view-details/main/main.component';

const Root: React.FC = () => {
  const baseName = window.getOpenmrsSpaBase() + 'home/morgue';

  return (
    <BrowserRouter basename={baseName}>
      <UserHasAccess privilege="o3 : View Mortuary Dashboard">
        <Routes>
          <Route path="/" element={<MainComponent />} />
          <Route
            path="/patient/:patientUuid/compartment/:bedNumber/:bedId/mortuary-chart"
            element={<DeceasedDetailsView />}
          />
          <Route path="/patient/:patientUuid/mortuary-chart" element={<DeceasedDetailsView />} />
        </Routes>
      </UserHasAccess>
    </BrowserRouter>
  );
};

export default Root;
