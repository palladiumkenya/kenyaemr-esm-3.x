import React from 'react';
import PatientChartDasboardExtension, { DashboardExtensionProps } from './patient-chart-dashboard.component';
import { BrowserRouter } from 'react-router-dom';

const createPatientChartDashboardExtension = (props: Omit<DashboardExtensionProps, 'basePath'>) => {
  return ({ basePath }: { basePath: string }) => {
    return (
      <BrowserRouter>
        <PatientChartDasboardExtension
          basePath={basePath}
          title={props.title}
          path={props.path}
          moduleName={props.moduleName}
          icon={props.icon}
        />
      </BrowserRouter>
    );
  };
};

export default createPatientChartDashboardExtension;
