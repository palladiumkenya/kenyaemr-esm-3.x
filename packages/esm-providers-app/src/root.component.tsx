import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ProvidersComponent from './providers-component/providers.component';

const Root: React.FC = () => {
  const baseName = window.getOpenmrsSpaBase() + 'home/providers';

  return (
    <BrowserRouter basename={baseName}>
      <Routes>
        <Route path="/" element={<ProvidersComponent />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Root;
