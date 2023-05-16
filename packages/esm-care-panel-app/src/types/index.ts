type HIVData = {
  whoStage: number;
  whoStageDate: string;
  cd4: string;
  cd4Date: string;
  cd4Percent: string;
  cd4PercentDate: string;
  ldlValue: string;
  ldlDate: string;
  enrolledInHiv: boolean;
  lastEncDetails: {
    startDate: string;
    endDate: string;
    regimenShortDisplay: string;
    regimenLine: string;
    regimenLongDisplay: string;
    changeReasons: string[];
    regimenUuid: string;
    current: boolean;
  };
};

type TBData = {
  tbDiseaseClassification: string;
  tbPatientClassification: string;
  tbTreatmentNumber: string;
  lastTbEncounter: {
    startDate: string;
    endDate: string;
    regimenShortDisplay: string;
    regimenLine: string;
    regimenLongDisplay: string;
    changeReasons: string[];
    regimenUuid: string;
    current: boolean;
  };
  tbDiseaseClassificationDate: String;
};

type MCHMotherData = {
  hivStatus: string;
  hivStatusDate: string;
  onHaart: string;
  onHaartDate: string;
};

export type MCHChildData = {
  currentProphylaxisUsed: string;
  currentProphylaxisUsedDate: string;
  currentFeedingOption: string;
  currentFeedingOptionDate: string;
  milestonesAttained: string;
  milestonesAttainedDate: string;
  heiOutcome: string;
  heiOutcomeDate: string;
  hivStatus: string;
  hivStatusDate: string;
};

export type ProgramSummary = {
  HIV?: HIVData;
  TB?: TBData;
  mchMother?: MCHMotherData;
  mchChild?: MCHChildData;
};
