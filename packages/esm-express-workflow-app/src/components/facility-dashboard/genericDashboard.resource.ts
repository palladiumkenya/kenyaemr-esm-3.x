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
  // const mock = {
  //   indicators: {
  //     generalOutpatientVisits: {
  //       childrenUnder5: {
  //         data: [
  //           {
  //             value: 3,
  //             day: '2025-09-05',
  //           },
  //         ],
  //       },
  //       adultsAbove5: {
  //         data: [
  //           {
  //             value: 27,
  //             day: '2025-09-05',
  //           },
  //           {
  //             value: 1,
  //             day: '2025-09-09',
  //           },
  //         ],
  //       },
  //     },
  //     topTenDiseases: {
  //       data: [
  //         {
  //           value: 1,
  //           group: 'CNS embryonal tumour, NOS',
  //           day: '2025-09-10',
  //         },
  //         {
  //           value: 1,
  //           group: 'congenital falciparum malaria',
  //           day: '2025-09-09',
  //         },
  //         {
  //           value: 7,
  //           group: 'Gastritis',
  //           day: '2025-09-05',
  //         },
  //         {
  //           value: 3,
  //           group: 'Allergic rhinitis',
  //           day: '2025-09-05',
  //         },
  //         {
  //           value: 3,
  //           group: 'Acute Tonsillitis',
  //           day: '2025-09-05',
  //         },
  //         {
  //           value: 2,
  //           group: 'Dermatophytosis',
  //           day: '2025-09-05',
  //         },
  //         {
  //           value: 2,
  //           group: 'Sepsis without septic shock',
  //           day: '2025-09-05',
  //         },
  //         {
  //           value: 1,
  //           group: 'Acute Pharyngitis',
  //           day: '2025-09-05',
  //         },
  //         {
  //           value: 1,
  //           group: 'Symptom or complaint of the leg or thigh',
  //           day: '2025-09-05',
  //         },
  //         {
  //           value: 1,
  //           group: 'Urinary tract infection, site not specified',
  //           day: '2025-09-05',
  //         },
  //         {
  //           value: 1,
  //           group: 'Gastritis, unspecified',
  //           day: '2025-09-05',
  //         },
  //         {
  //           value: 1,
  //           group: 'Calculus of gallbladder or cystic duct without cholecystitis or cholangitis',
  //           day: '2025-09-05',
  //         },
  //       ],
  //     },
  //     emergencyCases: {
  //       data: [
  //         {
  //           value: 5,
  //           day: '2025-09-11',
  //         },
  //         {
  //           value: 2,
  //           day: '2025-09-10',
  //         },
  //         {
  //           value: 4,
  //           day: '2025-09-09',
  //         },
  //       ],
  //     },
  //     referrals: {
  //       in: {
  //         data: [
  //           {
  //             value: 1,
  //             day: '2025-09-10',
  //           },
  //           {
  //             value: 1,
  //             day: '2025-09-09',
  //           },
  //         ],
  //       },
  //       out: {
  //         data: [
  //           {
  //             value: 1,
  //             day: '2025-09-10',
  //           },
  //         ],
  //       },
  //     },
  //   },
  // };
  const repsonse = res.data;
  const dashboardData: DashboardData = {
    metrics: {
      opdUnder5: repsonse.indicators.generalOutpatientVisits.childrenUnder5.data.reduce(
        (sum, item) => sum + item.value,
        0,
      ),
      opdOver5: repsonse.indicators.generalOutpatientVisits.adultsAbove5.data.reduce(
        (sum, item) => sum + item.value,
        0,
      ),
      emergencyCases: repsonse.indicators.emergencyCases.data.reduce((sum, item) => sum + item.value, 0),
      referralsIn: repsonse.indicators.referrals.in.data.reduce((sum, item) => sum + item.value, 0),
      referralsOut: repsonse.indicators.referrals.out.data.reduce((sum, item) => sum + item.value, 0),
    },
    topDiseases: repsonse.indicators.topTenDiseases.data,
    emergencyOpdData: repsonse.indicators.emergencyCases.data,
  };

  return dashboardData;
}
