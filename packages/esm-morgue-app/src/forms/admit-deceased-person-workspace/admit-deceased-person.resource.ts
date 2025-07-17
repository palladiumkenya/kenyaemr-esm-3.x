import {
  FetchResponse,
  openmrsFetch,
  type OpenmrsResource,
  restBaseUrl,
  toDateObjectStrict,
  toOmrsIsoString,
  updateVisit,
  useConfig,
  useSession,
  type Visit,
} from '@openmrs/esm-framework';
import useSWR from 'swr';
import {
  EmrApiConfigurationResponse,
  Encounter,
  MappedVisitQueueEntry,
  type PaymentMethod,
  type VisitTypeResponse,
} from '../../types';
import { useCallback, useMemo, useState } from 'react';
import { deceasedPatientAdmitSchema, dischargeSchema, disposeSchema } from '../../schemas';
import useSWRImmutable from 'swr/immutable';

import { z } from 'zod';
import dayjs from 'dayjs';
import { customRepProps } from '../../constants';
import { BillingConfig, ConfigObject } from '../../config-schema';
import { parseDischargeDateTime } from '../../utils/utils';

export const useVisitType = () => {
  const customRepresentation = 'custom:(uuid,display,name)';
  const url = `${restBaseUrl}/visittype?v=${customRepresentation}`;
  const { data, error, isLoading } = useSWR<FetchResponse<{ results: VisitTypeResponse[] }>>(url, openmrsFetch);
  const visitType = data?.data?.results || null;

  return { data: visitType, error, isLoading };
};

export const useBillableItems = () => {
  const url = `${restBaseUrl}/cashier/billableService?v=custom:(uuid,name,shortName,serviceStatus,serviceType:(uuid,display),servicePrices:(uuid,name,price,paymentMode))`;
  const { data, isLoading, error } = useSWR<{ data: { results: Array<OpenmrsResource> } }>(url, openmrsFetch);
  const [searchTerm, setSearchTerm] = useState('');
  const filteredItems =
    data?.data?.results?.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase())) ?? [];
  return {
    lineItems: filteredItems,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
  };
};

export const useCashPoint = () => {
  const url = `/ws/rest/v1/cashier/cashPoint`;
  const { data, isLoading, error } = useSWR<{ data: { results: Array<OpenmrsResource> } }>(url, openmrsFetch);

  return { isLoading, error, cashPoints: data?.data?.results ?? [] };
};

export const usePaymentModes = (excludeWaiver: boolean = true) => {
  const { excludedPaymentMode } = useConfig<BillingConfig>();
  const url = `${restBaseUrl}/cashier/paymentMode?v=full`;
  const { data, isLoading, error, mutate } = useSWR<{ data: { results: Array<PaymentMethod> } }>(url, openmrsFetch, {
    errorRetryCount: 2,
  });
  const allowedPaymentModes =
    excludedPaymentMode?.length > 0
      ? data?.data?.results.filter((mode) => !excludedPaymentMode.some((excluded) => excluded.uuid === mode.uuid)) ?? []
      : data?.data?.results ?? [];
  return {
    paymentModes: excludeWaiver ? allowedPaymentModes : data?.data?.results,
    isLoading,
    mutate,
    error,
  };
};

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

