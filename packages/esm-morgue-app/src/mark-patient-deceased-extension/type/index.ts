export interface DiagnosisResult {
  uuid: string;
  display: string;
}

export interface DiagnosisResponse {
  results: Array<DiagnosisResult>;
}

export interface CauseOfDeathPayload {
  causeOfDeath?: string;
  causeOfDeathNonCoded?: string;
  dead: boolean;
  deathDate?: Date;
}

export interface QueueEntryPayload {
  queue: string;
  patient: string;
  status: string;
  priority: string;
  startedAt: string;
  priorityComment?: string;
}

export interface Diagnosis {
  diagnosis: {
    coded: string;
  };
  certainty: string;
  rank: number;
  voided: boolean;
}

export interface Obs {
  concept: string;
  value: string;
}

export interface EncounterPayload {
  encounterDatetime: string;
  patient: string;
  encounterType: string;
  location: string;
  encounterProviders: Array<{
    provider: string;
    encounterRole: string;
  }>;
  obs: Array<Obs>;
  diagnoses?: Array<Diagnosis>;
}

export interface DiagnosisOption {
  uuid: string;
  display: string;
}
