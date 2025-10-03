import React from 'react';
import { useParams } from 'react-router-dom';
import { ExtensionSlot, WorkspaceContainer, isDesktop, useExtensionStore, useLayoutType } from '@openmrs/esm-framework';
import DashboardView from './dashboard-view.component';
import styles from './home-dashboard.scss';

interface DashboardConfig {
  name: string;
  slot: string;
}

export default function Dashboard() {
  const params = useParams();
  const extensionStore = useExtensionStore();

  const layout = useLayoutType();
  const ungroupedDashboards =
    extensionStore.slots['lab-manifest-page-dashboard-slot']?.assignedExtensions
      .map((e) => e.meta)
      .filter((e) => Object.keys(e).length) || [];
  const dashboards = ungroupedDashboards as Array<DashboardConfig>;
  const activeDashboard = dashboards.find((dashboard) => dashboard.name === params?.dashboard) || dashboards[0];

  return (
    <>
      <div cllabs-manifest-page-dasassName={styles.homePageWrapper}>
        <section className={isDesktop(layout) ? styles.dashboardContainer : styles.dashboardContainerTablet}>
          {isDesktop(layout) && <ExtensionSlot name="lab-manifest-side-nav-slot" key={layout} />}
          <DashboardView title={activeDashboard?.name} dashboardSlot={activeDashboard?.slot} />
        </section>
        <WorkspaceContainer overlay contextKey="lab-manifest" />
      </div>
    </>
  );
}
