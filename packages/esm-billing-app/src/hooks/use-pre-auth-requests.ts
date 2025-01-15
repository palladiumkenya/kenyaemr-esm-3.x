import { openmrsFetch, useConfig } from '@openmrs/esm-framework';
import useSWR from 'swr';
import preAuthRequests from '../benefits-package/table/temporary-pre-auth-responses.json';
import { BillingConfig } from '../config-schema';
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

export interface MappedPreAuthRequest {
  id: string;
  lastUpdatedAt: string;
  patient: {
    nationalId?: string;
    reference: string;
    name: string;
    gender: string;
    birthDate: string;
    active: boolean;
  };
  provider: {
    reference: string;
    name: string;
    licenceNumber: string;
    active: boolean;
  };
  status: 'active' | 'cancelled' | 'draft' | 'entered-in-error';
  category?: string;
  type: 'preauthorization' | 'claim';
  insurer?: string;
}

export const usePreAuthRequests = () => {
  const { mflCodeValue } = useSystemSetting('facility.mflcode');
  const { hieBaseUrl } = useConfig<BillingConfig>();
  const url = `${hieBaseUrl}/claim/byFacility?facilityCode=Organization/${mflCodeValue}&type=preauthorization&claimResponseId=`;

  const { data, error, isLoading, mutate } = useSWR<{ data: Array<PreAuthRequest> }>(
    url,
    () =>
      new Promise<{ data: Array<PreAuthRequest> }>((resolve) =>
        setTimeout(
          () =>
            resolve({
              data: preAuthRequests as any,
            }),
          3000,
        ),
      ),
  );

  return {
    preAuthRequests: (data?.data?.length ? data?.data : preAuthRequests).map((r) => {
      const insurerReference = r?.insurer?.reference?.split('/')?.at(-1);
      const findResource = (type: string) => (r.contained as any).find((resource) => resource.resourceType === type);

      const patientNationalId = findResource('Patient')?.identifier?.find(
        (identifier) => identifier.system === 'http://itm/identifier/nationalid',
      )?.value;

      const providerLicentNumber = findResource('Practitioner')?.identifier?.find(
        (identifier) => identifier.system === 'http://itm/license/provider-license',
      )?.value;

      const insurer = (r.contained as any)
        ?.find((resource) => resource.id === insurerReference)
        ?.identifier?.find((identifier) => identifier.system === 'http://itm/license/payer-license')?.value;

      return {
        id: r.id,
        lastUpdatedAt: r.meta.lastUpdated,
        patient: {
          name: (r.contained.find((resource) => resource.resourceType === 'Patient')?.name as any)[0]?.text,
          reference: r.contained.find((resource) => resource.resourceType === 'Patient')?.id,
          active: r.contained.find((resource) => resource.resourceType === 'Patient')?.active,
          birthDate: r.contained.find((resource) => resource.resourceType === 'Patient')?.birthDate,
          gender: r.contained.find((resource) => resource.resourceType === 'Patient')?.gender,
          nationalId: patientNationalId,
        },
        provider: {
          name: (r.contained.find((resource) => resource.resourceType === 'Practitioner')?.name as any)[0]?.text,
          active: r.contained.find((resource) => resource.resourceType === 'Practitioner')?.active,
          reference: r.contained.find((resource) => resource.resourceType === 'Practitioner')?.id,
          licenceNumber: providerLicentNumber,
        },
        status: r.status,
        type: r.use,
        interventionCode: r.item.map((i) => i.productOrService.coding.map((c) => c.code).join(', ')).join(', '),
        insurer,
      } as MappedPreAuthRequest;
    }),
    error,
    isLoading,
    mutate,
  };
};
