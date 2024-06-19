import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ContactProfile from './contact-list/contact-profile.component';

const Root: React.FC = () => {
  const baseName = window.getOpenmrsSpaBase() + 'patient/:patientUuid';

  return (
    <BrowserRouter basename={baseName}>
      <Routes>
        <Route path="/" element={<ContactProfile />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Root;
