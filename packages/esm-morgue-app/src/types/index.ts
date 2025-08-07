import {
  type OpenmrsResourceStrict,
  type OpenmrsResource,
  Concept,
  type Visit as OpenmrsVisit,
} from '@openmrs/esm-framework';

export interface BaseEntity {
  uuid: string;
  display: string;
}

export interface Identifier extends BaseEntity {
  identifierType: string;
  identifier: string;
}

export interface CauseOfDeath extends BaseEntity {}

export interface PreferredAddress extends BaseEntity {
  display: any;
}

export interface Attribute extends BaseEntity {
  value: string;
  attributeType: {
    uuid: string;
    display?: string;
  };
}

export interface PreferredName extends BaseEntity {}

export interface Person {
  uuid: string;
  display: string;
  identifiers?: Identifier[];
  person?: Person;
  gender: string;
  age: number;
  birthdate: string;
  birthdateEstimated: boolean;
  dead: boolean;
  deathDate: string;
  causeOfDeath: CauseOfDeath;
  preferredName?: PreferredName;
  preferredAddress: PreferredAddress;
  attributes: Attribute[];
  voided: boolean;
  birthtime: any;
  deathdateEstimated: boolean;
  resourceVersion?: string;
}

export interface PersonName {
  display: string;
  uuid: string;
  givenName: string;
  middleName: string;
  familyName: string;
  familyName2: any;
}

export interface Patient {
  uuid: string;
  display: string;
  identifiers: Identifier[];
  person: Person;
}

export interface MortuaryPatient {
  patient: Patient;
  person: Person;
  personName: PersonName;
  resourceVersion: string;
}

export interface BedType extends BaseEntity {
  name: string;
  displayName: string;
  description: string;
}

export type BedStatus = 'AVAILABLE' | 'OCCUPIED';

export interface BedTag extends BaseEntity {
  id?: number;
  name: string;
}

export interface BedTagMap {
  uuid: string;
  bedTag: BedTag;
}

export interface Location extends BaseEntity {
  name: string;
  description: string;
  tags?: BaseEntity[];
}

export interface Bed {
  id: number;
  uuid: string;
  bedNumber: string;
  bedType?: BedType;
  row: number;
  column: number;
  status: BedStatus;
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

export interface AdmissionLocationResponse {
  results: Array<{
    ward: Location;
    totalBeds: number;
    occupiedBeds: number;
  }>;
}

export interface MortuaryLocationResponse {
  totalBeds: number;
  occupiedBeds: number;
  ward: Location;
  bedLayouts: BedLayout[];
}

export type MappedBedData = Array<{
  id: number;
  number: string;
  type: string;
  status: string;
  uuid: string;
}>;

export interface VisitTypeResponse extends BaseEntity {
  name: string;
}

export interface PaymentMethod {
  uuid: string;
  name: string;
  description: string;
  retired: boolean;
  retireReason: null;
  attributeTypes: AttributeType[];
  sortOrder: null;
  resourceVersion: string;
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

export type MappedQueuePriority = Omit<QueuePriority, 'Urgent'>;
export type QueuePriority = 'Emergency' | 'Not Urgent' | 'Priority' | 'Urgent';
export type QueueStatus = 'Finished Service' | 'In Service' | 'Waiting';

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

export type DispositionType = 'ADMIT' | 'DISCHARGE' | 'TRANSFER';

export interface LocationTag extends OpenmrsResource {
  name: string;
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
  attributes: Attribute[];
}

export interface UseVisitQueueEntries {
  queueEntry: MappedVisitQueueEntry | null;
  isLoading: boolean;
  error: Error;
  isValidating?: boolean;
  mutate: () => void;
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

export interface Patient {
  uuid: string;
  display: string;
  identifiers: Identifier[];
  person: Person;
}

export interface ConceptName {
  uuid: string;
  display: string;
  name: string;
}

export interface ConceptResponse extends BaseEntity {
  name: ConceptName;
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

export interface Entry {
  resourceType: string;
  id: string;
  meta: Meta;
  status: string;
  class: {
    system: string;
    code: string;
  };
  type: Array<{
    coding: Array<Coding>;
  }>;
  subject: Subject;
  participant: Array<{
    individual: Individual;
  }>;
  period: {
    start: string;
  };
  location: Array<Location>;
  partOf: {
    reference: string;
    type: string;
  };
}

export interface Meta {
  versionId: string;
  lastUpdated: string;
  tag: Tag[];
}

export interface Tag {
  system: string;
  code: string;
  display: string;
}

export interface Coding {
  system: string;
  code: string;
  display: string;
}

export interface Subject {
  reference: string;
  type: string;
  display: string;
}

export interface Individual {
  reference: string;
  type: string;
  identifier: {
    value: string;
  };
  display: string;
}

export interface OpenmrsEncounter extends OpenmrsResource {
  encounterDatetime: string;
  encounterType: {
    uuid: string;
    display: string;
  };
  patient: string;
  location: string;
  encounterProviders?: Array<{
    encounterRole: string;
    provider: { uuid: string; person: { uuid: string; display: string }; name: string };
    display?: string;
  }>;
  obs: Array<OpenmrsResource>;

  form?: { name: string; uuid: string };

  visit?: {
    visitType: {
      uuid: string;
      display: string;
    };
  };
  diagnoses?: Array<{
    uuid: string;
    diagnosis: { coded: { display: string } };
  }>;
}

export enum PaymentStatus {
  POSTED = 'POSTED',
  PENDING = 'PENDING',
  PAID = 'PAID',
  CREDITED = 'CREDITED',
  CANCELLED = 'CANCELLED',
  ADJUSTED = 'ADJUSTED',
  EXEMPTED = 'EXEMPTED',
}

export interface PatientInvoice {
  uuid: string;
  display: string;
  voided: boolean;
  voidReason: string | null;
  adjustedBy: any[];
  billAdjusted: any;
  cashPoint: CashPoint;
  dateCreated: string;
  lineItems: LineItem[];
  patient: Patient;
  payments: Payment[];
  receiptNumber: string;
  status: PaymentStatus;
  adjustmentReason: any;
  id: number;
  resourceVersion: string;
  totalPayments?: number;
  totalDeposits?: number;
  totalExempted?: number;
  balance?: number;
  closed?: boolean;
}

interface CashPoint extends BaseEntity {
  location: Location;
}

export interface LineItem extends BaseEntity {}
export interface Payment {
  uuid: string;
  instanceType: PaymentInstanceType;
  attributes: Attribute[];
  amount: number;
  amountTendered: number;
  dateCreated: number;
  voided: boolean;
  resourceVersion: string;
}

interface PaymentInstanceType extends BaseEntity {
  name: string;
}
export interface EnhancedPatient {
  uuid: string;
  person: {
    display: string;
    gender: string;
    age: number;
    deathDate: string;
    causeOfDeath?: {
      display: string;
    };
  };
  bedInfo?: {
    bedNumber: string;
    bedId: number;
    bedType?: string;
  };
  visitInfo?: {
    activeVisit?: OpenmrsVisit;
    admissionDate?: string;
  };
  isDischarged?: boolean;
  encounterDate?: string;
  originalMortuaryPatient?: MortuaryPatient;
  originalPatient?: Patient;
}

export interface PatientCardProps {
  patient: EnhancedPatient;
  showActions?: {
    admit?: boolean;
    discharge?: boolean;
    postmortem?: boolean;
    swapCompartment?: boolean;
    printGatePass?: boolean;
    viewDetails?: boolean;
  };
}
