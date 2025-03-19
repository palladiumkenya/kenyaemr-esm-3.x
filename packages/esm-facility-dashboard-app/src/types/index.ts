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
};

export type IndicationMode = 'decreasing' | 'increasing';
export type SurveillanceindicatorsFilter = {
  indicator?: string;
  startdate?: Date;
  endDate?: Date;
};
