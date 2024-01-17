export const billsSummary = [
  {
    uuid: '65f9f19a-f70e-44f4-9c6c-55b23dab4a3f',
    display: 'CP2-0011-0',
    voided: false,
    voidReason: null,
    adjustedBy: [],
    billAdjusted: null,
    cashPoint: {
      uuid: '381595a0-2229-4152-9c45-bd3692aac7cc',
      name: 'Pharmacy Cashier',
      description: '',
      retired: false,
      location: {
        uuid: '381595a0-2229-4152-9c45-bd3692aac7cc',
        display: 'Amani Family Medical Clinic',
        links: [
          {
            rel: 'self',
            uri: 'http://localhost:8089/openmrs/ws/rest/v1/location/381595a0-2229-4152-9c45-bd3692aac7cc',
            resourceAlias: 'location',
          },
        ],
      },
    },
    cashier: {
      uuid: '48b55692-e061-4ffa-b1f2-fd4aaf506224',
      display: 'admin - ayunda ayunda ayunda',
      links: [
        {
          rel: 'self',
          uri: 'http://localhost:8089/openmrs/ws/rest/v1/provider/48b55692-e061-4ffa-b1f2-fd4aaf506224',
          resourceAlias: 'provider',
        },
      ],
    },
    dateCreated: '2023-11-29T09:35:20.000+0300',
    lineItems: [
      {
        uuid: '6ff72ef2-4265-4fdb-8563-a3a2eefa484e',
        display: 'BillLineItem',
        billableService: null,
        voided: false,
        voidReason: null,
        item: 'HIV self-test kit',
        quantity: 1,
        price: 500.0,
        priceName: '',
        priceUuid: '',
        lineItemOrder: 0,
        resourceVersion: '1.8',
      },
    ],
    patient: {
      uuid: 'dda9b65f-0037-11ec-85e7-04ed33c79a3e',
      display: 'MGFRYY - WACERA WACERA WACERA',
      links: [
        {
          rel: 'self',
          uri: 'http://localhost:8089/openmrs/ws/rest/v1/patient/dda9b65f-0037-11ec-85e7-04ed33c79a3e',
          resourceAlias: 'patient',
        },
      ],
    },
    payments: [
      {
        uuid: '0ddfed3b-f606-4b3f-bf8a-bcc14a40d21d',
        instanceType: {
          uuid: '8d8718c2-c2cc-11de-8d13-0010c6dffd0f',
          name: 'Mpesa',
          description: 'Mpesa',
          retired: false,
        },
        attributes: [
          {
            uuid: '84aacfcc-9788-4f7b-a56a-407d84af1b54',
            display: 'Mpesa Code: MPESA001',
            voided: false,
            voidReason: null,
            value: 'MPESA001',
            attributeType: {
              uuid: '8d8718c2-c2cc-11de-8d13-0010c6dffd0f',
              name: 'Mpesa Code',
              description: 'Mpesa Code',
              retired: false,
              attributeOrder: 1,
              format: 'java.lang.String',
              foreignKey: null,
              regExp: null,
              required: false,
            },
            order: 1,
            valueName: 'MPESA001',
            resourceVersion: '1.8',
          },
        ],
        amount: 1000.0,
        amountTendered: 0,
        dateCreated: 1701239720000,
        voided: false,
        resourceVersion: '1.8',
      },
    ],
    receiptNumber: 'CP2-0011-0',
    status: 'PENDING',
    adjustmentReason: null,
    id: 30,
    resourceVersion: '1.8',
  },
  {
    uuid: '65f9f19a-f70e-44f4-9c6c-55b23dab4a3f',
    display: 'CP2-0011-0',
    voided: false,
    voidReason: null,
    adjustedBy: [],
    billAdjusted: null,
    cashPoint: {
      uuid: '381595a0-2229-4152-9c45-bd3692aac7cc',
      name: 'Pharmacy Cashier',
      description: '',
      retired: false,
      location: {
        uuid: '381595a0-2229-4152-9c45-bd3692aac7cc',
        display: 'Amani Family Medical Clinic',
        links: [
          {
            rel: 'self',
            uri: 'http://localhost:8089/openmrs/ws/rest/v1/location/381595a0-2229-4152-9c45-bd3692aac7cc',
            resourceAlias: 'location',
          },
        ],
      },
    },
    cashier: {
      uuid: '48b55692-e061-4ffa-b1f2-fd4aaf506224',
      display: 'admin - ayunda ayunda ayunda',
      links: [
        {
          rel: 'self',
          uri: 'http://localhost:8089/openmrs/ws/rest/v1/provider/48b55692-e061-4ffa-b1f2-fd4aaf506224',
          resourceAlias: 'provider',
        },
      ],
    },
    dateCreated: '2023-11-29T09:35:20.000+0300',
    lineItems: [
      {
        uuid: '6ff72ef2-4265-4fdb-8563-a3a2eefa484e',
        display: 'BillLineItem',
        billableService: null,
        voided: false,
        voidReason: null,
        item: 'HIV self-test kit',
        quantity: 1,
        price: 500.0,
        priceName: '',
        priceUuid: '',
        lineItemOrder: 0,
        resourceVersion: '1.8',
      },
    ],
    patient: {
      uuid: 'dda9b65f-0037-11ec-85e7-04ed33c79a3e',
      display: 'MGFRYY - WACERA WACERA WACERA',
      links: [
        {
          rel: 'self',
          uri: 'http://localhost:8089/openmrs/ws/rest/v1/patient/dda9b65f-0037-11ec-85e7-04ed33c79a3e',
          resourceAlias: 'patient',
        },
      ],
    },
    payments: [
      {
        uuid: '0ddfed3b-f606-4b3f-bf8a-bcc14a40d21d',
        instanceType: {
          uuid: '8d8718c2-c2cc-11de-8d13-0010c6dffd0f',
          name: 'Mpesa',
          description: 'Mpesa',
          retired: false,
        },

        attributes: [
          {
            uuid: '84aacfcc-9788-4f7b-a56a-407d84af1b54',
            display: 'Mpesa Code: MPESA001',
            voided: false,
            voidReason: null,
            value: 'MPESA001',
            attributeType: {
              uuid: '8d8718c2-c2cc-11de-8d13-0010c6dffd0f',
              name: 'Mpesa Code',
              description: 'Mpesa Code',
              retired: false,
              attributeOrder: 1,
              format: 'java.lang.String',
              foreignKey: null,
              regExp: null,
              required: false,
            },
            order: 1,
            valueName: 'MPESA001',
            resourceVersion: '1.8',
          },
        ],
        amount: 1000.0,
        amountTendered: 1000.0,
        dateCreated: 1701239720000,
        voided: false,
        resourceVersion: '1.8',
      },
    ],
    receiptNumber: 'CP2-0011-0',
    status: 'PENDING',
    adjustmentReason: null,
    id: 30,
    resourceVersion: '1.8',
  },
  {
    uuid: '65f9f19a-f70e-44f4-9c6c-55b23dab4a3f',
    display: 'CP2-0011-0',
    voided: false,
    voidReason: null,
    adjustedBy: [],
    billAdjusted: null,
    cashPoint: {
      uuid: '381595a0-2229-4152-9c45-bd3692aac7cc',
      name: 'Pharmacy Cashier',
      description: '',
      retired: false,
      location: {
        uuid: '381595a0-2229-4152-9c45-bd3692aac7cc',
        display: 'Amani Family Medical Clinic',
        links: [
          {
            rel: 'self',
            uri: 'http://localhost:8089/openmrs/ws/rest/v1/location/381595a0-2229-4152-9c45-bd3692aac7cc',
            resourceAlias: 'location',
          },
        ],
      },
    },
    cashier: {
      uuid: '48b55692-e061-4ffa-b1f2-fd4aaf506224',
      display: 'admin - ayunda ayunda ayunda',
      links: [
        {
          rel: 'self',
          uri: 'http://localhost:8089/openmrs/ws/rest/v1/provider/48b55692-e061-4ffa-b1f2-fd4aaf506224',
          resourceAlias: 'provider',
        },
      ],
    },
    dateCreated: '2023-11-29T09:35:20.000+0300',
    lineItems: [
      {
        uuid: '6ff72ef2-4265-4fdb-8563-a3a2eefa484e',
        display: 'BillLineItem',
        billableService: null,
        voided: false,
        voidReason: null,
        item: 'HIV self-test kit',
        quantity: 1,
        price: 500.0,
        priceName: '',
        priceUuid: '',
        lineItemOrder: 0,
        resourceVersion: '1.8',
      },
    ],
    patient: {
      uuid: 'dda9b65f-0037-11ec-85e7-04ed33c79a3e',
      display: 'MGFRYY - WACERA WACERA WACERA',
      links: [
        {
          rel: 'self',
          uri: 'http://localhost:8089/openmrs/ws/rest/v1/patient/dda9b65f-0037-11ec-85e7-04ed33c79a3e',
          resourceAlias: 'patient',
        },
      ],
    },
    payments: [
      {
        uuid: '0ddfed3b-f606-4b3f-bf8a-bcc14a40d21d',
        instanceType: {
          uuid: '8d8718c2-c2cc-11de-8d13-0010c6dffd0f',
          name: 'Mpesa',
          description: 'Mpesa',
          retired: false,
        },

        attributes: [
          {
            uuid: '84aacfcc-9788-4f7b-a56a-407d84af1b54',
            display: 'Mpesa Code: MPESA001',
            voided: false,
            voidReason: null,
            value: 'MPESA001',
            attributeType: {
              uuid: '8d8718c2-c2cc-11de-8d13-0010c6dffd0f',
              name: 'Mpesa Code',
              description: 'Mpesa Code',
              retired: false,
              attributeOrder: 1,
              format: 'java.lang.String',
              foreignKey: null,
              regExp: null,
              required: false,
            },
            order: 1,
            valueName: 'MPESA001',
            resourceVersion: '1.8',
          },
        ],
        amount: 1000.0,
        amountTendered: 1000.0,
        dateCreated: 1701239720000,
        voided: false,
        resourceVersion: '1.8',
      },
    ],
    receiptNumber: 'CP2-0011-0',
    status: 'PAID',
    adjustmentReason: null,
    id: 30,
    resourceVersion: '1.8',
  },
];

