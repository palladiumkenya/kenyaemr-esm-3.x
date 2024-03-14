import { Type } from '@openmrs/esm-framework';

export interface BillingConfig {
  visitAttributeTypes: {
    isPatientExempted: string;
    paymentMethods: string;
    insuranceScheme: string;
    policyNumber: string;
    exemptionCategory: string;
    billPaymentStatus: string;
  };
  patientExemptionCategories: Array<{ value: string; label: string }>;
  excludedPaymentMode: Array<{ uuid: string; label: string }>;
  enforceBillPayment: boolean;
}

export const configSchema = {
  visitAttributeTypes: {
    isPatientExempted: {
      _type: Type.String,
      _default: '3b9dfac8-9e4d-11ee-8c90-0242ac120002',
      _description: 'Whether the patient should be exempted from paying for service i.e Prisoners',
    },
    paymentMethods: {
      _type: Type.String,
      _description: 'The payment methods visit attribute uuid',
      _default: 'e6cb0c3b-04b0-4117-9bc6-ce24adbda802',
    },
    insuranceScheme: {
      _type: Type.String,
      _description: 'The insurance scheme visit attribute uuid',
      _default: '2d0fa959-6780-41f1-85b1-402045935068',
    },
    policyNumber: {
      _type: Type.String,
      _description: 'The policy number visit attribute uuid',
      _default: '0f4f3306-f01b-43c6-af5b-fdb60015cb02',
    },
    exemptionCategory: {
      _type: Type.String,
      _description: 'The exemption category visit attribute uuid',
      _default: 'df0362f9-782e-4d92-8bb2-3112e9e9eb3c',
    },
    billPaymentStatus: {
      _type: Type.String,
      _description: 'The bill payment status visit attribute uuid',
      _default: '919b51c9-8e2e-468f-8354-181bf3e55786',
    },
  },
  patientExemptionCategories: {
    _type: Type.Array,
    _elements: {
      value: {
        _type: Type.UUID,
        _description: 'The value of the exemption category',
      },
      label: {
        _type: Type.String,
        _default: null,
        _description: 'The label of the exemption category',
      },
    },
    _default: [{ value: 'IN_PRISON', label: 'In Prison' }],
  },
  excludedPaymentMode: {
    _type: Type.Array,
    _elements: {
      uuid: {
        _type: Type.UUID,
        _description: 'The value of the payment mode to be excluded',
      },
      label: {
        _type: Type.String,
        _default: null,
        _description: 'The label of the payment mode to be excluded',
      },
    },
    _default: [],
  },
  enforceBillPayment: {
    _type: Type.Boolean,
    _default: true,
    _description: 'Whether to enforce bill payment or not for patient to receive service',
  },
};
