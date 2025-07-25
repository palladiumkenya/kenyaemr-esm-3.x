import { ConfigSchema, Type } from '@openmrs/esm-framework';

export interface BillingConfig {
  visitAttributeTypes: {
    isPatientExempted: string;
    paymentMethods: string;
    insuranceScheme: string;
    policyNumber: string;
    exemptionCategory: string;
    billPaymentStatus: string;
    shaBenefitPackagesAndInterventions: string;
  };
  insurancePaymentMethod: string;
  inPatientVisitTypeUuid: string;
  patientExemptionCategories: Array<{ value: string; label: string }>;
  excludedPaymentMode: Array<{ uuid: string; label: string }>;
  enforceBillPayment: boolean;
  billingStatusQueryUrl: string;
  mpesaAPIBaseUrl: string;
  hieBaseUrl: string;
  insuranceSchemes: Array<string>;
  shaIdentificationNumberUUID: string;
  cashPointUuid: string;
  cashierUuid: string;
  patientBillsUrl: string;
  nationalIdUUID: string;
  isPDSLFacility: boolean;
  mobileMoneyPaymentModeUUID: string;
  concepts: {
    emergencyPriorityConceptUuid: string;
  };
  paymentMethodsUuidsThatShouldNotShowPrompt: Array<string>;
  promptDuration: {
    enable: boolean;
    duration: number;
  };
  localeCurrencyMapping: Record<string, string>;
}

export const configSchema: ConfigSchema = {
  isPDSLFacility: {
    _type: Type.Boolean,
    _description: 'A flag for PDSL facilities',
    _default: false,
  },
  mobileMoneyPaymentModeUUID: {
    _type: Type.UUID,
    _description: 'Mobile money payment method uuid',
    _default: '28989582-e8c3-46b0-96d0-c249cb06d5c6',
  },
  shaIdentificationNumberUUID: {
    _type: Type.String,
    _description: 'Social Health Authority Identification Number',
    _default: '24aedd37-b5be-4e08-8311-3721b8d5100d',
  },
  nationalIdUUID: {
    _type: Type.String,
    _description: 'National Identification Number',
    _default: '49af6cdc-7968-4abb-bf46-de10d7f4859f',
  },
  inPatientVisitTypeUuid: {
    _type: Type.String,
    _description: 'The visit type uuid for in-patient',
    _default: 'a73e2ac6-263b-47fc-99fc-e0f2c09fc914',
  },
  mpesaAPIBaseUrl: {
    _type: Type.String,
    _description: 'The base url that will be used to make any backend calls related to mpesa.',
    _default: 'https://billing.kenyahmis.org',
  },
  hieBaseUrl: {
    _type: Type.String,
    _description: 'HIE Base URL for getting interventions and benefit packages',
    _default: 'https://payers.apeiro-digital.com/api/v1',
  },
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
    shaBenefitPackagesAndInterventions: {
      _type: Type.String,
      _description: 'JSON String of SHA Benefit Packages and Interventions for this visit',
      _default: '338725fa-3790-4679-98b9-be623214ee29',
    },
  },
  insurancePaymentMethod: {
    _type: Type.String,
    _description: 'Insurance Payment method UUID',
    _default: 'beac329b-f1dc-4a33-9e7c-d95821a137a6',
  },
  patientExemptionCategories: {
    _type: Type.Array,
    _elements: {
      value: {
        _type: Type.String,
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
    _default: [
      {
        uuid: 'eb6173cb-9678-4614-bbe1-0ccf7ed9d1d4',
        label: 'Waiver',
      },
    ],
  },
  enforceBillPayment: {
    _type: Type.Boolean,
    _default: true,
    _description: 'Whether to enforce bill payment or not for patient to receive service',
  },
  billingStatusQueryUrl: {
    _type: Type.String,
    _default: '${restBaseUrl}/cashier/billLineItem?orderUuid=${orderUuid}&v=full',
    _description: 'URL to query billing status',
  },
  insuranceSchemes: {
    _type: Type.Array,
    _elements: {
      _type: Type.String,
    },
    _default: ['SHA', 'Jubilee Insurance', 'AAR Insurance', 'Old Mutual Insurance'],
    _description: 'List of insurance schemes',
  },
  cashPointUuid: {
    _type: Type.String,
    _description: 'Where bill is generated from',
    _default: '54065383-b4d4-42d2-af4d-d250a1fd2590',
  },
  cashierUuid: {
    _type: Type.String,
    _description: 'Who Generated the bill',
    _default: '54065383-b4d4-42d2-af4d-d250a1fd2590',
  },
  patientBillsUrl: {
    _type: Type.String,
    _description: 'The url to fetch patient bills',
    _default:
      '${restBaseUrl}/cashier/bill?v=custom:(uuid,display,voided,voidReason,adjustedBy,cashPoint:(uuid,name),cashier:(uuid,display),dateCreated,lineItems,patient:(uuid,display))',
  },
  concepts: {
    emergencyPriorityConceptUuid: {
      _type: Type.String,
      _description: 'The concept uuid for emergency priority',
      _default: '037446f4-adfc-40b3-928c-a39a4826b1bf',
    },
  },
  paymentMethodsUuidsThatShouldNotShowPrompt: {
    _type: Type.Array,
    _description: 'The payment methods that should not show the billing prompt',
    _elements: {
      _type: Type.String,
    },
    _default: ['beac329b-f1dc-4a33-9e7c-d95821a137a6'],
  },
  promptDuration: {
    _type: Type.Object,
    _description:
      'The duration in hours for the prompt to be shown, if the duration is less than this, the prompt will be shown',
    _default: {
      enable: true,
      duration: 24,
    },
  },
  localeCurrencyMapping: {
    _type: Type.Object,
    _description: 'Mapping of locale codes to currency codes for internationalization',
    _default: {
      en: 'KES',
      sw: 'KES',
      am: 'ETB',
      'en-KE': 'KES',
      'sw-KE': 'KES',
      'am-ET': 'ETB',
    },
  },
};
