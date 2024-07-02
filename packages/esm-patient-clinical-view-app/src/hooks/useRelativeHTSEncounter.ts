import { openmrsFetch, useConfig } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { ConfigObject } from '../config-schema';
import { HTSEncounter } from '../types';

const useRelativeHTSEncounter = (relativeUuid: string) => {
  const customeRepresentation = 'custom:(uuid,display,encounterDatetime,obs:(uuid,display,value:(uuid,display)))';
  const {
    encounterTypes: { hivTestingServices },
  } = useConfig<ConfigObject>();
  const url = `/ws/rest/v1/encounter?v=${customeRepresentation}&patient=${relativeUuid}&encounterType=${hivTestingServices}`;
  const { data, error, isLoading } = useSWR<{ data: { results: HTSEncounter[] } }>(url, openmrsFetch);
  return {
    error,
    isLoading,
    encounters: data?.data?.results ?? [],
  };
};

export default useRelativeHTSEncounter;
