import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Radiology from './radiology.component';

const Root: React.FC = () => {
  const baseName = window.getOpenmrsSpaBase() + 'home/radiology';

  return (
    <BrowserRouter basename={baseName}>
      <Routes>
        <Route path="/" element={<Radiology />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Root;