export function removeQueuedPatient(
  queueUuid: string,
  queueEntryUuid: string,
  abortController: AbortController,
  endedAt?: Date,
) {
  return openmrsFetch(`${restBaseUrl}/queue/${queueUuid}/entry/${queueEntryUuid}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      endedAt: toDateObjectStrict(toOmrsIsoString(endedAt) ?? toOmrsIsoString(new Date())),
    },
    signal: abortController.signal,
  });
}

export const useMortuaryOperation = (location?: string) => {
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
    serialNumberUuid,
    nextOfKinNameUuid,
    courtOrderCaseNumberUuid,
    morgueDischargeEncounterTypeUuid,
    morgueAdmissionEncounterTypeUuid,
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
      }: z.infer<typeof deceasedPatientAdmitSchema>,
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

      const visitAttributes = [];
      const encounterPayload = {
        visit: {
          patient: patientUuid,
          startDatetime: dayjs(dateOfAdmission).toISOString(),
          visitType: visitType,
          location: location,
          ...(visitAttributes.length > 0 && { attributes: visitAttributes }),
        },
        patient: patientUuid,
        encounterType: morgueAdmissionEncounterTypeUuid,
        location,
        encounterProviders: [
          {
            provider: currentProvider?.uuid,
            encounterRole: emrConfiguration?.clinicianEncounterRole?.uuid,
          },
        ],
        ...(obs.length > 0 && { obs }),
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
      location,
      obNumberUuid,
      policeIDNumber,
      policeNameUuid,
      tagNumberUuid,
      morgueAdmissionEncounterTypeUuid,
      nextOfKinNameUuid,
      courtOrderCaseNumberUuid,
      morgueDischargeEncounterTypeUuid,
      visitPaymentMethodAttributeUuid,
      obNumberUuid,
      serialNumberUuid,
      burialPermitNumberUuid,
      morgueDischargeEncounterTypeUuid,
      morgueAdmissionEncounterTypeUuid,
      tagNumberUuid,
      policeNameUuid,
      policeIDNumber,
      dischargeAreaUuid,
    ],
  );

  const createDisposalMortuaryEncounter = useCallback(
    async (visit: Visit, data: z.infer<typeof disposeSchema>, encounterDateTime: Date) => {
      const obs = [];
      if (data.nextOfKinNames) {
        obs.push({ concept: nextOfKinNameUuid, value: data.nextOfKinNames });
      }
      if (data.courtOrderCaseNumber) {
        obs.push({ concept: courtOrderCaseNumberUuid, value: data.courtOrderCaseNumber });
      }
      if (data.serialNumber) {
        obs.push({ concept: serialNumberUuid, value: data.serialNumber });
      }

      const encounterPayload = {
        encounterDatetime: encounterDateTime.toISOString(),
        patient: visit?.patient?.uuid,
        encounterType: morgueDischargeEncounterTypeUuid,
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
      nextOfKinNameUuid,
      courtOrderCaseNumberUuid,
      serialNumberUuid,
      morgueDischargeEncounterTypeUuid,
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
    async (patientUuid: string, data: z.infer<typeof deceasedPatientAdmitSchema>) => {
      try {
        const admissionEncounter = await createMortuaryAdmissionEncounter(patientUuid, data);

        const encounterUuid = admissionEncounter?.data?.uuid || admissionEncounter?.data?.uuid;
        const compartment = await assignDeceasedToCompartment(patientUuid, data.availableCompartment, encounterUuid);

        return { admissionEncounter, compartment };
      } catch (error) {
        throw error;
      }
    },
    [assignDeceasedToCompartment, createMortuaryAdmissionEncounter],
  );

  const createDischargeMortuaryEncounter = useCallback(
    async (visit: Visit, data: z.infer<typeof dischargeSchema>, encounterDateTime: Date) => {
      const obs = [];
      if (data.burialPermitNumber) {
        obs.push({ concept: burialPermitNumberUuid, value: data.burialPermitNumber });
      }

      const encounterPayload = {
        encounterDatetime: encounterDateTime.toISOString(),
        patient: visit?.patient?.uuid,
        encounterType: morgueDischargeEncounterTypeUuid,
        location: visit?.location,
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
      morgueDischargeEncounterTypeUuid,
    ],
  );

  const removeDeceasedFromCompartment = useCallback(
    async (patientUuid: string, bedId: number) =>
      openmrsFetch(`${restBaseUrl}/beds/${bedId}?patientUuid=${patientUuid}`, {
        method: 'DELETE',
      }),
    [],
  );

  const endCurrentVisit = useCallback(
    async (currentVisit: Visit, queueEntry: MappedVisitQueueEntry, stopDateTime: Date) => {
      const abortController = new AbortController();

      const response = await updateVisit(
        currentVisit.uuid,
        {
          stopDatetime: stopDateTime,
        },
        abortController,
      );

      if (queueEntry) {
        removeQueuedPatient(
          queueEntry.queue.uuid,
          queueEntry.queueEntryUuid,
          abortController,
          new Date(response?.data?.stopDatetime),
        );
      }
    },
    [],
  );

  const dischargeBody = useCallback(
    async (visit: Visit, queueEntry: MappedVisitQueueEntry, bedId: number, data: z.infer<typeof dischargeSchema>) => {
      try {
        const dischargeDateTime = parseDischargeDateTime({
          ...data,
          dateOfDischarge: data.dateOfDischarge ?? new Date(),
        });

        const dischargeEncounter = await createDischargeMortuaryEncounter(visit, data, dischargeDateTime);

        const compartment = await removeDeceasedFromCompartment(visit?.patient?.uuid, bedId);

        const visitStopTime = new Date();

        if (visitStopTime.getTime() <= dischargeDateTime.getTime()) {
          visitStopTime.setTime(dischargeDateTime.getTime() + 60000);
        }

        await endCurrentVisit(visit, queueEntry, visitStopTime);

        return { dischargeEncounter, compartment };
      } catch (error) {
        throw error;
      }
    },
    [createDischargeMortuaryEncounter, endCurrentVisit, removeDeceasedFromCompartment, parseDischargeDateTime],
  );
  const disposeBody = useCallback(
    async (visit: Visit, queueEntry: MappedVisitQueueEntry, bedId: number, data: z.infer<typeof disposeSchema>) => {
      try {
        const disposalDateTime = parseDischargeDateTime({
          ...data,
          dateOfDischarge: data.dateOfDischarge ?? new Date(),
        });

        const disposeEncounter = await createDisposalMortuaryEncounter(visit, data, disposalDateTime);

        const compartment = await removeDeceasedFromCompartment(visit?.patient?.uuid, bedId);

        const visitStopTime = new Date(disposalDateTime.getTime() + 60000); // Add 1 minute

        await endCurrentVisit(visit, queueEntry, visitStopTime);

        return { disposeEncounter, compartment };
      } catch (error) {
        throw error;
      }
    },
    [createDisposalMortuaryEncounter, endCurrentVisit, removeDeceasedFromCompartment, parseDischargeDateTime],
  );

  const createEncounterForCompartmentSwap = useCallback(
    async (patientUuid: string, visitUuid: string) =>
      openmrsFetch<Encounter>(`${restBaseUrl}/encounter`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: {
          encounterDatetime: new Date(),
          patient: patientUuid,
          encounterType: emrConfiguration?.bedAssignmentEncounterType,
          location,
          encounterProviders: [
            {
              provider: currentProvider?.uuid,
              encounterRole: emrConfiguration?.clinicianEncounterRole?.uuid,
            },
          ],
          visit: visitUuid,
          obs: [],
        },
      }),
    [
      currentProvider?.uuid,
      emrConfiguration?.bedAssignmentEncounterType,
      emrConfiguration?.clinicianEncounterRole?.uuid,
      location,
    ],
  );

  return {
    admitBody,
    disposeBody,
    createDisposalMortuaryEncounter,
    createEncounterForCompartmentSwap,
    assignDeceasedToCompartment,
    removeDeceasedFromCompartment,
    dischargeBody,
    isLoadingEmrConfiguration,
    errorFetchingEmrConfiguration,
  };
};

export const createPatientBill = (payload) => {
  const postUrl = `${restBaseUrl}/cashier/bill`;
  return openmrsFetch(postUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload });
};
