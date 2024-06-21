import { renderHook } from '@testing-library/react';
import * as testResultActionResource from './test-order-action.resource';
import useSWR from 'swr';
import { useConfig, useVisit } from '@openmrs/esm-framework';
import { mockCurrentVisit } from '../../../../__mocks__/visit.mock';

const mockedUseVisit = useVisit as jest.MockedFunction<typeof useVisit>;
const mockedUseConfig = useConfig as jest.MockedFunction<typeof useConfig>;

const mockedBillResult = [
  {
    uuid: 'ec60bf1f-a7ba-4ca2-a31e-9914a531117b',
    display: 'BillLineItem',
    voided: false,
    voidReason: null,
    auditInfo: {
      creator: {
        uuid: '3473e65d-3ddc-11e2-8b67-0800271ad0ce',
        display: 'admin',
        links: [],
      },
      dateCreated: '2024-06-13T15:33:26.000+0300',
      changedBy: null,
      dateChanged: null,
    },
    item: '',
    billableService: 'ac3ccc83-83d4-4dff-ab35-1077e3edc61b:Brucella Test',
    quantity: 1,
    price: 300,
    priceName: '',
    priceUuid: '',
    lineItemOrder: 0,
    paymentStatus: 'PENDING',
    order: {
      uuid: 'e06159a1-65f3-45d9-9f57-8578f6c85dee',
      display: 'BRUCELLA TEST',
      links: [],
      type: 'testorder',
    },
    resourceVersion: '1.8',
  },
];

const mockedPatientQueue = [
  {
    visit: {
      uuid: 'ae548a0f-cfd0-47e0-9103-c01e96492be1',
      display: 'Outpatient @ Ngarua Health Centre - 12/06/2024 15:13',
      links: [
        {
          rel: 'self',
          uri: 'http://ba.kenyahmis.org/openmrs/ws/rest/v1/visit/ae548a0f-cfd0-47e0-9103-c01e96492be1',
          resourceAlias: 'visit',
        },
      ],
    },
    queueEntry: {
      uuid: '45d729c7-9bd9-474a-8532-cbfb809c6139',
      display: 'Baby J Em',
      queue: {
        uuid: 'b47f1e37-9531-467e-ba85-74acbd0c462c',
        display: 'Triage service',
        name: 'Triage service',
        description: 'Triage service',
        links: [],
      },
      status: {
        uuid: '167407AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        display: 'Waiting',
        links: [],
      },
      patient: {
        uuid: '7b7342a9-67c9-4ecc-a37f-ce62560b503b',
        display: 'MGKDH7 - Baby J Em',
        links: [],
      },
      visit: {
        uuid: 'ae548a0f-cfd0-47e0-9103-c01e96492be1',
        display: 'Outpatient @ Ngarua Health Centre - 12/06/2024 15:13',
        links: [],
      },
      priority: {
        uuid: '80cd8f8c-5d82-4cdc-b96e-a6addeb94b7f',
        display: 'Not Urgent',
        links: [],
      },
      priorityComment: null,
      sortWeight: 0,
      startedAt: '2024-06-12T15:14:00.000+0300',
      endedAt: null,
      locationWaitingFor: null,
      queueComingFrom: null,
      providerWaitingFor: null,
      links: [],
    },
  },
];

const mockSWR = useSWR as jest.Mock;

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  restBaseUrl: '/ws/rest/v1',
  useConfig: jest.fn(),
  useVisit: jest.fn(),
}));

jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('./test-order-action.resource', () => ({
  ...jest.requireActual('./test-order-action.resource'),
  usePatientQueue: jest.fn(),
  usePatientBill: jest.fn(),
}));

test('should return isLoading as true when isLoadingQueue is true', () => {
  mockedUseConfig.mockReturnValue({
    inPatientVisitTypeUuid: '3371a4d4-f66f-4454-a86d-92c7b3da990c',
    billingStatusQueryUrl: `/ws/rest/v1/cashier/billLineItem?orderUuid={{orderUuid}}&v=full`,
  });
  mockedUseVisit.mockReturnValue({
    currentVisit: mockCurrentVisit,
    isLoading: false,
    isValidating: false,
    activeVisit: mockCurrentVisit,
  } as unknown as any);
  mockSWR.mockImplementation((url) => {
    if (url.includes('visit-queue-entry')) {
      return { data: { data: { results: mockedPatientQueue } }, isLoading: true, error: null } as any;
    }
    if (url.includes('cashier/billLineItem')) {
      return { data: { data: { results: mockedBillResult } }, isLoading: true, error: null } as any;
    }
  });
  const { result } = renderHook(() => testResultActionResource.useTestOrderBillStatus('orderUuid', 'patientUuid'));
  expect(result.current.isLoading).toBe(true);
});

test('should return `hasPendingPayment` as false when current visit type is inpatient', () => {
  mockedUseConfig.mockReturnValue({
    inPatientVisitTypeUuid: '3371a4d4-f66f-4454-a86d-92c7b3da990c',
    billingStatusQueryUrl: `/ws/rest/v1/cashier/billLineItem?orderUuid={{orderUuid}}&v=full`,
  });
  mockedUseVisit.mockReturnValue({
    currentVisit: { mockCurrentVisit, visitType: { uuid: '3371a4d4-f66f-4454-a86d-92c7b3da990c' } },
    isLoading: false,
    isValidating: false,
    activeVisit: mockCurrentVisit,
  } as unknown as any);
  mockSWR.mockImplementation((url) => {
    if (url.includes('visit-queue-entry')) {
      return { data: { data: { results: mockedPatientQueue } }, isLoading: false, error: null } as any;
    }
    if (url.includes('cashier/billLineItem')) {
      return { data: { data: { results: mockedBillResult } }, isLoading: false, error: null } as any;
    }
  });
  const { result } = renderHook(() => testResultActionResource.useTestOrderBillStatus('orderUuid', 'patientUuid'));
  expect(result.current.hasPendingPayment).toBe(false);
});

