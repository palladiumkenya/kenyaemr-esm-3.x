import {
  BenefitDataResponse,
  CoverageEligibilityResponse,
  Diagnosis,
  Package,
  PatientBenefit,
  SHAIntervention,
  shifIdentifiersResponse,
} from '../types';

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

export const interventions = patientBenefits.map(({ interventionCode, interventionName }) => ({
  interventionCode,
  interventionName,
})) as Array<SHAIntervention>;

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
        requirePreauth: false,
        status: 'Pending',
      },
      {
        packageCode: 'SHA-01',
        packageName: 'Ambulance and Emergency Services',
        interventionCode: 'SHA-001-02',
        interventionName: 'Ambulance services (Intra-metro within 25KM radius )',
        interventioTariff: 50000,
        requirePreauth: true,
        status: 'Pending',
      },
      {
        packageCode: 'SHA-19',
        packageName: 'Surgical Services',
        interventionCode: 'SHA-19-027',
        interventionName: 'Thoracic endovascular aortic repair (TEVAR)',
        interventioTariff: 50000,
        requirePreauth: false,
        status: 'Pending',
      },
    ],
  },
] as Array<CoverageEligibilityResponse>;

export const mockBenefitsData = [
  {
    title: 'Outpatient Overall',
    allocation: 'Ksh. 100,000',
    expenditure: 'Ksh. 100,000',
    balance: 'Ksh. 98,000',
    isActive: true,
  },
  {
    title: 'Outpatient optical services',
    allocation: 'Ksh. 5,000',
    expenditure: 'Ksh. 5,000',
    balance: 'Ksh. 93,000',
    isActive: true,
    description:
      'Services covered include consultation and diagnosis, preventive, restorative, and treatment services as necessary: Eye health education and counselling, Fundoscopy, VA testing, visual field,analysis and Treatment of refractive errors',
  },
  {
    title: 'In patient services',
    allocation: 'ksh. 3,500',
    expenditure: 'ksh. 3,500',
    balance: 'Ksh. 93,000',
    isActive: false,
    description:
      'Inpatient services shall include management of disease/condition while admitted such as Pre-admission evaluation, Hospital accommodation charges,meals and nursing care in a general ward bed, Intra-admission consultation and reviews by both general and specialist consultants, Laboratory investigations, medical imaging, procedures, and medication',
  },
] as Array<BenefitDataResponse>;

export const shifIdentifiersMock = [
  {
    identiferNumber: '32JFFN23B',
    identiferType: 'Social Health Insurance Fund',
  },
] as Array<shifIdentifiersResponse>;

export const useShifIdentifiersData = () =>
  shifIdentifiersMock.map(({ identiferNumber, identiferType }) => ({
    identiferNumber,
    identiferType,
  }));

export const useBenefitsData = () =>
  mockBenefitsData.map(({ title, allocation, expenditure, description, balance, isActive }) => ({
    title,
    allocation,
    expenditure,
    balance,
    isActive,
    description,
  }));
