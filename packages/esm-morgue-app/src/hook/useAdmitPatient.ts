import { FetchResponse, openmrsFetch, restBaseUrl, useConfig, useSession, type Visit } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import { useCallback, useMemo } from 'react';
import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable';
import { z } from 'zod';
import { ConfigObject } from '../config-schema';
import { CurrentLocationEncounterResponse, customRepProps, EmrApiConfigurationResponse, Encounter } from '../types';
import { dischargeSchema, patientInfoSchema } from '../utils/utils';
import { useMortuaryLocation } from './useMortuaryAdmissionLocation';
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

export const useMortuaryOperation = () => {
  const { location } = useMortuaryLocation();
  const { currentProvider } = useSession();
  const { emrConfiguration, isLoadingEmrConfiguration, errorFetchingEmrConfiguration } = useEmrConfiguration();
  const {
    visitPaymentMethodAttributeUuid,
    tagNumberUuid,
    obNumberUuid,
    burialPermitNumberUuid,
    policeNameUuid,
    policeIDNumber,
    dischargeAreaUuid,
  } = useConfig<ConfigObject>();

  const createMortuaryAdmissionEncounter = useCallback(
    async (
      patientUuid: string,
      {
        availableCompartment,
        dateOfAdmission,
        insuranceScheme,
        dischargeArea,
        obNumber,
        paymentMethod,
        period,
        policeIDNo,
        policeName,
        tagNumber,
        visitType,
      }: z.infer<typeof patientInfoSchema>,
    ) => {
      const obs = [];
      if (tagNumber) {
        obs.push({ concept: tagNumberUuid, value: tagNumber });
      }
      if (obNumber) {
        obs.push({ concept: obNumberUuid, value: obNumber });
      }
      if (policeName) {
        obs.push({ concept: policeNameUuid, value: policeName });
      }
      if (policeIDNo) {
        obs.push({ concept: policeIDNumber, value: policeIDNo });
      }
      if (dischargeArea) {
        obs.push({ concept: dischargeAreaUuid, value: dischargeArea });
      }
      const encounterPayload = {
        visit: {
          patient: patientUuid,
          startDatetime: dayjs(dateOfAdmission).toISOString(),
          visitType: visitType,
          location: location?.uuid,
          attributes: [
            {
              attributeType: visitPaymentMethodAttributeUuid,
              value: paymentMethod,
            },
          ],
        },
        patient: patientUuid,
        encounterType: emrConfiguration?.admissionEncounterType?.uuid,
        location: location?.uuid,
        encounterProviders: [
          {
            provider: currentProvider?.uuid,
            encounterRole: emrConfiguration?.clinicianEncounterRole?.uuid,
          },
        ],
        obs: obs.length > 0 ? obs : undefined,
      };
      return openmrsFetch<Encounter>(`${restBaseUrl}/encounter`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: encounterPayload,
      });
    },
    [
      currentProvider?.uuid,
      dischargeAreaUuid,
      emrConfiguration?.admissionEncounterType?.uuid,
      emrConfiguration?.clinicianEncounterRole?.uuid,
      location?.uuid,
      obNumberUuid,
      policeIDNumber,
      policeNameUuid,
      tagNumberUuid,
      visitPaymentMethodAttributeUuid,
    ],
  );

  const assignDeceasedToCompartment = useCallback(
    async (patientUuid: string, bedId: number, encounterUuid: string) =>
      openmrsFetch(`${restBaseUrl}/beds/${bedId}`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: {
          patientUuid,
          encounterUuid,
        },
      }),
    [],
  );

  const admitBody = useCallback(
    async (patientUuid: string, data: z.infer<typeof patientInfoSchema>) => {
      const admissionEncounter = await createMortuaryAdmissionEncounter(patientUuid, data);
      const compartment = await assignDeceasedToCompartment(
        patientUuid,
        data.availableCompartment,
        admissionEncounter.data.uuid,
      );
      return { admissionEncounter, compartment };
    },
    [assignDeceasedToCompartment, createMortuaryAdmissionEncounter],
  );

  const createDischargeMortuaryEncounter = useCallback(
    async (visit: Visit, data: z.infer<typeof dischargeSchema>) => {
      const obs = [];
      if (data.burialPermitNumber) {
        obs.push({ concept: burialPermitNumberUuid, value: data.burialPermitNumber });
      }

      const encounterPayload = {
        encounterDatetime: data?.dateOfDischarge,
        patient: visit?.patient?.uuid,
        encounterType: emrConfiguration?.exitFromInpatientEncounterType,
        location: visit?.location?.uuid,
        encounterProviders: [
          {
            provider: currentProvider?.uuid,
            encounterRole: emrConfiguration?.clinicianEncounterRole?.uuid,
          },
        ],
        visit: visit?.uuid,
        obs: obs.length > 0 ? obs : undefined,
      };
      return openmrsFetch<Encounter>(`${restBaseUrl}/encounter`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: encounterPayload,
      });
    },
    [
      burialPermitNumberUuid,
      currentProvider?.uuid,
      emrConfiguration?.clinicianEncounterRole?.uuid,
      emrConfiguration?.exitFromInpatientEncounterType,
    ],
  );
  const removeDeceasedFromCompartment = useCallback(
    async (patientUuid: string, bedId: number) =>
      openmrsFetch(`${restBaseUrl}/beds/${bedId}?patientUuid=${patientUuid}`, {
        method: 'DELETE',
      }),
    [],
  );

  const dischargeBody = useCallback(
    async (visit: Visit, bedId: number, data: z.infer<typeof dischargeSchema>) => {
      const dischargeEncounter = await createDischargeMortuaryEncounter(visit, data);
      const compartment = await removeDeceasedFromCompartment(visit?.patient?.uuid, bedId);
      return { dischargeEncounter, compartment };
    },
    [createDischargeMortuaryEncounter, removeDeceasedFromCompartment],
  );

  return {
    admitBody,
    dischargeBody,
    isLoadingEmrConfiguration,
    errorFetchingEmrConfiguration,
  };
};

export const useTimeOnUnit = () => {
  const { location } = useMortuaryLocation();
  const customRepresentation = `custom:(visit:(patient:(uuid,display),),encounterAssigningToCurrentInpatientLocation:(encounterDatetime),)`;
  const url = `${restBaseUrl}/emrapi/inpatient/admission?currentInpatientLocation=${location?.uuid}&v=${customRepresentation}`;
  const { data, ...rest } = useSWR<FetchResponse<CurrentLocationEncounterResponse>, Error>(url, openmrsFetch);

  return {
    timeOnUnit: data?.data,
    ...rest,
  };
};
