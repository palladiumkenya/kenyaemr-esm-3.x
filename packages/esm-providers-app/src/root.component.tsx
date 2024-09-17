import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ProvidersComponent from './component/providers.component';
import { providerBasePath } from './constants';

const Root: React.FC = () => {
  return (
    <BrowserRouter basename={providerBasePath}>
      <Routes>
        <Route path="/" element={<ProvidersComponent />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Root;
