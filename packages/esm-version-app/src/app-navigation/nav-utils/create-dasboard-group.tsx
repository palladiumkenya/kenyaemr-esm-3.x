import React from 'react';
import DashboardGroupExtension from './dashboard-group-extension.component';
import { CarbonIconType } from '@carbon/react/icons';
import { createDashboardGroup as cdg } from '@openmrs/esm-patient-common-lib';
type Conf = {
  title: string;
  slotName: string;
  isExpanded?: boolean;
  icon?: CarbonIconType;
};

const createDashboardGroup = ({ slotName, title, isExpanded, icon }: Conf) => {
  const DashboardGroup = ({ basePath }: { basePath: string }) => {
    return (
      <DashboardGroupExtension
        title={title}
        slotName={slotName}
        basePath={basePath}
        isExpanded={isExpanded}
        icon={icon}
      />
    );
  };
  return DashboardGroup;
};

export default createDashboardGroup;
