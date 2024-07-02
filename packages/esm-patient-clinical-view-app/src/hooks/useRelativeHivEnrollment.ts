import { openmrsFetch, useConfig } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { ConfigObject } from '../config-schema';
import { Enrollment } from '../types';

const useRelativeHivEnrollment = (relativeUuid: string) => {
  const customeRepresentation = 'custom:(uuid,program:(name,uuid))';
  const url = `/ws/rest/v1/programenrollment?v=${customeRepresentation}&patient=${relativeUuid}`;
  const config = useConfig<ConfigObject>();
  const { data, error, isLoading } = useSWR<{ data: { results: Enrollment[] } }>(url, openmrsFetch);
  return {
    error,
    isLoading,
    enrollment: (data?.data?.results ?? []).find((en) => en.program.uuid === config.hivProgramUuid) ?? null,
  };
};

export default useRelativeHivEnrollment;
