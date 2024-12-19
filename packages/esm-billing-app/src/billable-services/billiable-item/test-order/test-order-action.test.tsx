import React from 'react';
import { screen, render } from '@testing-library/react';
import TestOrderAction from './test-order-action.component';
import { Order } from '@openmrs/esm-patient-common-lib';
import * as resource from './test-order-action.resource';
import userEvent from '@testing-library/user-event';
import { launchWorkspace, showModal } from '@openmrs/esm-framework';
import { createMedicationDispenseProps } from './dispense.resource';

jest.mock('./test-order-action.resource');
jest.mock('./dispense.resource', () => ({
  createMedicationDispenseProps: jest.fn(() => ({
    whenHandedOver: '2024-12-17T11:52:35+00:00',
    medicationRequestBundle: {
      request: {
        dispenseRequest: {
          quantity: { value: 30, code: 'TAB', unit: 'tablets' },
        },
      },
    },
    otherProp: 'test-value',
  })),
}));

jest.mock('@openmrs/esm-framework', () => ({
  launchWorkspace: jest.fn(),
  showModal: jest.fn(),
}));

const testProps = {
  order: { uuid: '123', patient: { uuid: '456' } } as Order,
  modalName: 'test-modal',
  actionText: 'Test Action',
};

describe('TestOrderAction', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date('2024-12-17T11:52:35Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should render loading state when isLoading is true', () => {
    jest.spyOn(resource, 'useTestOrderBillStatus').mockReturnValueOnce({ isLoading: true, hasPendingPayment: false });
    render(<TestOrderAction {...testProps} />);

    expect(screen.getByText('Verifying bill status...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  test('should display "Unsettled bill" when hasPendingPayment is true', () => {
    jest.spyOn(resource, 'useTestOrderBillStatus').mockReturnValueOnce({ isLoading: false, hasPendingPayment: true });
    render(<TestOrderAction {...testProps} />);

    expect(screen.getByText('Unsettled bill')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  test('should render the button with correct action text', () => {
    jest.spyOn(resource, 'useTestOrderBillStatus').mockReturnValueOnce({ isLoading: false, hasPendingPayment: false });
    render(<TestOrderAction {...testProps} />);

    expect(screen.getByText('Test Action')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeEnabled();
  });

  test('should not render button if order is in progress', () => {
    const inProgressProps = {
      ...testProps,
      order: { ...testProps.order, fulfillerStatus: 'IN_PROGRESS' } as Order,
    };

    jest.spyOn(resource, 'useTestOrderBillStatus').mockReturnValueOnce({ isLoading: false, hasPendingPayment: false });
    render(<TestOrderAction {...inProgressProps} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
