export const mockPatient = {
  uuid: '330c0ec6-0ac7-4b86-9c70-29d76f0ae20a',
  patientName: 'John Doe',
  reportDate: '2023-08-06',
  clinicName: 'Example Clinic',
  mflCode: '12345',
  age: 40,
  uniquePatientIdentifier: 'ABC123',
  nationalUniquePatientIdentifier: 'XYZ456',
  birthDate: '1990-01-01',
  gender: 'M',
  maritalStatus: 'Married',
  allVlResults: {
    value: [
      { vl: '120', vlDate: '2023-06-01' },
      { vl: '150', vlDate: '2023-07-01' },
    ],
  },
  allCd4CountResults: [
    { cd4Count: '300', cd4CountDate: '2023-06-01' },
    { cd4Count: '320', cd4CountDate: '2023-07-01' },
  ],
};
