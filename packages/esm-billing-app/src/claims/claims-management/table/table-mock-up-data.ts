export const preAuthRows = [
  {
    id: '1',
    visitTime: '2024-08-17 09:00 AM',
    patientName: 'James Owemka',
    preAuthCode: 'PA001',
    status: 'Pending',
  },
  {
    id: '2',
    visitTime: '2024-08-17 10:00 AM',
    patientName: 'David Nyaboke',
    preAuthCode: 'PA010',
    status: 'Approved',
  },
  {
    id: '3',
    visitTime: '2024-08-17 09:00',
    patientName: 'Willys Ontuga',
    preAuthCode: 'PA021',
    status: 'Approved',
  },
  {
    id: '4',
    visitTime: '2024-08-17 10:00',
    patientName: 'Peter Otieno',
    preAuthCode: 'PA121',
    status: 'Pending',
  },
  {
    id: '5',
    visitTime: '2024-08-17 11:00',
    patientName: 'Vanessa Wangare',
    preAuthCode: 'PA021',
    status: 'Rejected',
  },
  {
    id: '6',
    visitTime: '2024-08-17 08:00',
    patientName: 'Hamisi Kingsley',
    preAuthCode: 'PA245',
    status: 'Rejected',
  },
];
export const Claimrows = [
  {
    id: '1',
    visitTime: '2024-08-17 09:00',
    patientName: 'John Kamau',
    claimCode: 'CL001',
    status: 'Fulfilled',
  },
  {
    id: '2',
    visitTime: '2024-08-17 10:00',
    patientName: 'Jane Otieno',
    claimCode: 'CL002',
    status: 'Unfulfilled',
  },
  {
    id: '3',
    visitTime: '2024-08-17 11:00',
    patientName: 'Fredrick Kioko',
    claimCode: 'CL003',
    status: 'Fulfilled',
  },
  {
    id: '4',
    visitTime: '2024-08-17 08:00',
    patientName: 'Sharon Hamisi',
    claimCode: 'CL004',
    status: 'Fulfilled',
  },
];

export const shaMap = [
  {
    packageCode: 'SHA-001',
    packageName: 'Eye Care',
    interventionCode: 'SHA-001-01',
    interventionName: 'Percutaneous coronary',
    shaInterventionTariff: '5,000',
    status: 'Approved',
  },
  {
    packageCode: 'SHA-004',
    packageName: 'Heart Care',
    interventionCode: 'SHA-004-01',
    interventionName: 'Peripheral artery disease',
    shaInterventionTariff: '10,000',
    status: 'Approved',
  },
  {
    packageCode: 'SHA-002',
    packageName: 'Therapy Care',
    interventionCode: 'SHA-002-09',
    interventionName: 'Optimal medical therapy',
    shaInterventionTariff: '500',
    status: 'UnApproved',
  },
];

export const mapShaData = (shaMap) => {
  return shaMap.map((item) => ({
    packageCode: item.packageCode,
    packageName: item.packageName,
    interventionCode: item.interventionCode,
    interventionName: item.interventionName,
    shaInterventionTariff: parseFloat(item.shaInterventionTariff.replace(/,/g, '')),
    status: item.status,
  }));
};