test('should return `hasPendingPayment` as false when patient is an emergency case', () => {
  mockedUseConfig.mockReturnValue({
    concepts: { emergencyPriorityConceptUuid: '80cd8f8c-5d82-4cdc-b96e-a6addeb94b7f' },
    billingStatusQueryUrl: `/ws/rest/v1/cashier/billLineItem?orderUuid={{orderUuid}}&v=full`,
  });
  mockedUseVisit.mockReturnValue({
    currentVisit: { mockCurrentVisit, visitType: { uuid: '3371a4d4-f66f-4454-a86d-92c7b3da990c' } },
    isLoading: false,
    isValidating: false,
    activeVisit: mockCurrentVisit,
  } as unknown as any);
  mockSWR.mockImplementation((url) => {
    if (url.includes('visit-queue-entry')) {
      return { data: { data: { results: mockedPatientQueue } }, isLoading: false, error: null } as any;
    }
    if (url.includes('cashier/billLineItem')) {
      return { data: { data: { results: mockedBillResult } }, isLoading: false, error: null } as any;
    }
  });
  const { result } = renderHook(() => testResultActionResource.useTestOrderBillStatus('orderUuid', 'patientUuid'));
  expect(result.current.hasPendingPayment).toBe(false);
});

test('should return `hasPendingPayment` as false when patient has completed payments', () => {
  mockedUseConfig.mockReturnValue({
    concepts: { emergencyPriorityConceptUuid: '180cd8f8c-5d82-4cdc-b96e-a6addeb94b7f' },
    billingStatusQueryUrl: `/ws/rest/v1/cashier/billLineItem?orderUuid={{orderUuid}}&v=full`,
  });
  mockedUseVisit.mockReturnValue({
    currentVisit: { mockCurrentVisit, visitType: { uuid: '13371a4d4-f66f-4454-a86d-92c7b3da990c' } },
    isLoading: false,
    isValidating: false,
    activeVisit: mockCurrentVisit,
  } as unknown as any);
  mockSWR.mockImplementation((url) => {
    if (url.includes('visit-queue-entry')) {
      return { data: { data: { results: mockedPatientQueue } }, isLoading: false, error: null } as any;
    }
    if (url.includes('cashier/billLineItem')) {
      return {
        data: { data: { results: [{ ...mockedBillResult, paymentStatus: 'PAID' }] } },
        isLoading: false,
        error: null,
      } as any;
    }
  });
  const { result } = renderHook(() => testResultActionResource.useTestOrderBillStatus('orderUuid', 'patientUuid'));
  expect(result.current.hasPendingPayment).toBe(false);
});

test('should return `hasPendingPayment` as true when patient has done partial payments', () => {
  mockedUseConfig.mockReturnValue({
    concepts: { emergencyPriorityConceptUuid: '180cd8f8c-5d82-4cdc-b96e-a6addeb94b7f' },
    billingStatusQueryUrl: `/ws/rest/v1/cashier/billLineItem?orderUuid={{orderUuid}}&v=full`,
  });
  mockedUseVisit.mockReturnValue({
    currentVisit: { mockCurrentVisit, visitType: { uuid: '13371a4d4-f66f-4454-a86d-92c7b3da990c' } },
    isLoading: false,
    isValidating: false,
    activeVisit: mockCurrentVisit,
  } as unknown as any);
  mockSWR.mockImplementation((url) => {
    if (url.includes('visit-queue-entry')) {
      return { data: { data: { results: mockedPatientQueue } }, isLoading: false, error: null } as any;
    }
    if (url.includes('cashier/billLineItem')) {
      return {
        data: { data: { results: [{ ...mockedBillResult, paymentStatus: 'POSTED' }] } },
        isLoading: false,
        error: null,
      } as any;
    }
  });
  const { result } = renderHook(() => testResultActionResource.useTestOrderBillStatus('orderUuid', 'patientUuid'));
  expect(result.current.hasPendingPayment).toBe(true);
});

test('should return `hasPendingPayment` as true when patient has unsettled payments', () => {
  mockedUseConfig.mockReturnValue({
    concepts: { emergencyPriorityConceptUuid: '180cd8f8c-5d82-4cdc-b96e-a6addeb94b7f' },
    billingStatusQueryUrl: `/ws/rest/v1/cashier/billLineItem?orderUuid={{orderUuid}}&v=full`,
  });
  mockedUseVisit.mockReturnValue({
    currentVisit: { mockCurrentVisit, visitType: { uuid: '13371a4d4-f66f-4454-a86d-92c7b3da990c' } },
    isLoading: false,
    isValidating: false,
    activeVisit: mockCurrentVisit,
  } as unknown as any);
  mockSWR.mockImplementation((url) => {
    if (url.includes('visit-queue-entry')) {
      return { data: { data: { results: mockedPatientQueue } }, isLoading: false, error: null } as any;
    }
    if (url.includes('cashier/billLineItem')) {
      return {
        data: { data: { results: [{ ...mockedBillResult, paymentStatus: 'PENDING' }] } },
        isLoading: false,
        error: null,
      } as any;
    }
  });
  const { result } = renderHook(() => testResultActionResource.useTestOrderBillStatus('orderUuid', 'patientUuid'));
  expect(result.current.hasPendingPayment).toBe(true);
});
