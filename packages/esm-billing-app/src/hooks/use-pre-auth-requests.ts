import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
import preAuthRequests from '../benefits-package/table/temporary-pre-auth-responses.json';
import { useSystemSetting } from './getMflCode';

export interface PreAuthRequest {
  resourceType: string;
  id: string;
  meta: PreAuthRequestMeta;
  contained: Contained[];
  extension: PreAuthRequestExtension[];
  identifier: ValueIdentifierElement[];
  status: string;
  type: Priority;
  subType: Priority;
  use: string;
  patient: Insurer;
  created: Date;
  insurer: Insurer;
  provider: Insurer;
  priority: Priority;
  payee: Payee;
  careTeam: CareTeam[];
  diagnosis: Diagnosis[];
  insurance: Insurance[];
  item: Item[];
  total: Total;
}

export interface CareTeam {
  sequence: number;
  provider: Insurer;
  role: Priority;
  qualification: Priority;
}

export interface Insurer {
  reference: string;
}

export interface Priority {
  coding: PriorityCoding[];
}

export interface PriorityCoding {
  system: string;
  code: string;
}

export interface Contained {
  resourceType: string;
  id: string;
  meta: ContainedMeta;
  extension?: ContainedExtension[];
  identifier: ContainedIdentifier[];
  active: boolean;
  name: NameElement[] | string;
  gender?: string;
  _gender?: Gender;
  birthDate?: Date;
  maritalStatus?: Priority;
  type?: Priority[];
}

export interface Gender {
  extension: GenderExtension[];
}

export interface GenderExtension {
  url: string;
  valueCodeableConcept: Priority;
}

export interface ContainedExtension {
  url: string;
  valueCodeableConcept: ValueCodeableConcept;
}

export interface ValueCodeableConcept {
  coding: ProductOrServiceCoding[];
}

export interface ProductOrServiceCoding {
  system: string;
  code: string;
  display?: string;
}

export interface ContainedIdentifier {
  type?: ValueCodeableConcept;
  system: string;
  value: string;
  use?: string;
}

export interface ContainedMeta {
  source: string;
  profile: string[];
}

export interface NameElement {
  text: string;
  family: string;
  given: string[];
}

export interface Diagnosis {
  sequence: number;
  diagnosisCodeableConcept: Priority;
  type: Priority[];
}

export interface PreAuthRequestExtension {
  url: string;
  valueIdentifier?: ValueIdentifierElement;
  valueCodeableConcept?: ValueCodeableConcept;
}

export interface ValueIdentifierElement {
  system: string;
  value: string;
}

export interface Insurance {
  sequence: number;
  focal: boolean;
  coverage: Insurer;
}

export interface Item {
  extension: ItemExtension[];
  sequence: number;
  careTeamSequence: number[];
  diagnosisSequence: number[];
  productOrService: ValueCodeableConcept;
  servicedDate: Date;
  quantity: Quantity;
  unitPrice: Total;
  factor: number;
  net: Total;
}

export interface ItemExtension {
  url: string;
  valueMoney?: Total;
  valueIdentifier?: ValueIdentifierElement;
}

export interface Total {
  value: number;
  currency: string;
}

export interface Quantity {
  value: number;
}

export interface PreAuthRequestMeta {
  versionId: string;
  lastUpdated: Date;
  source: string;
  profile: string[];
}

export interface Payee {
  type: Priority;
}

export const usePreAuthRequests = (patientUuid: string) => {
  const { mflCodeValue } = useSystemSetting('facility.mflcode');
  const url = `https://payers.apeiro-digital.com/api/v1/claim/byFacility?facilityCode=Organization/${mflCodeValue}&type=preauthorization&claimResponseId=`;

  const { data, error, isLoading, mutate } = useSWR<{ data: Array<PreAuthRequest> }>(url, openmrsFetch);

  return {
    preAuthRequests: preAuthRequests
      // .filter((req) => req.contained.find((c) => c.resourceType === 'Patient').identifier.find(i => ))
      .map((r) => {
        return {
          ...r,
          productCode: r.item.map((i) => i.productOrService.coding.map((c) => c.code).join(', ')).join(', '),
        };
      }),
    error,
    isLoading,
    mutate,
  };
};
