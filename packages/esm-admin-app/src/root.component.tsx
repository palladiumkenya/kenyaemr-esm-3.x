import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { etlBasePath } from './constants';
import Dashboard from './Components/Dashboard/dashboard.component';

const Root: React.FC = () => {
  return (
    <BrowserRouter basename={etlBasePath}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Root;
