import {
  FetchResponse,
  openmrsFetch,
  type OpenmrsResource,
  type Patient,
  restBaseUrl,
  useSession,
} from '@openmrs/esm-framework';
import { useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';
import { customRepProps, DispositionType, EmrApiConfigurationResponse, Encounter, ObsPayload } from '../types';
import useMortuaryLocation from './useMortuaryLocations';

const customRep = `custom:${customRepProps.map((prop) => prop.join(':')).join(',')}`;

export default function useEmrConfiguration() {
  const swrData = useSWRImmutable<FetchResponse<EmrApiConfigurationResponse>>(
    `${restBaseUrl}/emrapi/configuration?v=${customRep}`,
    openmrsFetch,
  );

  const results = useMemo(
    () => ({
      emrConfiguration: swrData.data?.data,
      isLoadingEmrConfiguration: swrData.isLoading,
      mutateEmrConfiguration: swrData.mutate,
      errorFetchingEmrConfiguration: swrData.error,
    }),
    [swrData],
  );
  return results;
}

export function useCreateEncounter() {
  const { location } = useMortuaryLocation();
  const { currentProvider } = useSession();
  const { emrConfiguration, isLoadingEmrConfiguration, errorFetchingEmrConfiguration } = useEmrConfiguration();

  const createEncounter = (patient: Patient, encounterType: OpenmrsResource, obs: ObsPayload[] = []) => {
    const encounterPayload = {
      patient: patient.uuid,
      encounterType,
      location: location?.uuid,
      encounterProviders: [
        {
          provider: currentProvider?.uuid,
          encounterRole: emrConfiguration.clinicianEncounterRole.uuid,
        },
      ],
      obs,
    };

    return openmrsFetch<Encounter>(`${restBaseUrl}/encounter`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: encounterPayload,
    });
  };

  return { createEncounter, emrConfiguration, isLoadingEmrConfiguration, errorFetchingEmrConfiguration };
}

export function useAdmitDeceased() {
  const { createEncounter, emrConfiguration, isLoadingEmrConfiguration, errorFetchingEmrConfiguration } =
    useCreateEncounter();

  const admitPatient = (patient: Patient, dispositionType: DispositionType) => {
    const encounterType =
      dispositionType === 'ADMIT'
        ? emrConfiguration.admissionEncounterType
        : dispositionType === 'TRANSFER'
        ? emrConfiguration.transferWithinHospitalEncounterType
        : null;
    return createEncounter(patient, encounterType);
  };

  return { admitPatient, isLoadingEmrConfiguration, errorFetchingEmrConfiguration };
}
