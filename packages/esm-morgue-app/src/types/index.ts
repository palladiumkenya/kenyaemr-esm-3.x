import { type OpenmrsResource, type Concept, type OpenmrsResourceStrict } from '@openmrs/esm-framework';
export type QueuePriority = 'Emergency' | 'Not Urgent' | 'Priority' | 'Urgent';
export type MappedQueuePriority = Omit<QueuePriority, 'Urgent'>;
export type QueueService = 'Clinical consultation' | 'Triage';
export type QueueStatus = 'Finished Service' | 'In Service' | 'Waiting';
export interface Patient {
  uuid: string;
  display: string;
  identifiers: Array<{
    uuid: string;
    display: string;
  }>;
  person: {
    uuid: string;
    display: string;
    gender: string;
    birthdate: string;
    dead: boolean;
    age: number;
    deathDate: string | null;
    causeOfDeath: {
      uuid: string;
      display: string;
    } | null;
    preferredAddress: {
      uuid: string;
      stateProvince: string | null;
      countyDistrict: string | null;
      address4: string | null;
    } | null;
    attributes: {
      uuid: string;
      display: string;
      value: string;
      attributeType: {
        uuid: string;
      };
    }[];
  };
}
export interface DeceasedInfo {
  uuid: string;
  status?: string;
  display: string;
  patient: {
    uuid: string;
    display: string;
  };
  identifiers: Array<{
    identifier: string;
    uuid: string;
    preferred: boolean;
    location: {
      uuid: string;
      name: string;
    };
  }>;
  person: {
    uuid: string;
    display: string;
    gender: string;
    birthdate: string;
    dead: boolean;
    age: number;
    deathDate: string | null;
    causeOfDeath: {
      uuid: string;
      display: string;
    } | null;
    preferredAddress: {
      uuid: string;
      stateProvince: string | null;
      countyDistrict: string | null;
      address4: string | null;
    } | null;
  };
}
export interface DeceasedPatientResponse {
  results: DeceasedInfo[];
}

export interface VisitTypeResponse {
  uuid: string;
  display: string;
  name: string;
}

interface AttributeType {
  uuid: string;
  name: string;
  description: string;
  retired: boolean;
  attributeOrder: number;
  format: string;
  foreignKey: string | null;
  regExp: string | null;
  required: boolean;
}

export interface Creator {
  uuid: string;
  display: string;
  links: Link[];
}
export interface Link {
  rel: string;
  uri: string;
  resourceAlias: string;
}
export interface AuditInfo {
  creator: Creator;
  dateCreated: string;
  changedBy: null;
  dateChanged: null;
}
export interface PaymentMethod {
  uuid: string;
  name: string;
  description: string;
  retired: boolean;
  retireReason: null;
  auditInfo: AuditInfo;
  attributeTypes: AttributeType[];
  sortOrder: null;
  resourceVersion: string;
}

export interface Location {
  name: string;
  uuid: string;
  display: string;
}

export interface Visit {
  uuid: string;
  display?: string;
  encounters: EncounterList[];
  patient?: {
    uuid: string;
    display: string;
    person: {
      uuid: string;
      display: string;
      gender: string;
      birthdate: string;
      dead: boolean;
      age: number;
      deathDate: string;
      causeOfDeath: {
        uuid: string;
        display: string;
      };
    };
  };
  visitType: VisitType;
  location?: Location;
  startDatetime: string;
  stopDatetime?: string;
}

export interface VisitType {
  uuid: string;
  display: string;
  name?: string;
}

export interface EncounterList {
  uuid: string;
  display: string;
  encounterDatetime: string;
  patient: {
    uuid: string;
    display: string;
    person: {
      uuid: string;
      display: string;
      gender: string;
      birthdate: string;
      dead: boolean;
      age: number;
      deathDate: string;
      causeOfDeath: {
        uuid: string;
        display: string;
      };
    };
  };
  form: string;
  encounterType: {
    uuid: string;
    display: string;
    name: string;
  };
}

export interface VisitQueueEntry {
  queueEntry: VisitQueueEntry;
  uuid: string;
  visit: Visit;
}

export interface VisitQueueEntry {
  display: string;
  endedAt: null;
  locationWaitingFor: string | null;
  patient: {
    uuid: string;
    person: {
      age: string;
      gender: string;
    };
    phoneNumber: string;
  };
  priority: {
    display: QueuePriority;
    uuid: string;
  };
  providerWaitingFor: null;
  queue: Queue;
  startedAt: string;
  status: {
    display: QueueStatus;
    uuid: string;
  };
  uuid: string;
  visit: Visit;
}

export interface MappedVisitQueueEntry {
  id: string;
  name: string;
  patientUuid: string;
  priority: MappedQueuePriority;
  priorityUuid: string;
  service: string;
  status: QueueStatus;
  statusUuid: string;
  visitUuid: string;
  visitType: string;
  queue: Queue;
  queueEntryUuid: string;
}

