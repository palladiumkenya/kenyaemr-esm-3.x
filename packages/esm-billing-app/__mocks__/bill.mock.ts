import { MappedBill } from '../src/types';

export const mockBillData: Array<MappedBill> = [
  {
    id: 1,
    uuid: 'test-uuid-1',
    patientName: 'John Doe',
    identifier: 'TEST123',
    patientUuid: 'patient-uuid-1',
    status: 'PENDING',
    receiptNumber: '1000-1',
    cashier: {
      uuid: 'cashier-uuid-1',
      display: 'Test Cashier',
      links: [],
    },
    cashPointUuid: 'cashpoint-uuid-1',
    cashPointName: 'Test Cash Point',
    cashPointLocation: 'Test Hospital',
    dateCreated: 'Today, 12:00',
    dateCreatedUnformatted: '2024-01-01T12:00:00.000+0300',
    lineItems: [
      {
        uuid: 'lineitem-uuid-1',
        display: 'BillLineItem',
        voided: false,
        voidReason: null,
        item: 'TEST SERVICE',
        priceName: 'TEST PRICE',
        priceUuid: 'price-uuid-1',
        lineItemOrder: 1,
        billableService: 'service-uuid-1:TEST SERVICE',
        quantity: 1,
        price: 100,
        paymentStatus: 'PENDING',
        itemOrServiceConceptUuid: 'concept-uuid-1',
        serviceTypeUuid: 'servicetype-uuid-1',
        order: {
          uuid: 'order-uuid-1',
          display: 'TEST SERVICE',
          links: [],
          type: 'testorder',
        },
        resourceVersion: '1.0',
      },
    ],
    billingService: 'TEST',
    payments: [],
    display: '1000-1',
    totalAmount: 100,
    tenderedAmount: 0,
    referenceCodes: '',
    adjustmentReason: 'Test adjustment reason',
  },
];

export const mockInitialServicePrice = {
  uuid: 'price-uuid-1',
  name: 'TEST PRICE',
  paymentMode: {
    uuid: 'payment-mode-uuid-1',
    name: 'Cash',
    description: 'Cash Payment',
    retired: false,
    retireReason: null,
    attributeTypes: [],
    sortOrder: null,
    resourceVersion: '1.8',
  },
  price: 100,
};

export const mockCurrentBillableService = {
  uuid: 'service-uuid-1',
  name: 'TEST SERVICE',
  shortName: 'TEST SERVICE',
  serviceStatus: 'ENABLED',
  serviceType: {
    uuid: 'servicetype-uuid-1',
    display: 'Test Service',
  },
  servicePrices: [
    {
      uuid: 'price-uuid-1',
      name: 'TEST PRICE',
      paymentMode: {
        uuid: 'payment-mode-uuid-1',
        name: 'Cash',
        description: 'Cash Payment',
        retired: false,
        retireReason: null,
        attributeTypes: [],
        sortOrder: null,
        resourceVersion: '1.8',
      },
      price: 100,
    },
  ],
  concept: {
    uuid: 'concept-uuid-1',
    display: 'TEST SERVICE',
  },
};
