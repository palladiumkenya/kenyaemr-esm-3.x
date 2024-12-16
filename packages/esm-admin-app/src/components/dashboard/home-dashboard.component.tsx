import React from 'react';
import { useParams } from 'react-router-dom';
import { useLayoutType, isDesktop, useExtensionStore, ExtensionSlot, WorkspaceContainer } from '@openmrs/esm-framework';
import DashboardView from './dashboard-view.component';
import styles from './home-dashboard.scss';
import { type DashboardConfig } from '../../types';
import Overlay from '../overlay/overlay.component';

export default function Dashboard() {
  const params = useParams();
  const extensionStore = useExtensionStore();
  const layout = useLayoutType();
  const ungroupedDashboards =
    extensionStore.slots['admin-page-dashboard-slot']?.assignedExtensions
      .map((e) => e.meta)
      .filter((e) => Object.keys(e).length) || [];
  const dashboards = ungroupedDashboards as Array<DashboardConfig>;
  const activeDashboard = dashboards.find((dashboard) => dashboard.name === params?.dashboard) || dashboards[0];

  return (
    <>
      <Overlay />
      <div className={styles.homePageWrapper}>
        <section className={isDesktop(layout) ? styles.dashboardContainer : styles.dashboardContainerTablet}>
          {isDesktop(layout) && <ExtensionSlot name="admin-sidebar-slot" key={layout} />}
          <DashboardView title={activeDashboard?.name} dashboardSlot={activeDashboard?.slot} />
        </section>
        <WorkspaceContainer overlay contextKey="admin" />
      </div>
    </>
  );
}
