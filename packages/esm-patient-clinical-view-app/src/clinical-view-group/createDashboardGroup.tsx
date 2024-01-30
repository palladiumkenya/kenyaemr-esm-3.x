import React from 'react';
import { DashboardGroupExtension } from './dashboard-group.component';
import styles from './dashboard-group.scss';

type DashboardGroupProps = {
  title: string;
  slotName: string;
  isExpanded?: boolean;
  isChild?: boolean;
};

export const createDashboardGroup = ({ title, slotName, isExpanded, isChild }: DashboardGroupProps) => {
  const DashboardGroup = ({ basePath }: { basePath: string }) => {
    return (
      <DashboardGroupExtension
        isChild={isChild}
        title={title}
        slotName={slotName}
        basePath={basePath}
        isExpanded={isExpanded}
      />
    );
  };
  return DashboardGroup;
};
