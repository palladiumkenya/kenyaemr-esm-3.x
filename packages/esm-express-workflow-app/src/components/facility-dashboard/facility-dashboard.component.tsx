import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAssignedExtensions } from '@openmrs/esm-framework';

import HomeHeader from './components/header/home-header.component';
import { DashboardConfig } from '../../types/index';
import { DashboardMetric } from './components/dashboardMetric.component';
import { TopDiseasesBarCharts } from './components/topDiseasesBarCharts.component';
import { fetchDashboardData, DashboardData } from './facility-dashboard.resource';
import styles from './facility-dashboard.scss';
import AdmittedOPDLineChart from './components/admittedOPDLineChart';

const FacilityDashboard: React.FC = () => {
  const params = useParams();
  const assignedExtensions = useAssignedExtensions('express-workflow-left-panel-slot');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [dateRange, setDateRange] = useState({ startDate: today, endDate: today });

  const dashboards = useMemo(() => {
    const ungrouped = assignedExtensions
      .map((extension) => extension.meta)
      .filter((meta) => meta && Object.keys(meta).length > 0);
    return (ungrouped as Array<DashboardConfig>) || [];
  }, [assignedExtensions]);

  const activeDashboard = useMemo(() => {
    if (!dashboards.length) {
      return undefined;
    }
    return dashboards.find((dashboard) => dashboard.name === params?.dashboard) || dashboards[0];
  }, [dashboards, params?.dashboard]);

  const loadData = useCallback(async (startDate?: string, endDate?: string) => {
    setIsLoading(true);
    try {
      const data = await fetchDashboardData(startDate, endDate);
      setDashboardData(data);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(dateRange.startDate, dateRange.endDate);
  }, [dateRange, loadData]);

  const handleDateChange = useCallback((startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate });
  }, []);

  return (
    <div>
      <div className={styles.homePageWrapper}>
        <section style={{ width: '100%' }}>
          <HomeHeader title="Dashboard" onDateChange={handleDateChange} />

          {!dashboards.length ? (
            <div className={styles.dashboardView}>No dashboards available.</div>
          ) : isLoading ? (
            <div className={styles.dashboardView}>Loading...</div>
          ) : (
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
                  <DashboardMetric
                    title="General OPD Attendance >5 years"
                    value={dashboardData?.metrics.opdOver5 ?? 0}
                  />
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
          )}
        </section>
      </div>
    </div>
  );
};

export default FacilityDashboard;
