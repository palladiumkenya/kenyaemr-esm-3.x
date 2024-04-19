import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MorgueComponent from './morgue-component/morgue.component';

const Root: React.FC = () => {
  const baseName = window.getOpenmrsSpaBase() + 'home/morgue';

  return (
    <BrowserRouter basename={baseName}>
      <Routes>
        <Route path="/" element={<MorgueComponent />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Root;
