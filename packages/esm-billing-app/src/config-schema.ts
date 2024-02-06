import { Type } from '@openmrs/esm-framework';

export interface BillingConfig {
  paymentDetails: string;
  paymentMethods: string;
  insuranceScheme: string;
  policyNumber: string;
  patientCategory: string;
  billPaymentStatus: string;
}

export const configSchema = {
  paymentDetails: {
    type: Type.String,
    default: '3b9dfac8-9e4d-11ee-8c90-0242ac120002',
  },
  paymentMethods: {
    type: Type.String,
    default: 'e6cb0c3b-04b0-4117-9bc6-ce24adbda802',
  },
  insuranceScheme: {
    type: Type.String,
    default: '2d0fa959-6780-41f1-85b1-402045935068',
  },
  policyNumber: {
    type: Type.String,
    default: '0f4f3306-f01b-43c6-af5b-fdb60015cb02',
  },
  patientCategory: {
    type: Type.String,
    default: 'df0362f9-782e-4d92-8bb2-3112e9e9eb3c',
  },
  billPaymentStatus: {
    type: Type.String,
    default: '919b51c9-8e2e-468f-8354-181bf3e55786',
  },
};
