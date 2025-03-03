export type SurveillanceSummary = {
  getHivPositiveNotLinked: number;
  getHivTestedPositive: number;
  getPregnantPostpartumNotInPrep: number;
  getEligibleForVlSampleNotTaken: number;
  getVirallySuppressedWithoutEAC: number;
  getHeiSixToEightWeeksWithoutPCRResults: number;
  getHei24MonthsWithoutDocumentedOutcome: number;
  fivePercentThreshhold: number;
  onePercentThreshhold: number;
};

export type IndicationMode = 'decreasing' | 'increasing';
