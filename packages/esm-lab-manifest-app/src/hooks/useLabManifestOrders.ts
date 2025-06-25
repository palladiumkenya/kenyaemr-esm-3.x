import { FetchResponse, openmrsFetch, restBaseUrl, useDebounce } from '@openmrs/esm-framework';
import { useState } from 'react';
import useSWR from 'swr';
import { Order } from '@openmrs/esm-patient-common-lib';

export interface LabManifestSample {
  uuid: string;
  id: number;
  labManifest: LabManifest;
  order: Order & { patient: Patient };
  sampleType: string;
  payload: string;
  dateSent?: string;
  status: string;
  result?: string;
  resultDate?: string;
  sampleCollectionDate: string;
  sampleSeparationDate: string;
  lastStatusCheckDate?: string;
  sampleReceivedDate?: string;
  sampleTestedDate?: string;
  resultsPulledDate?: string;
  resultsDispatchDate?: string;
  orderType?: string;
  batchNumber?: string;
  resourceVersion: string;
}

export interface LabManifest {
  uuid: string;
  identifier: any;
  status: string;
  labManifestOrders: Array<LabManifestOrder>;
}

export interface LabManifestOrder {
  uuid: string;
  id: number;
  sampleType: string;
  status: string;
}
export interface Patient {
  uuid: string;
  display: string;
}

const useLabManifestOrders = (manifetsUuid: string) => {
  const [search, setSearch] = useState<string>('');
  const val = useDebounce(search, 500);
  const urls = `${restBaseUrl}/labmanifestorder?v=full&manifestuuid=${manifetsUuid}&q=${val}`;
  const { data, isLoading, error, mutate } = useSWR<FetchResponse<{ results: Array<LabManifestSample> }>>(
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
