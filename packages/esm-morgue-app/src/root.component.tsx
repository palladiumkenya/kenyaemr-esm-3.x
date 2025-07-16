import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { UserHasAccess } from '@openmrs/esm-framework';
import MainComponent from './home/home.component';

const Root: React.FC = () => {
  const baseName = window.getOpenmrsSpaBase() + 'home/morgue';

  return (
    <BrowserRouter basename={baseName}>
      <UserHasAccess privilege="o3 : View Mortuary Dashboard">
        <Routes>
          <Route path="/" element={<MainComponent />} />
        </Routes>
      </UserHasAccess>
    </BrowserRouter>
  );
};

export default Root;
