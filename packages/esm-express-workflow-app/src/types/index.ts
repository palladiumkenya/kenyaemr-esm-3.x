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
