import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { type DashboardLinkConfig } from '@openmrs/esm-patient-common-lib';
import { DashboardExtension } from './dashboard.component';

type CustomDashboardLinkConfig = DashboardLinkConfig & {
  showWhenExpression?: string;
};

export const createDashboardLink = (db: CustomDashboardLinkConfig) => {
  return ({ basePath }: { basePath: string }) => {
    return (
      <BrowserRouter>
        <DashboardExtension
          basePath={basePath}
          title={db.title}
          path={db.path}
          icon={db.icon}
          showWhenExpression={db.showWhenExpression}
        />
      </BrowserRouter>
    );
  };
};
