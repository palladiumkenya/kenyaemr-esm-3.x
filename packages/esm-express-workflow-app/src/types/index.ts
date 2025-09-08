import { type OpenmrsResource, type OpenmrsResourceStrict } from '@openmrs/esm-framework';

export interface DashboardConfig {
  name: string;
  slot: string;
  title: string;
}
export type Queue = {
  uuid: string;
  display: string;
  name: string;
  location: OpenmrsResource;
  service: OpenmrsResource;
  allowedPriorities: Array<OpenmrsResource>;
  allowedStatuses: Array<OpenmrsResource>;
};

export type QueueEntry = {
  uuid: string;
  display: string;
  queue: Queue;
  status: {
    uuid: string;
    display: string;
    name: OpenmrsResourceStrict;
    dataType: OpenmrsResource;
  };
  conceptClass: OpenmrsResource;
  patient: OpenmrsResource & {
    person: OpenmrsResource & {
      gender: OpenmrsResource;
      birthdate: string;
    };
  };
  visit: OpenmrsResource;
  priority: OpenmrsResource & { name: OpenmrsResourceStrict };
  priorityComment: string | null;
  sortWeight: number;
  startedAt: string;
  endedAt: string;
  locationWaitingFor: null | OpenmrsResource;
  queueComingFrom: Queue | null;
  providerWaitingFor: OpenmrsResource | null;
  previousQueueEntry: QueueEntry | null;
};

export type QueueEntryFilters = {
  queues?: string[]; // UUIDs of queues
  location?: string[]; // UUIDs of locations
  service?: string[]; // UUIDs of services
  patient?: string; // Patient UUID
  visit?: string; // Visit UUID
  hasVisit?: boolean;
  priorities?: string[]; // UUIDs of priority concepts
  statuses?: string[]; // UUIDs of status concepts
  locationsWaitingFor?: string[]; // UUIDs of locations
  providersWaitingFor?: string[]; // UUIDs of providers
  queuesComingFrom?: string[]; // UUIDs of queues
  startedOnOrAfter?: string; // ISO date string
  startedOnOrBefore?: string; // ISO date string
  startedOn?: string; // ISO date string
  isEnded?: boolean;
  endedOnOrAfter?: string; // ISO date string
  endedOnOrBefore?: string; // ISO date string
  endedOn?: string; // ISO date string
  includedVoided?: boolean;
};
