import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';

export const trimVisitNumber = (visitNumber: string) => {
  if (!visitNumber) {
    return;
  }
  return visitNumber.substring(15);
};

export const formatWaitTime = (waitTime: string, t) => {
  const num = parseInt(waitTime);
  const hours = num / 60;
  const rhours = Math.floor(hours);
  const minutes = (hours - rhours) * 60;
  const rminutes = Math.round(minutes);
  if (rhours > 0) {
    return rhours + ' ' + `${t('hoursAnd', 'hours and ')}` + rminutes + ' ' + `${t('minutes', 'minutes')}`;
  } else {
    return rminutes + ' ' + `${t('minutes', 'minutes')}`;
  }
};

export const getTagColor = (waitTime: string) => {
  const num = parseInt(waitTime);
  if (num <= 30) {
    return 'green';
  } else if (num > 30 && num <= 45) {
    return 'orange';
  } else {
    return 'red';
  }
};

export const getStatusColor = (fulfillerStatus: string) => {
  if (fulfillerStatus === 'COMPLETED') {
    return 'green';
  } else if (fulfillerStatus === 'IN_PROGRESS') {
    return 'orange';
  } else {
    return 'red';
  }
};
export interface PatientResource {
  uuid: string;
  display: string;
  identifiers: Identifier[];
  person: Person;
  voided: boolean;
  auditInfo: AuditInfo;
  links: Link[];
  resourceVersion: string;
}

export interface Identifier {
  display: string;
  uuid: string;
  identifier: string;
  identifierType: IdentifierType;
  location: Location;
  preferred: boolean;
  voided: boolean;
  links: Link[];
  resourceVersion: string;
}

export interface IdentifierType {
  uuid: string;
  display: string;
  links: Link[];
}

export interface Link {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface Location {
  uuid: string;
  display: string;
  links: Link[];
}

export interface Person {
  uuid: string;
  display: string;
  gender: string;
  age: number;
  birthdate: string;
  birthdateEstimated: boolean;
  dead: boolean;
  deathDate: any;
  causeOfDeath: any;
  preferredName: PreferredName;
  preferredAddress: PreferredAddress;
  names: Name[];
  addresses: Address[];
  attributes: Attribute[];
  voided: boolean;
  auditInfo: AuditInfo;
  birthtime: any;
  deathdateEstimated: boolean;
  causeOfDeathNonCoded: any;
  links: Link[];
  resourceVersion: string;
}

export interface PreferredName {
  display: string;
  uuid: string;
  givenName: string;
  middleName: string;
  familyName: string;
  familyName2: any;
  voided: boolean;
  links: Link[];
  resourceVersion: string;
}

export interface PreferredAddress {
  display: any;
  uuid: string;
  preferred: boolean;
  address1: any;
  address2: any;
  cityVillage: any;
  stateProvince: string;
  country: string;
  postalCode: any;
  countyDistrict: string;
  address3: string;
  address4: string;
  address5: string;
  address6: any;
  startDate: any;
  endDate: any;
  latitude: any;
  longitude: any;
  voided: boolean;
  address7: any;
  address8: any;
  address9: any;
  address10: any;
  address11: any;
  address12: any;
  address13: any;
  address14: any;
  address15: any;
  links: Link[];
  resourceVersion: string;
}

export interface Name {
  display: string;
  uuid: string;
  givenName: string;
  middleName: string;
  familyName: string;
  familyName2: any;
  voided: boolean;
  links: Link[];
  resourceVersion: string;
}

export interface Address {
  display: any;
  uuid: string;
  preferred: boolean;
  address1: any;
  address2: any;
  cityVillage: any;
  stateProvince: string;
  country: string;
  postalCode: any;
  countyDistrict: string;
  address3: string;
  address4: string;
  address5: string;
  address6: any;
  startDate: any;
  endDate: any;
  latitude: any;
  longitude: any;
  voided: boolean;
  address7: any;
  address8: any;
  address9: any;
  address10: any;
  address11: any;
  address12: any;
  address13: any;
  address14: any;
  address15: any;
  links: Link[];
  resourceVersion: string;
}

export interface Attribute {
  display: string;
  uuid: string;
  value: string;
  attributeType: AttributeType;
  voided: boolean;
  links: Link[];
  resourceVersion: string;
}

export interface AttributeType {
  uuid: string;
  display: string;
  links: Link[];
}

export interface AuditInfo {
  creator: Creator;
  dateCreated: string;
  changedBy: any;
  dateChanged: any;
}

export interface Creator {
  uuid: string;
  display: string;
  links: Link[];
}

export function useGetPatientByUuid(uuid: string) {
  const apiUrl = `${restBaseUrl}/patient/${uuid}?v=full`;
  const { data, error, isLoading } = useSWR<{ data: PatientResource }, Error>(apiUrl, openmrsFetch);
  return {
    patient: data?.data,
    isLoading,
    isError: error,
  };
}
