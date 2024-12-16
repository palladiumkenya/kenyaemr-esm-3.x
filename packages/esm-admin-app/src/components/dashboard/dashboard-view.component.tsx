import React from 'react';
import { ExtensionSlot } from '@openmrs/esm-framework';
import { UserManagement } from '../users/user_mamagemet.component';

const DashboardView: React.FC<{ dashboardSlot: string; title: string }> = ({ dashboardSlot, title }) => {
  return (
    <>
      <UserManagement />
      <ExtensionSlot name={dashboardSlot} state={{ dashboardTitle: title }} />
    </>
  );
};

export default DashboardView;
