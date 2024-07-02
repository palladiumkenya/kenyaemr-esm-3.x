import { Location } from '@openmrs/esm-framework';

export interface Pharmacy extends Location {
  //Inherits Uuid,display,name
  description?: string;
  cityVillage?: string;
  stateProvince?: string;
  countyDistrict?: string;
}
