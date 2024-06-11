import { type OrderBasketItem } from '@openmrs/esm-patient-common-lib';

export interface Concept {
  uuid: string;
  display: string;
  conceptClass: {
    uuid: string;
    display: string;
    name: string;
  };
  answers: [];
  setMembers: [];
  hiNormal: number;
  hiAbsolute: number;
  hiCritical: number;
  lowNormal: number;
  lowAbsolute: number;
  lowCritical: number;
  units: string;
  allowDecimal: boolean;
  displayPrecision: null;
  attributes: [];
}

export interface RadiologyOrderBasketItem extends OrderBasketItem {
  testType?: {
    label: string;
    conceptUuid: string;
  };
  urgency?: string;
  instructions?: string;
  orderReason?: string;
  scheduleDate?: Date | string;
  commentsToFulfiller?: string;
  laterality?: string;
  bodySite?: string;
}

export type OrderFrequency = CommonRadiologyValueCoded;
export type DurationUnit = CommonRadiologyValueCoded;

interface CommonRadiologyProps {
  value: string;
  default?: boolean;
}

export interface CommonRadiologyValueCoded extends CommonRadiologyProps {
  valueCoded: string;
}
