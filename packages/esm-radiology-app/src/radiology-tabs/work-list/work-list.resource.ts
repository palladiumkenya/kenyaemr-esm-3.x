import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
export interface Result {
  [x: string]: any;
  uuid: string;
  orderNumber: string;
  accessionNumber: string;
  patient: Patient;
  concept: Concept;
  action: string;
  careSetting: CareSetting;
  previousOrder: PreviousOrder;
  dateActivated: string;
  scheduledDate: any;
  dateStopped: any;
  autoExpireDate: any;
  encounter: Encounter;
  orderer: Orderer;
  orderReason: any;
  orderReasonNonCoded: any;
  orderType: OrderType;
  urgency: string;
  instructions: any;
  commentToFulfiller: any;
  display: string;
  auditInfo: AuditInfo;
  fulfillerStatus: string;
  fulfillerComment: any;
  specimenSource: SpecimenSource;
  laterality: string;
  bodySite: Concept;
  clinicalHistory: any;
  frequency: any;
  numberOfRepeats: any;
  links: Link[];
  type: string;
  resourceVersion: string;
  procedures: Procedure[];
}

export interface Procedure {
  uuid: string;
  outcome: string;
  procedureReport: string;
}
export interface Patient {
  uuid: string;
  display: string;
  links: Link[];
}

export interface Link {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface Concept {
  conceptClass: ConceptClass;
  uuid: string;
  display: string;
  links: Link[];
}

export interface ConceptClass {
  uuid: string;
}

export interface CareSetting {
  uuid: string;
  name: string;
  description: string;
  retired: boolean;
  careSettingType: string;
  display: string;
  links: Link[];
  resourceVersion: string;
}

export interface PreviousOrder {
  uuid: string;
  display: string;
  links: Link[];
  type: string;
}

export interface Encounter {
  uuid: string;
  display: string;
  links: Link[];
}

export interface Orderer {
  uuid: string;
  display: string;
  links: Link[];
}

export interface OrderType {
  uuid: string;
  display: string;
  name: string;
  javaClassName: string;
  retired: boolean;
  description: string;
  conceptClasses: any[];
  parent: any;
  links: Link[];
  resourceVersion: string;
}

export interface AuditInfo {
  creator: Creator;
  dateCreated: string;
  changedBy: any;
  dateChanged: any;
}

export interface Creator {
  uuid: string;
  display: string;
  links: Link[];
}

export interface SpecimenSource {
  uuid: string;
  display: string;
  links: Link[];
}

export function useGetOrdersWorklist(activatedOnOrAfterDate: string, fulfillerStatus: string) {
  const apiUrl = `/ws/rest/v1/order?orderTypes=52a447d3-a64a-11e3-9aeb-50e549534c5e&activatedOnOrAfterDate=${activatedOnOrAfterDate}&isStopped=false&fulfillerStatus=${fulfillerStatus}&v=full
`;

  const { data, error, isLoading } = useSWR<{ data: { results: Array<Result> } }, Error>(apiUrl, openmrsFetch);

  const orders = data?.data?.results?.filter((order) => {
    if (fulfillerStatus === '') {
      return order.fulfillerStatus === null && order.dateStopped === null && order.action === 'NEW';
    } else if (fulfillerStatus === 'IN_PROGRESS') {
      return order.fulfillerStatus === 'IN_PROGRESS' && order.dateStopped === null && order.action !== 'DISCONTINUE';
    }
  });

  return {
    workListEntries: orders?.length > 0 ? orders : [],
    isLoading,
    isError: error,
  };
}