export const mockBill = {
  id: 26,
  uuid: '6eb8d678-514d-46ad-9554-51e48d96d567',
  patientName: 'James Bond',
  identifier: 'PJYM9 ',
  patientUuid: 'b2fcf02b-7ee3-4d16-a48f-576be2b103aa',
  status: 'PENDING',
  receiptNumber: '0035-6',
  cashier: {
    uuid: 'fe00dd43-4c39-4ce9-9832-bc3620c80c6c',
    display: 'admin - Bildard SONGOI Olero',
    links: [
      {
        rel: 'self',
        uri: 'https://data.kenyahmis.org:8500/openmrs/ws/rest/v1/provider/fe00dd43-4c39-4ce9-9832-bc3620c80c6c',
        resourceAlias: 'provider',
      },
    ],
  },
  cashPointUuid: '54065383-b4d4-42d2-af4d-d250a1fd2590',
  cashPointName: 'Cashier 2',
  cashPointLocation: 'Moi Teaching Refferal Hospital',
  dateCreated: '15 — Dec — 2023',
  lineItems: [
    {
      uuid: '053ab483-79de-43f9-a73b-5823ccd8518b',
      display: 'BillLineItem',
      billableService: null,
      voided: false,
      voidReason: null,
      item: 'Hemoglobin',
      quantity: 1,
      price: 100,
      priceName: '',
      priceUuid: '',
      lineItemOrder: 0,
      paymentStatus: 'PENDING',
      resourceVersion: '1.8',
    },
  ],
  billingService: 'Hemoglobin',
  payments: [],
  totalAmount: 100,
  tenderedAmount: 0,
};

export const mockPayments = [
  {
    uuid: 'db0744e5-033d-4162-9c41-f34cb97de1f7',
    instanceType: {
      uuid: '63eff7a4-6f82-43c4-a333-dbcc58fe9f74',
      name: 'Cash',
      description: 'Cash Payment',
      retired: false,
    },
    attributes: [],
    amount: 500,
    amountTendered: 500,
    dateCreated: 1702646939000,
    voided: false,
    resourceVersion: '1.8',
  },
];