export interface UseVisitQueueEntries {
  queueEntry: MappedVisitQueueEntry | null;
  isLoading: boolean;
  error: Error;
  isValidating?: boolean;
  mutate: () => void;
}
export interface Queue {
  uuid: string;
  display: string;
  name: string;
  description: string;
  location: Location;
  service: string;
  allowedPriorities: Array<Concept>;
  allowedStatuses: Array<Concept>;
}

export type UpdateVisitPayload = {
  stopDatetime?: Date;
};

export interface PaginatedResponse {
  uuid: string;
  display: string;
  identifiers: Identifier[];
  person: Person;
}

export interface Identifier {
  identifier: string;
  uuid: string;
  preferred: boolean;
  location: Location;
}

export interface Location {
  uuid: string;
  name: string;
}

export interface Person {
  uuid: string;
  display: string;
  gender: string;
  birthdate: string;
  dead: boolean;
  age: number;
  deathDate: string;
  causeOfDeath: CauseOfDeath;
  preferredAddress: PreferredAddress;
}

export interface CauseOfDeath {
  uuid: string;
  display: string;
}

export interface PreferredAddress {
  uuid: string;
  stateProvince: any;
  countyDistrict: any;
  address4: any;
}

export interface MortuaryLocationFetchResponse {
  totalBeds: number;
  occupiedBeds: number;
  ward: Location;
  bedLayouts: Array<BedLayout>;
}
export interface BedLayout {
  rowNumber: number;
  columnNumber: number;
  bedNumber: string;
  bedId: number;
  bedUuid: string;
  status: BedStatus;
  bedType: BedType;
  location: string;
  patients: Patient[];
  bedTagMaps: BedTagMap[];
}
export interface BedType {
  uuid: string;
  name: string;
  displayName: string;
  description: string;
  resourceVersion: string;
}
interface BedTagMap {
  uuid: string;
  bedTag: {
    id: number;
    name: string;
    uuid: string;
    resourceVersion: string;
  };
}
export type BedStatus = 'AVAILABLE' | 'OCCUPIED';

export interface BedDetail {
  bedId: number;
  bedNumber: string;
  bedType: BedType;
  physicalLocation: Location;
  patients: Array<Patient>;
}

export interface LocationTag extends OpenmrsResource {
  name: string;
}

export type DispositionType = 'ADMIT' | 'DISCHARGE' | 'TRANSFER';

export interface ObsPayload {
  concept: Concept | string;
  value?: string | OpenmrsResource;
  groupMembers?: Array<ObsPayload>;
}

export interface EmrApiConfigurationResponse {
  admissionEncounterType: OpenmrsResource;
  clinicianEncounterRole: OpenmrsResource;
  consultFreeTextCommentsConcept: OpenmrsResource;
  visitNoteEncounterType: OpenmrsResource;
  inpatientNoteEncounterType: OpenmrsResource;
  transferRequestEncounterType: OpenmrsResource;
  transferWithinHospitalEncounterType: OpenmrsResource;
  exitFromInpatientEncounterType: OpenmrsResource;
  supportsTransferLocationTag: LocationTag;
  supportsAdmissionLocationTag: LocationTag;
  supportsLoginLocationTag: LocationTag;
  supportsVisitsLocationTag: LocationTag;
  dispositionDescriptor: {
    admissionLocationConcept: OpenmrsResource;
    dateOfDeathConcept: OpenmrsResource;
    dispositionConcept: OpenmrsResource;
    internalTransferLocationConcept: OpenmrsResource;
    dispositionSetConcept: OpenmrsResource;
  };
  dispositions: Array<{
    encounterTypes: null;
    keepsVisitOpen: null;
    additionalObs: null;
    careSettingTypes: ['OUTPATIENT'];
    name: string;
    conceptCode: string;
    type: DispositionType;
    actions: [];
    excludedEncounterTypes: Array<string>;
    uuid: string;
  }>;
  bedAssignmentEncounterType: OpenmrsResource;
  cancelADTRequestEncounterType: OpenmrsResource;
  denyAdmissionConcept: OpenmrsResource;
  admissionDecisionConcept: OpenmrsResource;
}

