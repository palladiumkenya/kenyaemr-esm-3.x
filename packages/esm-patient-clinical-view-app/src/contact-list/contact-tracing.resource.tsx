import { formatDate, openmrsFetch, parseDate, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import useEncounters from '../hooks/useEncounters';
import { ConfigObject } from '../config-schema';
import { useMemo } from 'react';
import { Encounter } from '../types';

type ContactTrace = {
  date: string;
  contactType: string;
  status: string;
  reasonNotContacted?: string;
  facilityLinkedTo?: string;
  remarks?: string;
  encounterUuid: string;
};

type TraceEncounter = Encounter & {
  form: {
    uuid: string;
    display: string;
  };
  location: {
    uuid: string;
    display: string;
  };
  obs: Array<{
    uuid: string;
    display: string;
    concept: {
      uuid: string;
      displat: string;
    };
    value:
      | string
      | {
          uuid: string;
          display: string;
        };
  }>;
};
const mapConcepts = (conceptUuid: string) => {
  const mapping = {
    '0c112728-17b5-4342-b603-ac6dd2acf9cd': 'Incorrect locator information',
    'ac1fcb25-f443-4a32-b638-193f04d897a9': 'No locator information',
    '1567AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 'Calls not going through',
    '1706AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 'Not found at home',
    '160415AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 'Migrated',
    '160034AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 'Died',
    '5622AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 'Others',
    '1118AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 'Not contacted',
    '1066AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 'Contacted but not linked',
    '1065AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 'Contacted and linked',
    'eb113c76-aef8-4890-a611-fe22ba003123': 'Physical tracing',
    '1650AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 'Phone tracing',
  };
  return mapping[conceptUuid];
};

const getObsValueByConceptUuid = (obs: TraceEncounter['obs'], conceptUuid: string) => {
  const obsValue = (obs ?? []).find((obs) => obs.concept.uuid === conceptUuid)?.value;
  if (typeof obsValue === 'string') {
    return obsValue;
  }
  if (typeof obsValue === 'object') {
    return mapConcepts(obsValue.uuid);
  }
};
export const useContactTraceHistory = (patientUuid: string) => {
  const customRep =
    'custom:(uuid,display,encounterDatetime,location:(uuid,display),form:(uuid,display),obs:(uuid,display,concept:(uuid,display),value:(uuid,display)))';
  const {
    encounterTypes: { htsEcounterUuid },
    formsList: { htsClientTracingFormUuid },
    htsClientTracingConceptsUuids: {
      modeOfClienttracingConceptUuid,
      reasonNotContactedConceptUuid,
      remarksConceptUuid,
      tracingStatusConceptUuid,
    },
  } = useConfig<ConfigObject>();

  const { encounters, error, isLoading } = useEncounters(patientUuid, htsEcounterUuid, undefined, undefined, customRep);

  const tracingHistory = useMemo(
    () =>
      encounters
        .filter((encounter: TraceEncounter) => encounter.form.uuid === htsClientTracingFormUuid)
        .map<ContactTrace>((encounter: TraceEncounter) => ({
          encounterUuid: encounter.uuid,
          contactType: getObsValueByConceptUuid(encounter.obs, modeOfClienttracingConceptUuid),
          status: getObsValueByConceptUuid(encounter.obs, tracingStatusConceptUuid),
          reasonNotContacted: getObsValueByConceptUuid(encounter.obs, reasonNotContactedConceptUuid),
          date: encounter.encounterDatetime ? formatDate(parseDate(encounter.encounterDatetime)) : '--',
          facilityLinkedTo: encounter?.location?.display ?? '--',
          remarks: getObsValueByConceptUuid(encounter.obs, remarksConceptUuid) ?? '--',
        })),
    [
      encounters,
      htsClientTracingFormUuid,
      modeOfClienttracingConceptUuid,
      reasonNotContactedConceptUuid,
      remarksConceptUuid,
      tracingStatusConceptUuid,
    ],
  );
  return { isLoading, error, contactTracesHistory: tracingHistory ?? ([] as Array<ContactTrace>) };
};
export const PAGE_SIZE_OPTIONS = [3, 5, 10, 20, 50, 100];
