import { openmrsFetch, useConfig } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { CarePanelConfig } from '../config-schema';
import { Enrollment } from '../types';

const usePatientHIVStatus = (patientUuid: string) => {
  const customeRepresentation = 'custom:(uuid,program:(name,uuid))';
  const url = `/ws/rest/v1/programenrollment?v=${customeRepresentation}&patient=${patientUuid}`;
  const config = useConfig<CarePanelConfig>();
  const { data, error, isLoading } = useSWR<{ data: { results: Enrollment[] } }>(url, openmrsFetch);
  return {
    error,
    isLoading,
    isPositive: (data?.data?.results ?? []).find((en) => en.program.uuid === config.hivProgramUuid) !== undefined,
  };
};

export default usePatientHIVStatus;
