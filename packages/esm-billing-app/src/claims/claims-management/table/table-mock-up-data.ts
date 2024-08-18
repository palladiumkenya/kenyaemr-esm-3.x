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
    shaPackageCode: 'SHA-001',
    shaPackageName: 'Eye Care',
    shaInterventionCode: 'SHA-001-01',
    shaInterventionName: 'Percutaneous coronary',
    shaInterventionTariff: '5,000',
    status: 'Approved',
  },
  {
    shaPackageCode: 'SHA-004',
    shaPackageName: 'Heart Care',
    shaInterventionCode: 'SHA-004-01',
    shaInterventionName: 'Peripheral artery disease',
    shaInterventionTariff: '10,000',
    status: 'Approved',
  },
  {
    shaPackageCode: 'SHA-002',
    shaPackageName: 'Therapy Care',
    shaInterventionCode: 'SHA-002-09',
    shaInterventionName: 'Optimal medical therapy',
    shaInterventionTariff: '500',
    status: 'UnApproved',
  },
];

export const mapShaData = (shaMap) => {
  return shaMap.map((item) => ({
    shaPackageCode: item.shaPackageCode,
    shaPackageName: item.shaPackageName,
    shaInterventionCode: item.shaInterventionCode,
    shaInterventionName: item.shaInterventionName,
    shaInterventionTariff: parseFloat(item.shaInterventionTariff.replace(/,/g, '')),
    status: item.status,
  }));
};
