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
    changeReasons: Array<string>;
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
    changeReasons: Array<string>;
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

export enum ProgramType {
  HIV = 'HIV',
  TB = 'TB',
  TPT = 'TPT',
  MCH_MOTHER = 'MCH - Mother Services',
  MCH_CHILD = 'MCH - Child Services',
  MCHMOTHER = 'mchMother',
  MCHCHILD = 'mchChild',
}

export type PatientSummary = {
  reportDate: string;
  clinicName: string;
  mflCode: string;
  patientName: string;
  birthDate: string;
  age: string;
  gender: string;
  uniquePatientIdentifier: string;
  nationalUniquePatientIdentifier: string;
  maritalStatus: string;
  height: string;
  weight: string;
  bmi: string;
  oxygenSaturation: string;
  pulseRate: string;
  bloodPressure: string;
  bpDiastolic: string;
  lmp: string;
  respiratoryRate: string;
  dateConfirmedHIVPositive: string;
  firstCd4: string;
  firstCd4Date: string;
  dateEnrolledIntoCare: string;
  whoStagingAtEnrollment: string;
  caxcScreeningOutcome: string;
  stiScreeningOutcome: string;
  familyProtection: string;
  transferInFacility: string;
  patientEntryPoint: string;
  patientEntryPointDate: string;
  nameOfTreatmentSupporter: string;
  relationshipToTreatmentSupporter: string;
  transferInDate: string;
  contactOfTreatmentSupporter: string;
  dateEnrolledInTb: string;
  dateCompletedInTb: string;
  tbScreeningOutcome: string;
  chronicDisease: string;
  previousArtStatus: string;
  dateStartedArt: string;
  whoStageAtArtStart: string;
  cd4AtArtStart: string;
  heightArtInitiation: string;
  firstRegimen: {
    startDate: string;
    endDate: string;
    regimenShortDisplay: string;
    regimenLine: string;
    regimenLongDisplay: string;
    changeReasons: Array<string>;
    regimenUuid: string;
    current: boolean;
  };
  purposeDrugs: string;
  purposeDate: string;
  iosResults: string;
  currentArtRegimen: {
    startDate: string;
    endDate: string;
    regimenShortDisplay: string;
    regimenLine: string;
    regimenLongDisplay: string;
    changeReasons: Array<string>;
    regimenUuid: string;
    current: boolean;
  };
  currentWhoStaging: string;
  ctxValue: string;
  dapsone: string;
  onIpt: string;
  allergies: string;
  clinicsEnrolled: string;
  mostRecentCd4: string;
  mostRecentCd4Date: string;
  deathDate: string;
  nextAppointmentDate: string;
  transferOutDate: string;
  transferOutFacility: string;
  viralLoadValue: string;
  viralLoadDate: string;
  allCd4CountResults: Array<cd4Results>;
  allVlResults: vlResults;
};

type cd4Results = {
  cd4Count: string;
  cd4CountDate: string;
};

type vlResults = {
  value: Array<vl>;
};

type vl = {
  vl?: string;
  vlDate?: string;
};

export enum RegimenType {
  HIV = 'ARV',
  TB = 'TB',
}

export type RegimenEncounter = {
  uuid: string;
};

export enum Regimen {
  RegimenLineConcept = '163104AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  reasonCodedConcept = '1252AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  reasonNonCodedConcept = '5622AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  standardRegimenConcept = '1193AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  nonStandardRegimenConcept = '1088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  arvCategoryConcept = '1255AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  tbCategoryConcept = '1268AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  changeRegimenConcept = '1259AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  stopRegimenConcept = '1260AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  startOrRestartConcept = '1256AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  regimenForm = 'da687480-e197-11e8-9f32-f2801f1b9fd1',
  regimenEncounterType = '7dffc392-13e7-11e9-ab14-d663bd873d93',
  dateDrugStoppedCon = '1191AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
}

export interface Encounter {
  encounterDatetime: Date;
  patient: string;
  encounterType: string;
  location: string;
  encounterProviders: Array<{
    provider: string;
    encounterRole: string;
  }>;
  form: string;
  obs: Array<{
    concept: string;
    value: string | number;
  }>;
}
export interface UpdateObs {
  obs: Array<{
    concept: string;
    value: string | number;
  }>;
}

export interface RegimenItem {
  name: string;
  conceptRef: string;
}

export interface RegimenLineGroup {
  regimenline: string;
  regimenLineValue: string;
  regimen: RegimenItem[];
}

export interface IITRiskScore {
  riskScore: string;
  evaluationDate: string;
  description: string;
  riskFactors: string;
}

export interface Enrollment {
  uuid: string;
  program: {
    name: string;
    uuid: string;
  };
}
