import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { programData } from '../../../../__mocks__/program-metadata.mock';

export const useProgramData = () => {
  const patientProgramsUrl = ``;
  const { data, mutate, error, isLoading } = useSWR<{ data: { results: Array<string> } }>(
    patientProgramsUrl,
    openmrsFetch,
  );
  const patientPrograms = programData;
  return {
    data: patientPrograms,
    isError: error,
    isLoading: isLoading
  }
}