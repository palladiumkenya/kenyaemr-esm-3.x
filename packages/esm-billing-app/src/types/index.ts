import { type Drug, type OrderBasketItem } from '@openmrs/esm-patient-common-lib';
export interface MappedBill {
  uuid: string;
  id: number;
  patientUuid: string;
  patientName: string;
  cashPointUuid: string;
  cashPointName: string;
  cashPointLocation: string;
  cashier: Provider;
  receiptNumber: string;
  status: string;
  identifier: string;
  dateCreated: string;
  lineItems: Array<LineItem>;
  billingService: string;
  payments: Array<Payment>;
  totalAmount?: number;
  tenderedAmount?: number;
  display?: string;
}

interface LocationLink {
  rel: string;
  uri: string;
  resourceAlias: string;
}

interface Location {
  uuid: string;
  display: string;
  links: LocationLink[];
}

interface CashPoint {
  uuid: string;
  name: string;
  description: string;
  retired: boolean;
  location: Location;
}

interface ProviderLink {
  rel: string;
  uri: string;
  resourceAlias: string;
}

interface Provider {
  uuid: string;
  display: string;
  links: ProviderLink[];
}

export interface LineItem {
  uuid: string;
  display: string;
  voided: boolean;
  voidReason: string | null;
  item: string;
  billableService: string;
  quantity: number;
  price: number;
  priceName: string;
  priceUuid: string;
  lineItemOrder: number;
  resourceVersion: string;
  paymentStatus: string;
}

interface PatientLink {
  rel: string;
  uri: string;
  resourceAlias: string;
}

interface Patient {
  uuid: string;
  display: string;
  links: PatientLink[];
}

interface AttributeType {
  uuid: string;
  name: string;
  description: string;
  retired: boolean;
  attributeOrder: number;
  format: string;
  foreignKey: string | null;
  regExp: string | null;
  required: boolean;
}

interface Attribute {
  uuid: string;
  display: string;
  voided: boolean;
  voidReason: string | null;
  value: string;
  attributeType: AttributeType;
  order: number;
  valueName: string;
  resourceVersion: string;
}

interface PaymentInstanceType {
  uuid: string;
  name: string;
  description: string;
  retired: boolean;
}

export interface Payment {
  uuid: string;
  instanceType: PaymentInstanceType;
  attributes: Attribute[];
  amount: number;
  amountTendered: number;
  dateCreated: number;
  voided: boolean;
  resourceVersion: string;
}

export interface PatientInvoice {
  uuid: string;
  display: string;
  voided: boolean;
  voidReason: string | null;
  adjustedBy: any[];
  billAdjusted: any;
  cashPoint: CashPoint;
  cashier: Provider;
  dateCreated: string;
  lineItems: LineItem[];
  patient: Patient;
  payments: Payment[];
  receiptNumber: string;
  status: string;
  adjustmentReason: any;
  id: number;
  resourceVersion: string;
}

export interface PatientDetails {
  name: string;
  age: string;
  gender: string;
  city: string;
  county: string;
  subCounty: string;
}

export interface FacilityDetail {
  uuid: string;
  display: string;
}

export type ServiceConcept = {
  concept: {
    uuid: string;
    display: string;
  };
  conceptName: {
    uuid: string;
    display: string;
  };
  display: string;
};

export type BillingService = {
  name: string;
  servicePrices: Array<{ name: string; paymentMode: { uuid: string; name: string }; price: number; uuid: string }>;
  serviceStatus: string;
  serviceType: { display: string };
  shortName: string;
  uuid: string;
};

export interface DrugOrderBasketItem extends OrderBasketItem {
  drug: Drug;
  unit: DosingUnit;
  commonMedicationName: string;
  dosage: number;
  frequency: MedicationFrequency;
  route: MedicationRoute;
  quantityUnits: QuantityUnit;
  patientInstructions: string;
  asNeeded: boolean;
  asNeededCondition: string;
  // TODO: This is unused
  startDate: Date | string;
  durationUnit: DurationUnit;
  duration: number | null;
  pillsDispensed: number;
  numRefills: number;
  indication: string;
  isFreeTextDosage: boolean;
  freeTextDosage: string;
  previousOrder?: string;
  template?: OrderTemplate;
}

export interface DrugOrderTemplate {
  uuid: string;
  name: string;
  drug: Drug;
  template: OrderTemplate;
}

export interface OrderTemplate {
  type: string;
  dosingType: string;
  dosingInstructions: DosingInstructions;
}

export interface DosingInstructions {
  dose: Array<MedicationDosage>;
  units: Array<DosingUnit>;
  route: Array<MedicationRoute>;
  frequency: Array<MedicationFrequency>;
  instructions?: Array<MedicationInstructions>;
  durationUnits?: Array<DurationUnit>;
  quantityUnits?: Array<QuantityUnit>;
  asNeeded?: boolean;
  asNeededCondition?: string;
}

export interface MedicationDosage extends Omit<CommonMedicationProps, 'value'> {
  value: number;
}

export type MedicationFrequency = CommonMedicationValueCoded;

export type MedicationRoute = CommonMedicationValueCoded;

export type MedicationInstructions = CommonMedicationProps;

export type DosingUnit = CommonMedicationValueCoded;

export type QuantityUnit = CommonMedicationValueCoded;

export type DurationUnit = CommonMedicationValueCoded;

interface CommonMedicationProps {
  value: string;
  default?: boolean;
}

export interface CommonMedicationValueCoded extends CommonMedicationProps {
  valueCoded: string;
}
