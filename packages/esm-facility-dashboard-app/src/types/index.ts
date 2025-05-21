export type SurveillanceSummary = {
  getHivPositiveNotLinked: number;
  getHivTestedPositive: number;
  getPregnantOrPostpartumClients: number;
  getPregnantPostpartumNotInPrep: number;
  getEligibleForVl: number;
  getEligibleForVlSampleNotTaken: number;
  getVirallyUnsuppressed: number;
  getVirallyUnsuppressedWithoutEAC: number;
  getHeiSixToEightWeeksOld: number;
  getHeiSixToEightWeeksWithoutPCRResults: number;
  getHei24MonthsOld: number;
  getHei24MonthsWithoutDocumentedOutcome: number;
  clinicalActionThreshold: number;
  heiClinicalActionThreshold: number;
  getMonthlyHivPositiveNotLinked: HivPositiveNotLinkedData;
  getMonthlyHivPositiveNotLinkedPatients: HivPositiveNotLinkedData;
  getMonthlyHighRiskPBFWNotOnPrep: HivPositiveNotLinkedData;
  getMonthlyHighRiskPBFWNotOnPrepPatients: HivPositiveNotLinkedData;
  getMonthlyHeiDNAPCRPending: HivPositiveNotLinkedData;
  getMonthlyEligibleForVlSampleNotTaken: HivPositiveNotLinkedData;
  getMonthlyHei24MonthsWithoutDocumentedOutcome: HivPositiveNotLinkedData;
  getMonthlyVirallyUnsuppressedWithoutEAC: HivPositiveNotLinkedData;
  getMonthlyPatientsTestedHivPositive: HivPositiveNotLinkedData;
  getMonthlyPregnantOrPostpartumClients: HivPositiveNotLinkedData;
  getMonthlyHeiSixToEightWeeksOld: HivPositiveNotLinkedData;
  getMonthlyEligibleForVl: HivPositiveNotLinkedData;
  getMonthlyHei24MonthsOld: HivPositiveNotLinkedData;
  getMonthlyVirallyUnsuppressed: HivPositiveNotLinkedData;
};

export type IndicationMode = 'decreasing' | 'increasing';
export type SurveillanceindicatorsFilter = {
  indicator?: string;
  startdate?: Date;
  endDate?: Date;
};
export type HivPositiveNotLinkedData = {
  data: Array<HivPositiveNotLinked>;
};
export type HivPositiveNotLinked = {
  day: string;
  value: number;
  group?: string;
};

export type Linkage = {
  group?: string;
  value?: number;
};
export type LinkageData = {
  data: Array<Linkage>;
};
