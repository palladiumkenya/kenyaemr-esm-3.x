import { Location, Patient } from '@openmrs/esm-framework';

export interface Pharmacy extends Location {
  //Inherits Uuid,display,name
  description?: string;
  cityVillage?: string;
  stateProvince?: string;
  countyDistrict?: string;
  dateMaped: string;
  mflCode: string;
}

interface Basis {
  uuid: string;
  name: string;
  country?: string;
  address3?: string;
  countyDistrict?: string;
  address2?: string;
  address1?: string;
  address6?: string;
  address5?: string;
  cityVillage?: string;
  address4?: string;
  'Master Facility Code'?: string;
}

export interface PhamarcyUserMapping {
  uuid: string;
  dateCreated: number;
  entity: {
    name: string;
    uuid: string;
  };
  basis: Basis;
}

export interface PharamacyPatientMapping {
  uuid: string;
  dateCreated: number;
  entity: {
    OpenMRSID?: string;
    identifier?: string;
    gender?: string;
    name: string;
    uuid: string;
    age?: number;
    'Telephone contact'?: string;
  };
  basis: Basis;
}

export interface PharmacyPatient {
  uuid: string;
  openmrsId?: string;
  name: string;
  age?: number;
  gender?: string;
  telephoneContact?: string;
  dateMapped: string;
}

export interface PharmacyUser {
  uuid: string;
  name: string;
  dateMapped: string;
}
