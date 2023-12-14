import useSWR from 'swr';
import { OpenmrsResource, openmrsFetch } from '@openmrs/esm-framework';
import orderBy from 'lodash-es/orderBy';
import groupBy from 'lodash/groupBy';
import dayjs from 'dayjs';

const SESSSION_DETAILS_CONCEPT = '1639AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
const ADHERENCE_PLAN = '4342d15d-22e2-456e-bbfd-16b42b2ec8c6';
const ADHERENCE_ENCOUNTER_TYPE_UUID = '54df6991-13de-4efc-a1a9-2d5ac1b72ff8';
const RETURN_VISIT_DATE = '5096AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

export type AdherenceProgram = {
  concept: OpenmrsResource;
  obsDatetime: string;
  value: string;
  status: string;
  uuid: string;
};
export const usePatientEnhancedAdherence = (patientUuid: string) => {
  const url = `/ws/rest/v1/encounter?patient=${patientUuid}&v=custom:(uuid,encounterDatetime,obs:(obsDatetime,value,concept:(uuid,display),status))&encounterType=${ADHERENCE_ENCOUNTER_TYPE_UUID}`;
  const { data, error, isLoading, isValidating } = useSWR<{
    data: { results: Array<{ uuid: string; obs: Array<AdherenceProgram>; encounterDatetime: string }> };
  }>(url, openmrsFetch);

  // Grouping enhanced adherence sessions
  const responseData = data?.data?.results ?? [];

  const results = responseData
    .flatMap((el) => el.obs)
    .filter((obs) => obs.concept.uuid === '164891AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');

  const uniqueSessionDates = results.map((el) => el.value);
  const hashTableTable = new Map<string | number, Array<any>>();
  responseData.forEach((encounter) => {
    const groupDate = encounter.obs.find((obs) => obs.concept.uuid === '164891AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA')?.value;
    console.log(groupDate, 'key');
    if (hashTableTable.has(groupDate)) {
      const existingEncounter = hashTableTable.get(groupDate);
      if (uniqueSessionDates.includes(groupDate)) {
        hashTableTable.set(groupDate, [encounter].concat(existingEncounter));
      }
    }
    if (uniqueSessionDates.includes(groupDate)) {
      hashTableTable.set(groupDate, [encounter]);
    }
  });

  console.log(Array.from(hashTableTable));

  const patientAdherence =
    data?.data?.results
      ?.flatMap((adherence) => adherence.obs)
      ?.filter((adherence) => adherence.concept.uuid === SESSSION_DETAILS_CONCEPT) ?? [];

  const groupedData = groupBy(
    data?.data?.results.flatMap((a) => a.obs) ?? [],
    (adherence: any) => adherence?.concept?.uuid,
  );
  // eslint-disable-next-line no-console
  // console.log('groupedData', groupedData);
  return {
    patientAdherence: orderBy(patientAdherence, 'obsDatetime', 'desc'),
    error,
    isLoading,
    isValidating,
  };
};
