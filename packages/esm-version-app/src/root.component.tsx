import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import About from './about/about.component';
export const spaRoot = window['getOpenmrsSpaBase']();

const Root: React.FC = () => {
  return (
    <BrowserRouter basename={spaRoot}>
      <About />
    </BrowserRouter>
  );
};
export default Root;
