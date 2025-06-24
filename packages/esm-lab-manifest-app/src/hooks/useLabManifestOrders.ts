import { FetchResponse, openmrsFetch, restBaseUrl, useDebounce } from '@openmrs/esm-framework';
import { useState } from 'react';
import useSWR from 'swr';

export interface LabmanifestSample {
  uuid: string;
  id: number;
  labManifest: LabManifest;
  order: Order;
  sampleType: string;
  payload: string;
  dateSent: any;
  status: string;
  result: any;
  resultDate: any;
  sampleCollectionDate: string;
  sampleSeparationDate: string;
  lastStatusCheckDate: any;
  sampleReceivedDate: any;
  sampleTestedDate: any;
  resultsPulledDate: any;
  resultsDispatchDate: any;
  orderType: any;
  batchNumber: any;
  links: Link[];
  resourceVersion: string;
}

export interface LabManifest {
  uuid: string;
  identifier: any;
  status: string;
  labManifestOrders: LabManifestOrder[];
  links: Link[];
}

export interface LabManifestOrder {
  uuid: string;
  id: number;
  sampleType: string;
  status: string;
  links: Link[];
}

export interface Link {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface Order {
  uuid: string;
  orderNumber: string;
  accessionNumber: any;
  patient: Patient;
  concept: Concept;
  action: string;
  careSetting: CareSetting;
  previousOrder: any;
  dateActivated: string;
  scheduledDate: any;
  dateStopped: any;
  autoExpireDate: any;
  encounter: Encounter;
  orderer: Orderer;
  orderReason: OrderReason;
  orderReasonNonCoded: any;
  orderType: OrderType;
  urgency: string;
  instructions: any;
  commentToFulfiller: any;
  display: string;
  auditInfo: AuditInfo;
  fulfillerStatus: any;
  fulfillerComment: any;
  specimenSource: any;
  laterality: any;
  clinicalHistory: any;
  frequency: any;
  numberOfRepeats: any;
  links: Link[];
  type: string;
  resourceVersion: string;
}

export interface Patient {
  uuid: string;
  display: string;
  links: Link[];
}
export interface Concept {
  uuid: string;
  display: string;
  links: Link[];
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

export interface OrderReason {
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

const useLabManifestOrders = (manifetsUuid: string) => {
  const [search, setSearch] = useState<string>('');
  const val = useDebounce(search, 500);
  const urls = `${restBaseUrl}/labmanifestorder?v=full&manifestuuid=${manifetsUuid}&q=${val}`;
  const { data, isLoading, error, mutate } = useSWR<FetchResponse<{ results: Array<LabmanifestSample> }>>(
    urls,
    openmrsFetch,
  );
  return {
    labmanifestOrders: data?.data?.results ?? [],
    searchValue: search,
    setSearchvalue: setSearch,
    isLoading,
    error,
  };
};

export default useLabManifestOrders;
