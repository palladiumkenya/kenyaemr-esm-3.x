import { useAssignedExtensions, ExtensionSlot } from '@openmrs/esm-framework';
import React from 'react';
import { useParams } from 'react-router-dom';
import { DashboardConfig } from '../../types/index';
import styles from './dashboard-container.scss';

const DashboardContainer: React.FC = () => {
  const params = useParams();
  const assignedExtensions = useAssignedExtensions('billing-admin-dashboard-slot');

  const ungroupedDashboards = assignedExtensions.map((e) => e.meta).filter((e) => Object.keys(e).length) || [];
  const dashboards = ungroupedDashboards as Array<DashboardConfig>;
  const activeDashboard = dashboards.find((dashboard) => dashboard.name === params?.dashboard) || dashboards[0];

  return (
    <div className={styles.dashboardContainer}>
      <ExtensionSlot
        className={styles.dashboardView}
        name={activeDashboard?.slot}
        state={{ dashboardTitle: activeDashboard?.name }}
      />
    </div>
  );
};

export default DashboardContainer;
