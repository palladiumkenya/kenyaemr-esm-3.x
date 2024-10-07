import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MainComponent from './component/main.component';

const Root: React.FC = () => {
  const baseName = window.getOpenmrsSpaBase() + 'home/morgue';

  return (
    <BrowserRouter basename={baseName}>
      <Routes>
        <Route path="/" element={<MainComponent />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Root;
