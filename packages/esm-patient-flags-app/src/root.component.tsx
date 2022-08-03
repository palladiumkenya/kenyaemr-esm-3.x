import React from 'react';
import { BrowserRouter } from 'react-router-dom';

const PatientSearchRootComponent: React.FC = () => {
  return <BrowserRouter basename={`${window['getOpenmrsSpaBase']()}`}></BrowserRouter>;
};

export default PatientSearchRootComponent;
