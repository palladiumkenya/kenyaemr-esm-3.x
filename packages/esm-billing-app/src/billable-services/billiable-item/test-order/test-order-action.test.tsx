import React from 'react';
import { screen, render, act } from '@testing-library/react';
import TestOrderAction from './test-order-action.component';
import { Order } from '@openmrs/esm-patient-common-lib';
import * as resource from './test-order-action.resource';
import userEvent from '@testing-library/user-event';
import { launchWorkspace, showModal } from '@openmrs/esm-framework';
import { createMedicationDispenseProps } from './dispense.resource';
import { useStockItemQuantity } from '../useBillableItem';

jest.mock('./test-order-action.resource');
jest.mock('../useBillableItem', () => ({
  useStockItemQuantity: jest.fn(),
}));
jest.mock('./dispense.resource', () => ({
  createMedicationDispenseProps: jest.fn(() => ({
    whenHandedOver: '2025-02-19T12:35:53+00:00',
  })),
}));

const mockTestProps = {
  order: { uuid: '123', patient: { uuid: '456' } } as Order,
  patientUuid: 'patient-uuid-123',
  encounterUuid: 'encounter-uuid-456',
  medicationRequestBundle: {
    request: {
      id: 'med-request-789',
      medicationReference: { reference: 'Medication/med-123' },
      medicationCodeableConcept: { coding: [{ code: 'med-code-123' }] },
      subject: { reference: 'Patient/patient-uuid-123' },
      dispenseRequest: {
        quantity: {
          value: 30,
          code: 'TAB',
          unit: 'tablets',
          system: 'http://terminology.hl7.org/CodeSystem/v3-orderableDrugForm',
        },
      },
      dosageInstruction: [
        {
          text: 'Take 1 tablet daily',
          timing: { code: 'daily' },
          route: { coding: [{ code: 'PO' }] },
          doseAndRate: [
            {
              doseQuantity: {
                value: 1,
                code: 'TAB',
                unit: 'tablet',
              },
            },
          ],
          additionalInstruction: [{ text: 'with food' }],
        },
      ],
    },
  },
  quantityRemaining: 30,
  session: {
    currentProvider: {
      uuid: 'provider-uuid-123',
    },
    sessionLocation: {
      uuid: 'location-uuid-456',
    },
  },
  providers: [
    {
      uuid: 'provider-uuid-123',
      display: 'Dr. Test Provider',
    },
  ],
  closeable: true,
} as Record<string, unknown>;

const testProps = {
  order: { uuid: '123', patient: { uuid: '456' } } as Order,
};

describe('TestOrderAction', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  test('should render loading when isLoading is true', () => {
    jest.spyOn(resource, 'useTestOrderBillStatus').mockReturnValue({ isLoading: true, hasPendingPayment: false });
    jest.spyOn(resource, 'useOrderBill').mockReturnValue({
      itemHasBill: [],
    });
    (useStockItemQuantity as jest.Mock).mockReturnValue({
      stockItemQuantity: 5,
      stockItemUuid: 'some-uuid',
      isLoading: false,
      error: undefined,
    });
    render(<TestOrderAction {...testProps} />);
    expect(screen.getByText('Verifying bill status...')).toBeInTheDocument();
  });

  test("should display `Unsettled bill for test` when there's a pending payment", () => {
    jest.spyOn(resource, 'useTestOrderBillStatus').mockReturnValueOnce({ isLoading: false, hasPendingPayment: true });
    jest.spyOn(resource, 'useOrderBill').mockReturnValueOnce({
      itemHasBill: [],
    });
    (useStockItemQuantity as jest.Mock).mockReturnValueOnce({
      stockItemQuantity: 5,
      stockItemUuid: 'some-uuid',
      isLoading: false,
      error: undefined,
    });
    render(<TestOrderAction {...testProps} />);
    expect(screen.getByText('Unsettled bill')).toBeInTheDocument();
  });

  test("should display `Pick Lab Request` when there's no pending payment", async () => {
    const user = userEvent.setup();
    jest.spyOn(resource, 'useTestOrderBillStatus').mockReturnValueOnce({ isLoading: false, hasPendingPayment: false });
    jest.spyOn(resource, 'useOrderBill').mockReturnValueOnce({
      itemHasBill: [],
    });
    (useStockItemQuantity as jest.Mock).mockReturnValueOnce({
      stockItemQuantity: 5,
      stockItemUuid: 'some-uuid',
      isLoading: false,
      error: undefined,
    });
    render(<TestOrderAction {...testProps} />);
    const pickLabRequestMenuItem = screen.getByText('Pick Lab Request');
    await act(async () => {
      await user.click(pickLabRequestMenuItem);
    });

    expect(screen.queryByText('Unsettled bill.')).not.toBeInTheDocument();
    expect(showModal).toBeCalledWith('pickup-lab-request-modal', {
      closeModal: expect.any(Function),
      order: { patient: { uuid: '456' }, uuid: '123' },
    });
  });

  test('should not render the dispense form if closeable is false', () => {
    jest.spyOn(resource, 'useTestOrderBillStatus').mockReturnValue({ isLoading: false, hasPendingPayment: false });
    jest.spyOn(resource, 'useOrderBill').mockReturnValue({
      itemHasBill: [],
    });
    (useStockItemQuantity as jest.Mock).mockReturnValue({
      stockItemQuantity: 5,
      stockItemUuid: 'some-uuid',
      isLoading: false,
      error: undefined,
    });
    render(<TestOrderAction {...testProps} closeable={false} />);
    expect(screen.queryByText('Dispense')).not.toBeInTheDocument();
  });

  test('should launch the dispense form when dispense order is part of props', async () => {
    const user = userEvent.setup();
    jest.spyOn(resource, 'useTestOrderBillStatus').mockReturnValueOnce({ isLoading: false, hasPendingPayment: false });
    jest.spyOn(resource, 'useOrderBill').mockReturnValueOnce({
      itemHasBill: [],
    });
    (useStockItemQuantity as jest.Mock).mockReturnValueOnce({
      stockItemQuantity: 5,
      stockItemUuid: 'some-uuid',
      isLoading: false,
      error: undefined,
    });
    render(<TestOrderAction {...mockTestProps} />);
    const dispenseButton = screen.getByRole('button', { name: 'Dispense' });
    expect(dispenseButton).toBeInTheDocument();

    await act(async () => {
      await user.click(dispenseButton);
    });
    const dispenseFormProps = createMedicationDispenseProps(mockTestProps);
    expect(launchWorkspace).toHaveBeenCalledWith('dispense-workspace', dispenseFormProps);
  });
});
