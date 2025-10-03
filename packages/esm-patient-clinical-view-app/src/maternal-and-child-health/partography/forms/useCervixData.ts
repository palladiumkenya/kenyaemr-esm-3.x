import { useCervixData } from '../resources/cervix.resource';
export function useCervixFormData(patientUuid: string) {
  return useCervixData(patientUuid);
}
export type {
  CervixFormData,
  CervixObservation,
  CervixEncounter,
  SaveCervixDataResponse,
} from '../resources/cervix.resource';

export {
  saveCervixFormData,
  deleteCervixEncounter,
  CERVIX_FORM_CONCEPTS,
  MCH_PARTOGRAPHY_ENCOUNTER_UUID,
} from '../resources/cervix.resource';
