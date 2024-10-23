import React from 'react';
import { screen, render } from '@testing-library/react';
import TestOrderAction from './test-order-action.component';
import { Order } from '@openmrs/esm-patient-common-lib';
import * as resource from './test-order-action.resource';
import userEvent from '@testing-library/user-event';
import { showModal } from '@openmrs/esm-framework';

jest.mock('./test-order-action.resource');

const testProps = {
  order: { uuid: '123', patient: { uuid: '456' } } as Order,
};

describe('TestOrderAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render loading when isLoading is true', () => {
    jest.spyOn(resource, 'useTestOrderBillStatus').mockReturnValue({ isLoading: true, hasPendingPayment: false });
    render(<TestOrderAction {...testProps} />);
    expect(screen.getByText('Verifying order bill status...')).toBeInTheDocument();
  });

  test("should display `Unsettled bill for test` when there's a pending payment", () => {
    jest.spyOn(resource, 'useTestOrderBillStatus').mockReturnValue({ isLoading: false, hasPendingPayment: true });
    render(<TestOrderAction {...testProps} />);
    expect(screen.getByText('Unsettled bill.')).toBeInTheDocument();
  });

  test("should display `Pick Lab Request` when there's no pending payment", async () => {
    const user = userEvent.setup();
    jest.spyOn(resource, 'useTestOrderBillStatus').mockReturnValue({ isLoading: false, hasPendingPayment: false });
    render(<TestOrderAction {...testProps} />);
    const pickLabRequestMenuItem = screen.getByText('Pick Lab Request');
    await user.click(pickLabRequestMenuItem);

    expect(screen.queryByText('Unsettled bill.')).not.toBeInTheDocument();
    expect(showModal).toBeCalledWith('pickup-lab-request-modal', {
      closeModal: expect.any(Function),
      order: { patient: { uuid: '456' }, uuid: '123' },
    });
  });
});
