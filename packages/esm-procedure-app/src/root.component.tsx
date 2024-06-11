import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Procedure from './procedure.component';
import { basePath } from './constants';

const Root: React.FC = () => {
  return (
    <BrowserRouter basename={basePath}>
      <Routes>
        <Route path="/" element={<Procedure />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Root;