export const customRepProps = [
  ['metadataSourceName', 'ref'],
  ['orderingProviderEncounterRole', 'ref'],
  ['supportsTransferLocationTag', '(uuid,display,name,links)'],
  ['unknownLocation', 'ref'],
  ['denyAdmissionConcept', 'ref'],
  ['admissionForm', 'ref'],
  ['exitFromInpatientEncounterType', 'ref'],
  ['extraPatientIdentifierTypes', 'ref'],
  ['consultFreeTextCommentsConcept', 'ref'],
  ['sameAsConceptMapType', 'ref'],
  ['testPatientPersonAttributeType', 'ref'],
  ['admissionDecisionConcept', 'ref'],
  ['supportsAdmissionLocationTag', '(uuid,display,name,links)'],
  ['checkInEncounterType', 'ref'],
  ['transferWithinHospitalEncounterType', 'ref'],
  ['suppressedDiagnosisConcepts', 'ref'],
  ['primaryIdentifierType', 'ref'],
  ['nonDiagnosisConceptSets', 'ref'],
  ['fullPrivilegeLevel', 'ref'],
  ['unknownProvider', 'ref'],
  ['diagnosisSets', 'ref'],
  ['personImageDirectory', 'ref'],
  ['visitNoteEncounterType', 'ref'],
  ['inpatientNoteEncounterType', 'ref'],
  ['transferRequestEncounterType', 'ref'],
  ['consultEncounterType', 'ref'],
  ['diagnosisMetadata', 'ref'],
  ['narrowerThanConceptMapType', 'ref'],
  ['clinicianEncounterRole', 'ref'],
  ['conceptSourcesForDiagnosisSearch', 'ref'],
  ['patientDiedConcept', 'ref'],
  ['emrApiConceptSource', 'ref'],
  ['lastViewedPatientSizeLimit', 'ref'],
  ['identifierTypesToSearch', 'ref'],
  ['telephoneAttributeType', 'ref'],
  ['checkInClerkEncounterRole', 'ref'],
  ['dischargeForm', 'ref'],
  ['unknownCauseOfDeathConcept', 'ref'],
  ['visitAssignmentHandlerAdjustEncounterTimeOfDayIfNecessary', 'ref'],
  ['atFacilityVisitType', 'ref'],
  ['visitExpireHours', 'ref'],
  ['admissionEncounterType', 'ref'],
  ['motherChildRelationshipType', 'ref'],
  ['dispositions', 'ref'],
  ['dispositionDescriptor', 'ref'],
  ['highPrivilegeLevel', 'ref'],
  ['supportsLoginLocationTag', '(uuid,display,name,links)'],
  ['unknownPatientPersonAttributeType', 'ref'],
  ['supportsVisitsLocationTag', '(uuid,display,name,links)'],
  ['transferForm', 'ref'],
  ['bedAssignmentEncounterType', 'ref'],
  ['cancelADTRequestEncounterType', 'ref'],
  ['admissionDecisionConcept', 'ref'],
  ['denyAdmissionConcept', 'ref'],
];

export interface Encounter extends OpenmrsResourceStrict {
  encounterDatetime?: string;
  patient?: Patient;
  location?: Location;
  form?: OpenmrsResource;
  encounterType?: EncounterType;
  obs?: Array<Observation>;
  orders?: any;
  voided?: boolean;
  visit?: Visit;
  encounterProviders?: Array<EncounterProvider>;
  diagnoses?: any;
}
export interface EncounterProvider extends OpenmrsResourceStrict {
  provider?: OpenmrsResource;
  encounterRole?: EncounterRole;
  voided?: boolean;
}

export interface EncounterType extends OpenmrsResourceStrict {
  name?: string;
  description?: string;
  retired?: boolean;
}

export interface EncounterRole extends OpenmrsResourceStrict {
  name?: string;
  description?: string;
  retired?: boolean;
}
export interface Observation extends OpenmrsResourceStrict {
  concept: OpenmrsResource;
  person: Person;
  obsDatetime: string;
  accessionNumber: string;
  obsGroup: Observation;
  value: number | string | boolean | OpenmrsResource;
  valueCodedName: OpenmrsResource;
  groupMembers: Array<Observation>;
  comment: string;
  location: Location;
  order: OpenmrsResource;
  encounter: Encounter;
  voided: boolean;
}

export interface CurrentLocationEncounterResponse {
  results: {
    visit: {
      patient: {
        uuid: string;
        display: string;
      };
    };
    encounterAssigningToCurrentInpatientLocation: {
      encounterDatetime: string;
    };
  };
}

export interface PatientInfo {
  person?: {
    uuid: string;
    display: string;
    age: number;
    causeOfDeath?: {
      display: string;
    };
  };
  uuid: string;
  attributes: {
    uuid: string;
    display: string;
  }[];
}
export interface FHIREncounter {
  resourceType: string;
  id: string;
  meta?: {
    versionId: string;
    lastUpdated: string;
    tag: {
      system: string;
      code: string;
      display: string;
    }[];
  };
  status: string;
  class: {
    system: string;
    code: string;
  };
  type: {
    coding: {
      system: string;
      code: string;
      display: string;
    }[];
  }[];
  subject: {
    reference: string;
    type?: string;
    display?: string;
  };
  participant?: {
    individual: {
      reference: string;
      type?: string;
      identifier?: {
        value: string;
      };
      display?: string;
    };
  }[];
  period: {
    start: string;
  };
  location: {
    location: {
      reference: string;
      type?: string;
      display?: string;
    };
  }[];
  partOf?: {
    reference: string;
    type: string;
  };
}
