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
  firstRegimen: string;
  purposeDrugs: string;
  purposeDate: string;
  iosResults: string;
  currentArtRegimen: string;
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

export type SHRSummary = {
  vitals: Array<itemDetails>;
  labResults: Array<itemDetails>;
  complaints: Array<itemDetails>;
  diagnosis: Array<itemDetails>;
  allergies: Array<itemDetails>;
  conditions: Array<itemDetails>;
  medications: Array<itemDetails>;
  referrals: Array<itemDetails>;
};

export type itemDetails = {
  uuid: string;
  name: string;
  dateRecorded: string;
  value: string;
  onsetDate: string;
  allergen: string;
  reaction: string;
  severity: string;
  status: string;
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
export interface CommunityReferral {
  id: number;
  uuid: string;
  nupi: string;
  dateReferred: string;
  referredFrom: string;
  givenName: string;
  middleName: string;
  familyName: string;
  birthdate: string;
  gender: string;
  referralReasons: ReferralReasonsProps;
  status?: string;
}

export interface ReferralReasonsProps {
  category: string;
  clinicalNote: string;
  reasonCode: string;
  messageId: number;
  referralDate?: string;
}

export interface PatientIdentifier {
  display: string;
  uuid: string;
  identifier: string;
  identifierType: {
    uuid: string;
    display: string;
  };
}

export interface Concept {
  uuid: string;
  name: {
    name: string;
  };
  conceptClass: {
    name: string;
  };
}

export interface ReasonResponse {
  results: Concept[];
}
export interface Facility {
  uuid: string;
  name: string;
  attributes: [
    {
      value: string;
    },
  ];
}

export interface FacilityResponse {
  results: Facility[];
}

export interface ReferralPayload {
  MESSAGE_HEADER: {
    SENDING_APPLICATION: string;
    SENDING_FACILITY: string;
    RECEIVING_APPLICATION: string;
    RECEIVING_FACILITY: string;
    MESSAGE_DATETIME: string;
    SECURITY: null;
    MESSAGE_TYPE: string;
    PROCESSING_ID: string;
  };
  PATIENT_IDENTIFICATION: {
    EXTERNAL_PATIENT_ID: {
      ID: string | null;
      IDENTIFIER_TYPE: string;
      ASSIGNING_AUTHORITY: string;
    };
    INTERNAL_PATIENT_ID: Array<{
      ID: string;
      IDENTIFIER_TYPE: string;
      ASSIGNING_AUTHORITY: string;
    }>;
    PATIENT_NAME: {
      FIRST_NAME: string;
      MIDDLE_NAME: string;
      LAST_NAME: string;
    };
    MOTHER_NAME: {
      FIRST_NAME: string | null;
      MIDDLE_NAME: string | null;
      LAST_NAME: string | null;
    };
    DATE_OF_BIRTH: string;
    SEX: string;
    PATIENT_ADDRESS: {
      PHYSICAL_ADDRESS: {
        VILLAGE: string;
        WARD: string;
        SUB_COUNTY: string;
        COUNTY: string;
        GPS_LOCATION: string | null;
        NEAREST_LANDMARK: string | null;
      };
      POSTAL_ADDRESS: string | null;
    };
    PHONE_NUMBER: string;
    MARITAL_STATUS: string | null;
    DEATH_DATE: string | null;
    DEATH_INDICATOR: string | null;
    DATE_OF_BIRTH_PRECISION: string;
  };
  DISCONTINUATION_MESSAGE: {
    DISCONTINUATION_REASON: string;
    EFFECTIVE_DISCONTINUATION_DATE: string;
    TARGET_PROGRAM: string;
    SERVICE_REQUEST: {
      TRANSFER_STATUS: string;
      TRANSFER_INTENT: string;
      TRANSFER_PRIORITY: string;
      TRANSFER_OUT_DATE: string;
      TO_ACCEPTANCE_DATE: string | null;
      SENDING_FACILITY_MFLCODE: string;
      RECEIVING_FACILITY_MFLCODE: string;
      SUPPORTING_INFO: string | null;
    };
  };
}

interface ApiSuccessResponse {
  status: 'success';
  message: ReferralPayload;
}

export interface ReferralResponse {
  success: boolean;
  data: ApiSuccessResponse;
  payload: ReferralPayload;
}

export interface ReferralError extends Error {
  status?: number;
  statusText?: string;
  responseBody?: string;
}
