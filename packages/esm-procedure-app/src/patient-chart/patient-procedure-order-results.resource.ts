import { formatDate, openmrsFetch, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import useSWR from 'swr';

export interface LaboratoryResponse {
  results: Result[];
}

export interface Result {
  uuid: string;
  display: string;
  encounterDatetime: string;
  patient: Patient;
  location: Location;
  form: Form;
  encounterType: EncounterType;
  obs: Ob[];
  orders: Order[];
  voided: boolean;
  auditInfo: AuditInfo;
  visit: Visit;
  encounterProviders: EncounterProvider[];
  diagnoses: any[];
  links: Link[];
  resourceVersion: string;
}

export interface Patient {
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
  name: string;
  description: any;
  address1: any;
  address2: any;
  cityVillage: any;
  stateProvince: any;
  country: string;
  postalCode: any;
  latitude: any;
  longitude: any;
  countyDistrict: any;
  address3: any;
  address4: any;
  address5: any;
  address6: any;
  tags: Tag[];
  parentLocation: ParentLocation;
  childLocations: ChildLocation[];
  retired: boolean;
  attributes: any[];
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

export interface Tag {
  uuid: string;
  display: string;
  links: Link[];
}

export interface ParentLocation {
  uuid: string;
  display: string;
  links: Link[];
}

export interface ChildLocation {
  uuid: string;
  display: string;
  links: Link[];
}

export interface Form {
  uuid: string;
  display: string;
  name: string;
  description: string;
  encounterType: EncounterType;
  version: string;
  build: any;
  published: boolean;
  formFields: any[];
  retired: boolean;
  resources: Resource[];
  links: Link[];
  resourceVersion: string;
}

export interface Resource {
  uuid: string;
  display: string;
  links: Link[];
}

export interface EncounterType {
  uuid: string;
  display: string;
  name: string;
  description: string;
  retired: boolean;
  links: Link[];
  resourceVersion: string;
}

export interface Ob {
  uuid: string;
  display: string;
  concept: Concept;
  person: Person;
  obsDatetime: string;
  accessionNumber: any;
  obsGroup: any;
  valueCodedName: any;
  groupMembers: GroupMember[];
  comment: any;
  location: Location;
  order: any;
  encounter: Encounter;
  voided: boolean;
  value: any;
  valueModifier: any;
  formFieldPath: string;
  formFieldNamespace: string;
  links: Link[];
  resourceVersion: string;
}

export interface GroupMember {
  uuid: string;
  display: string;
  concept: Concept;
  person: Person;
  obsDatetime: string;
  accessionNumber: any;
  obsGroup: ObsGroup;
  valueCodedName: any;
  groupMembers: any;
  comment: any;
  location: Location;
  order: Order;
  encounter: Encounter;
  voided: boolean;
  value: number | Value;
  valueModifier: any;
  formFieldPath: any;
  formFieldNamespace: any;
  links: Link[];
  resourceVersion: string;
}

export interface Value {
  uuid: string;
  display: string;
  name: Name;
  datatype: Datatype;
  conceptClass: ConceptClass;
  set: boolean;
  version: any;
  retired: boolean;
  names: Name2[];
  descriptions: Description[];
  mappings: Mapping[];
  answers: any[];
  setMembers: any[];
  attributes: any[];
  links: Link[];
  resourceVersion: string;
}

export interface Name {
  display: string;
  uuid: string;
  name: string;
  locale: string;
  localePreferred: boolean;
  conceptNameType: string;
  links: Link[];
  resourceVersion: string;
}

export interface Link {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface Datatype {
  uuid: string;
  display: string;
  links: Link[];
}

export interface ConceptClass {
  uuid: string;
  display: string;
  links: Link[];
}

export interface Name2 {
  uuid: string;
  display: string;
  links: Link[];
}

export interface Description {
  uuid: string;
  display: string;
  links: Link[];
}

export interface Mapping {
  uuid: string;
  display: string;
  links: Link[];
}

export interface ObsGroup {
  uuid: string;
  display: string;
  links: Link[];
}

export interface Concept {
  uuid: string;
  display: string;
  links: Link[];
}

export interface Person {
  uuid: string;
  display: string;
  links: Link[];
}

export interface Encounter {
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

export interface Visit {
  uuid: string;
  display: string;
  patient: Patient;
  visitType: VisitType;
  indication: any;
  location: Location;
  startDatetime: string;
  stopDatetime: any;
  encounters: Encounter[];
  attributes: any[];
  voided: boolean;
  links: Link[];
  resourceVersion: string;
}

export interface VisitType {
  uuid: string;
  display: string;
  links: Link[];
}

export interface EncounterRole {
  uuid: string;
  display: string;
  links: Link[];
}

export interface EncounterProvider {
  uuid: string;
  provider: Provider;
  encounterRole: EncounterRole;
  voided: boolean;
  links: Link[];
  resourceVersion: string;
}

export interface Provider {
  uuid: string;
  display: string;
  links: Link[];
}

// order
export interface Order {
  uuid: string;
  orderNumber: string;
  accessionNumber: any;
  patient: Patient;
  concept: Concept;
  action: string;
  careSetting: CareSetting;
  previousOrder: any;
  dateActivated: string;
  scheduledDate: any;
  dateStopped: string;
  autoExpireDate: any;
  encounter: Encounter;
  orderer: Orderer;
  orderReason: any;
  orderReasonNonCoded: any;
  orderType: OrderType;
  urgency: string;
  instructions: any;
  commentToFulfiller: any;
  display: string;
  specimenSource: any;
  laterality: any;
  clinicalHistory: any;
  frequency: any;
  numberOfRepeats: any;
  links: Link[];
  type: string;
  resourceVersion: string;
}

export interface Patient {
  uuid: string;
  display: string;
  links: Link[];
}

export interface Link {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface Concept {
  uuid: string;
  display: string;
  links: Link[];
}

export interface CareSetting {
  uuid: string;
  display: string;
  links: Link[];
}

export interface Encounter {
  uuid: string;
  display: string;
  links: Link[];
}

export interface Orderer {
  uuid: string;
  display: string;
  links: Link[];
}

export interface OrderType {
  uuid: string;
  display: string;
  name: string;
  javaClassName: string;
  retired: boolean;
  description: string;
  conceptClasses: any[];
  parent: any;
  links: Link[];
  resourceVersion: string;
}

export const getOrderColor = (activated: string, stopped: string) => {
  const numAct = formatWaitTime(activated);
  let testStopped: number;
  if (stopped === null) {
    testStopped = 0;
  }

  if (numAct >= 0 && testStopped === 0) {
    return '#6F6F6F'; // #6F6F6F
  } else {
    return 'green'; // green
  }
};

export const formatWaitTime = (waitTime: string) => {
  const num = parseInt(waitTime);
  const hours = num / 60;
  const rhours = Math.floor(hours);
  const minutes = (hours - rhours) * 60;
  const rminutes = Math.round(minutes);
  return rminutes;
};

export enum ResourceRepresentation {
  Default = 'default',
  Full = 'full',
  REF = 'ref',
}

export interface ResourceFilterCriteria {
  v?: ResourceRepresentation | null;
  q?: string | null;
  totalCount?: boolean | null;
  limit?: number | null;
}

export interface LaboratoryOrderFilter extends ResourceFilterCriteria {
  patientUuid?: string | null | undefined;
  laboratoryEncounterTypeUuid?: string | null;
}

export function toQueryParams<T extends ResourceFilterCriteria>(
  filterCriteria?: T | null,
  skipEmptyString = true,
): string {
  if (!filterCriteria) {
    return '';
  }
  const queryParams: string = Object.keys(filterCriteria)
    ?.map((key) => {
      const value = filterCriteria[key];
      return (skipEmptyString && (value === false || value === true ? true : value)) ||
        (!skipEmptyString && (value === '' || (value === false || value === true ? true : value)))
        ? `${encodeURIComponent(key)}=${encodeURIComponent(value.toString())}`
        : null;
    })
    .filter((o) => o != null)
    .join('&');
  return queryParams.length > 0 ? '?' + queryParams : '';
}

export function usePatientLaboratoryOrders(filter: LaboratoryOrderFilter) {
  const config = useConfig();
  const { laboratoryEncounterTypeUuid } = config;

  const apiUrl = `${restBaseUrl}/encounter?patient=${filter.patientUuid}&encounterType=${laboratoryEncounterTypeUuid}&v=${filter.v}&totalCount=true`;
  const { data, error, isLoading } = useSWR<{ data: LaboratoryResponse }, Error>(apiUrl, openmrsFetch, {
    refreshInterval: 3000,
  });

  return {
    items: data?.data ? data?.data?.results : [],
    isLoading,
    isError: error,
  };
}

export function useGetEncounterById(encounterUuid: string) {
  const apiUrl = `${restBaseUrl}/encounter/${encounterUuid}?v=full`;
  const { data, error, isLoading } = useSWR<{ data: Result }, Error>(apiUrl, openmrsFetch);

  return {
    encounter: data?.data,
    isLoading,
    isError: error,
  };
}
