import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WrapComponent from './case-management/wrap/wrap.component';

const Root: React.FC = () => {
  return (
    <BrowserRouter basename={`${window['getOpenmrsSpaBase']()}`}>
      <Routes>
        <Route path="/" element={<WrapComponent />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Root;
