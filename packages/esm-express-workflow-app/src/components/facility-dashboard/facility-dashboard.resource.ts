import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

export interface DashboardData {
  metrics: {
    opdUnder5: number;
    opdOver5: number;
    emergencyCases: number;
    referralsIn: number;
    referralsOut: number;
  };
  topDiseases: Array<{
    day: string;
    group: string;
    value: number;
    ageGroup: 'under5' | 'over5';
  }>;
  emergencyOpdData: Array<{
    day: string;
    value: number;
  }>;
}

export async function fetchDashboardData(startDate?: string, endDate?: string): Promise<DashboardData> {
  const today = new Date().toISOString().split('T')[0];
  const start = startDate || today;
  const end = endDate || today;

  const res = await openmrsFetch<any>(
    `${restBaseUrl}/kenyaemr/main-facility-dashboard?startDate=${start}&endDate=${end}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
  if (res.status !== 200) {
    throw new Error('Failed to fetch dashboard data');
  }
  const repsonse = res.data;
  const dashboardData: DashboardData = {
    metrics: {
      opdUnder5: repsonse.indicators.generalOutpatientVisits.childrenUnder5.data.reduce(
        (sum, item) => sum + item.value,
        0,
      ),
      opdOver5: repsonse.indicators.generalOutpatientVisits.over5YearsOld.data.reduce(
        (sum, item) => sum + item.value,
        0,
      ),
      emergencyCases: repsonse.indicators.emergencyCases.data.reduce((sum, item) => sum + item.value, 0),
      referralsIn: repsonse.indicators.referrals.in.data.reduce((sum, item) => sum + item.value, 0),
      referralsOut: repsonse.indicators.referrals.out.data.reduce((sum, item) => sum + item.value, 0),
    },
    topDiseases: [
      ...repsonse.indicators.topTenDiseases.childrenUnder5.data.map((item) => ({
        ...item,
        ageGroup: 'under5' as const,
      })),
      ...repsonse.indicators.topTenDiseases.over5YearsOld.data.map((item) => ({ ...item, ageGroup: 'over5' as const })),
    ],
    emergencyOpdData: repsonse.indicators.emergencyCases.data,
  };

  return dashboardData;
}
