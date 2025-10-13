import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';

import { useAssignedExtensions, ExtensionSlot } from '@openmrs/esm-framework';

import { DashboardConfig } from '../../types';

import HomeHeader from './components/header/home-header.component';
import { DashboardMetric } from './components/dashboardMetric.component';
import { TopDiseasesBarCharts } from './components/topDiseasesBarCharts.component';
import AdmittedOPDLineChart from './components/admitted-opd-line-chart.component';

import styles from './generic-dashboard.scss';
import { useFacilityDashboardData } from './hooks/useFacilityDashboardData';

const GenericDashboard: React.FC = () => {
  const params = useParams();
  const assignedExtensions = useAssignedExtensions('express-workflow-left-panel-slot');
  const today = dayjs().format('YYYY-MM-DD');
  const [dateRange, setDateRange] = useState({ startDate: today, endDate: today });
  const { data: dashboardData, error, isLoading } = useFacilityDashboardData(dateRange.startDate, dateRange.endDate);

  const ungroupedDashboards = assignedExtensions.map((e) => e.meta).filter((e) => Object.keys(e).length) || [];
  const dashboards = ungroupedDashboards as Array<DashboardConfig>;
  const activeDashboard = dashboards.find((dashboard) => dashboard.name === params?.dashboard) || dashboards[0];

  const handleDateChange = (startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate });
  };

  return (
    <div>
      <div className={styles.homePageWrapper}>
        <section style={{ width: '100%' }}>
          <HomeHeader title="Dashboard" onDateChange={handleDateChange} />

          <div className={styles.dashboardView}>
            {/* First Row: Bar Charts for Top Diseases */}
            <div className={styles.firstRow}>
              <TopDiseasesBarCharts data={dashboardData?.topDiseases} />
            </div>

            {/* Second Row: 3 Metric Tiles */}
            <div className={styles.secondRow}>
              <div className={styles.metricTile}>
                <DashboardMetric
                  title="General OPD Attendance <5 years"
                  value={dashboardData?.metrics.opdUnder5 ?? 0}
                />
              </div>
              <div className={styles.metricTile}>
                <DashboardMetric title="General OPD Attendance >5 years" value={dashboardData?.metrics.opdOver5 ?? 0} />
              </div>
              <div className={styles.metricTile}>
                <DashboardMetric
                  title="Number of Emergency Cases Seen"
                  value={dashboardData?.metrics.emergencyCases ?? 0}
                />
              </div>
            </div>

            {/* Third Row: Left Metrics (30%) + Right Line Chart (70%) */}
            <div className={styles.thirdRow}>
              <div className={styles.leftSection}>
                <div className={styles.verticalMetricTile}>
                  <DashboardMetric
                    title="Total Number of Referrals - IN"
                    value={dashboardData?.metrics.referralsIn ?? 0}
                  />
                </div>
                <div className={styles.verticalMetricTile}>
                  <DashboardMetric
                    title="Total Number of Referrals - OUT"
                    value={dashboardData?.metrics.referralsOut ?? 0}
                  />
                </div>
              </div>
              <div className={styles.rightSection}>
                <AdmittedOPDLineChart opd={dashboardData?.generalOpdData} admissions={dashboardData.admissionCases} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default GenericDashboard;
