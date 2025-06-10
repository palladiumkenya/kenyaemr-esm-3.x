import React from 'react';
import { useParams } from 'react-router-dom';
import { ExtensionSlot, WorkspaceContainer, isDesktop, useExtensionStore, useLayoutType } from '@openmrs/esm-framework';
import DashboardView from './dashboard-view.component';
import styles from './home-dashboard.scss';
import { DashboardConfig } from '../../types';

export default function Dashboard() {
  const params = useParams();
  const extensionStore = useExtensionStore();
  const layout = useLayoutType();
  const ungroupedDashboards =
    extensionStore.slots['adr-assessment-page-dashboard-slot']?.assignedExtensions
      .map((e) => e.meta)
      .filter((e) => Object.keys(e).length) || [];
  const dashboards = ungroupedDashboards as Array<DashboardConfig>;
  const activeDashboard = dashboards.find((dashboard) => dashboard.name === params?.dashboard) || dashboards[0];

  return (
    <>
      <div className={styles.homePageWrapper}>
        <section className={isDesktop(layout) ? styles.dashboardContainer : styles.dashboardContainerTablet}>
          {isDesktop(layout) && <ExtensionSlot name="adr-assessment-side-nav-slot" key={layout} />}
          <DashboardView title={activeDashboard?.name} dashboardSlot={activeDashboard?.slot} />
        </section>
        <WorkspaceContainer overlay contextKey="adr-assessment" />
      </div>
    </>
  );
}
