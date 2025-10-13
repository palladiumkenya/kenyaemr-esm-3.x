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
  generalOpdData: {
    childrenUnder5: Array<{ day: string; value: number }>;
    over5YearsOld: Array<{ day: string; value: number }>;
  };
  admissionCases: Array<{
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
      opdUnder5: repsonse.indicators.generalOutpatientVisits.childrenUnder5.total ?? 0,
      opdOver5: repsonse.indicators.generalOutpatientVisits.over5YearsOld.total ?? 0,
      emergencyCases: repsonse.indicators.emergencyCases.total ?? 0,
      referralsIn: repsonse.indicators.referrals.in.total ?? 0,
      referralsOut: repsonse.indicators.referrals.out.total ?? 0,
    },
    topDiseases: [
      ...repsonse.indicators.topTenDiseases.childrenUnder5.data.map((item) => ({
        ...item,
        ageGroup: 'under5' as const,
      })),
      ...repsonse.indicators.topTenDiseases.over5YearsOld.data.map((item) => ({ ...item, ageGroup: 'over5' as const })),
    ],
    generalOpdData: {
      childrenUnder5: repsonse.indicators.generalOutpatientVisits.childrenUnder5.data,
      over5YearsOld: repsonse.indicators.generalOutpatientVisits.over5YearsOld.data,
    },
    admissionCases: repsonse.indicators.admissionCases.data,
  };

  return dashboardData;
}
