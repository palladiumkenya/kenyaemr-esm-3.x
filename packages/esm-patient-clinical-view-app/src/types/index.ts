<<<<<<< HEAD
import { OpenmrsResource } from '@openmrs/esm-framework';
export interface OpenmrsEncounter extends OpenmrsResource {
  encounterDatetime: string;
  encounterType: string;
  patient: string;
  location: string;
  encounterProviders?: Array<{ encounterRole: string; provider: string }>;
  obs: Array<OpenmrsResource>;
  form?: string;
  visit?: string;
}
=======
export type PatientSummary = {
  viralLoadValue: string;
  viralLoadDate: string;
  allVlResults: vlResults;
};
type vlResults = {
  value: Array<vl>;
};
type vl = {
  vl?: string;
  vlDate?: string;
};
>>>>>>> wip
