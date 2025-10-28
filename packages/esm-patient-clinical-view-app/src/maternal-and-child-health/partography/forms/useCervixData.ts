import { useCervixData, UseCervixDataResult } from '../resources/cervix.resource';
export function useCervixFormData(patientUuid: string): UseCervixDataResult {
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
  MCH_PARTOGRAPHY_ENCOUNTER_UUID,
} from '../resources/cervix.resource';
