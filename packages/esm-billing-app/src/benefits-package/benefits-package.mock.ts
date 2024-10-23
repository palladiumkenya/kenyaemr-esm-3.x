import { CoverageEligibilityResponse, Diagnosis, Package, PatientBenefit, SHAIntervension } from '../types';

export const patientBenefits = [
  {
    packageCode: 'SHA-001',
    packageName: 'Eye Care',
    interventionCode: 'SHA-001-01',
    interventionName: 'Percutaneous coronary',
    interventioTariff: 50000,
    requirePreauth: true,
    status: 'PENDING',
  },
  {
    packageCode: 'SHA-002',
    packageName: 'Malaria',
    interventionCode: 'SHA-001-02',
    interventionName: 'Optimal medical therapy',
    interventioTariff: 20000,
    requirePreauth: false,
    status: 'PENDING',
  },
] as Array<PatientBenefit>;

export const packages = [
  {
    packageCode: 'SHA-001',
    packageName: 'Eye Care',
    packageAccessPoint: 'OP',
  },
  {
    packageCode: 'SHA-002',
    packageName: 'Dental Care',
    packageAccessPoint: 'IP',
  },
  {
    packageCode: 'SHA-003',
    packageName: 'Surgical',
    packageAccessPoint: 'OP',
  },
  {
    packageCode: 'SHA-004',
    packageName: 'Haemo-oncology',
    packageAccessPoint: 'OP',
  },
] as Array<Package>;

export const intervensions = patientBenefits.map(({ interventionCode, interventionName }) => ({
  interventionCode,
  interventionName,
})) as Array<SHAIntervension>;

export const diagnoses = [
  {
    uuid: '18aac1664e1-04a0bdce-476f-412d-b0cc-3d44460b63ba',
    name: 'Syndactyly of Fingers with Fusion of Bone',
    dateRecorded: '2023-03-22',
    value: 'Syndactyly of Fingers with Fusion of Bone',
  },
  {
    uuid: '18aac1664e2-a35ed577-b747-454c-85cf-1caf0b5ec76c',
    name: 'Syndactyly of Fingers with Fusion of Bone',
    dateRecorded: '2023-03-22',
    value: 'Syndactyly of Fingers with Fusion of Bone',
  },
  {
    uuid: '18aac1664e2-5071db27-e8dc-480e-bae0-65686dc38f6b',
    name: 'Furuncle of Other Specified Site',
    dateRecorded: '2023-03-22',
    value: 'Furuncle of Other Specified Site',
  },
  {
    uuid: '18aac1664e2-ac2b5c17-fc83-4256-8299-f9b222d50175',
    name: 'Skin Rash due to Fur',
    dateRecorded: '2023-03-22',
    value: 'Skin Rash due to Fur',
  },
  {
    uuid: '18aac1664e2-4fef0625-96e6-4c6a-a61e-e5defe4c1c09',
    name: 'Juvenile Fucosidosis',
    dateRecorded: '2023-03-22',
    value: 'Juvenile Fucosidosis',
  },
] as Array<Diagnosis>;

export const coverageEligibilityResponse = [
  {
    insurer: 'SHAX001',
    inforce: true,
    benefits: [
      {
        packageCode: 'SHA-001',
        packageName: 'Surgical Services',
        interventionCode: 'SHA-001-01',
        interventionName: '',
        interventioTariff: 50000,
        requirePreauth: true,
      },
      {
        packageCode: 'SHA-002',
        packageName: 'Medical Imaging',
        interventionCode: 'SHA-001-02',
        interventionName: '',
        interventioTariff: 50000,
        requirePreauth: false,
      },
      {
        packageCode: 'SHA-003',
        packageName: 'Medical Imaging',
        interventionCode: 'SHA-001-03',
        interventionName: '',
        interventioTariff: 50000,
        requirePreauth: false,
      },
    ],
  },
] as Array<CoverageEligibilityResponse>;
