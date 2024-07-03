import { Location, Patient } from '@openmrs/esm-framework';

export interface Pharmacy extends Location {
  //Inherits Uuid,display,name
  description?: string;
  cityVillage?: string;
  stateProvince?: string;
  countyDistrict?: string;
}

export interface PharmacyPatient {
  uuid: string;
  name: string;
  age?: number;
  gender?: string;
  telephoneContact?: string;
}

export interface PharmacyUser {
  uuid: string;
  name: string;
  age?: number;
  gender?: string;
  telephoneContact?: string;
}
