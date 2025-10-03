import { useCervixData } from './cervix-form.resource';

/**
 * Hook to fetch and manage cervix data for a patient
 * This is a wrapper around the main useCervixData hook for easier importing
 */
export function useCervixFormData(patientUuid: string) {
  return useCervixData(patientUuid);
}

// Re-export types for convenience
export type {
  CervixFormData,
  CervixObservation,
  CervixEncounter,
  SaveCervixDataResponse,
} from './cervix-form.resource';

export {
  saveCervixFormData,
  deleteCervixEncounter,
  CERVIX_FORM_CONCEPTS,
  MCH_PARTOGRAPHY_ENCOUNTER_UUID,
} from './cervix-form.resource';
