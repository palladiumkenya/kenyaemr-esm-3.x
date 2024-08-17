import { Diagnosis, Package, PatientBenefit, SHAIntervension } from '../types';

export const patientBenefits = [
  {
    shaPackageCode: 'SHA-001',
    shaPackageName: 'Eye Care',
    shaInterventionCode: 'SHA-001-01',
    shaInterventionName: 'Intervension 1',
    shaInterventioTariff: 50000,
    requirePreauth: true,
    status: 'PENDING',
  },
  {
    shaPackageCode: 'SHA-002',
    shaPackageName: 'Malaria',
    shaInterventionCode: 'SHA-001-02',
    shaInterventionName: 'Intervension 2',
    shaInterventioTariff: 20000,
    requirePreauth: false,
    status: 'PENDING',
  },
] as Array<PatientBenefit>;

export const packages = [
  {
    shaPackageCode: 'SHA-001',
    shaPackageName: 'Eye Care',
    packageAccessPoint: 'OP',
  },
  {
    shaPackageCode: 'SHA-002',
    shaPackageName: 'Dental Care',
    packageAccessPoint: 'IP',
  },
  {
    shaPackageCode: 'SHA-003',
    shaPackageName: 'Surgical',
    packageAccessPoint: 'OP',
  },
  {
    shaPackageCode: 'SHA-004',
    shaPackageName: 'Haemo-oncology',
    packageAccessPoint: 'OP',
  },
] as Array<Package>;

export const intervensions = patientBenefits.map(({ shaInterventionCode, shaInterventionName }) => ({
  shaInterventionCode,
  shaInterventionName,
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
