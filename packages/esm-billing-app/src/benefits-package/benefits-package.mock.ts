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

export const coverageEligibilityResponse = [
  {
    insurer: 'SHAX001',
    inforce: true,
    benefits: [
      {
        packageCode: 'SHA-16',
        packageName: 'Renal Care Services',
        interventionCode: 'SHA-16-005',
        interventionName: 'Insertion of Continuous Ambulatory Peritoneal Dialysis (CAPD) catheter',
        interventioTariff: 50000,
        requirePreauth: true,
      },
      {
        packageCode: 'SHA-01',
        packageName: 'Ambulance and Emergency Services',
        interventionCode: 'SHA-001-02',
        interventionName: 'Ambulance services (Intra-metro within 25KM radius )',
        interventioTariff: 50000,
        requirePreauth: false,
      },
      {
        packageCode: 'SHA-19',
        packageName: 'Surgical Services',
        interventionCode: 'SHA-19-027',
        interventionName: 'Thoracic endovascular aortic repair (TEVAR)',
        interventioTariff: 50000,
        requirePreauth: false,
      },
    ],
  },
] as Array<CoverageEligibilityResponse>;
