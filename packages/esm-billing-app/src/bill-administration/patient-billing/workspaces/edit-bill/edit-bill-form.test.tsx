import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { EditBillForm } from './edit-bill-form.workspace';
import { mockBillData, mockCurrentBillableService, mockInitialServicePrice } from '../../../../../__mocks__/bill.mock';
import { useFormInitialValues } from './useEditBillFormSchema';
import userEvent from '@testing-library/user-event';
import { processBillPayment } from '../../../../billing.resource';
import { createEditBillPayload } from './edit-bill-util';

const mockedUseFormInitialValues = useFormInitialValues as jest.MockedFunction<typeof useFormInitialValues>;
const mockedProcessBillPayment = processBillPayment as jest.MockedFunction<typeof processBillPayment>;

jest.mock('./useEditBillFormSchema', () => ({
  ...jest.requireActual('./useEditBillFormSchema'),
  useFormInitialValues: jest.fn(),
}));

jest.mock('../../../../billing.resource', () => ({
  processBillPayment: jest.fn(),
}));

const testProps = {
  closeWorkspace: jest.fn(),
  promptBeforeClosing: jest.fn(),
  closeWorkspaceWithSavedChanges: jest.fn(),
  setTitle: jest.fn(),
  lineItem: mockBillData[0].lineItems[0],
  bill: mockBillData[0],
};

describe('EditBillForm', () => {
  it('should display the current form values correctly and submit the form with adjustment reason', async () => {
    const user = userEvent.setup();
    mockedUseFormInitialValues.mockReturnValue({
      selectedServicePrice: mockInitialServicePrice,
      isLoadingServices: false,
      selectedBillableService: mockCurrentBillableService,
    });
    render(<EditBillForm {...testProps} />);
    // Expect the form to be displayed with the correct values
    const currentItemText = await screen.findByText(testProps.lineItem.billableService?.split(':')[1]);
    expect(currentItemText).toBeInTheDocument();

    // Expect form fields to be displayed
    const priceField = await screen.findByRole('combobox', { name: /price option/i });
    const quantityField = await screen.findByRole('spinbutton', { name: /quantity/i });
    const adjustmentReasonField = await screen.findByPlaceholderText(/please enter adjustment reason/i);

    expect(priceField).toHaveValue(`TEST PRICE - (100)`);
    expect(quantityField).toHaveValue(testProps.lineItem.quantity);
    expect(adjustmentReasonField).toHaveValue(testProps.bill.adjustmentReason);

    // Expect the save and cancel buttons to be displayed
    const saveButton = await screen.findByRole('button', { name: /save/i });
    const cancelButton = await screen.findByRole('button', { name: /cancel/i });
    expect(saveButton).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();

    // Expect save button to be disabled as the form hasn't been changed
    expect(saveButton).toBeDisabled();

    // Clear the adjustment reason and quantity
    await user.clear(adjustmentReasonField);
    await user.tripleClick(quantityField);

    // Change the price, quantity and adjustment reason
    await user.keyboard('2');
    await user.type(adjustmentReasonField, 'Adjustment test reason');

    // On the dropdown, select the second option
    const openDropdown = await screen.findByRole('button', { name: /open/i });
    await user.click(openDropdown);
    await user.click(screen.getAllByRole('option')[1]);

    // Expect save button to be enabled
    expect(saveButton).toBeEnabled();

    const expectedPayload = createEditBillPayload(
      testProps.lineItem,
      { quantity: '2', price: '100' },
      testProps.bill,
      'Adjustment test reason',
    );
    // Submit the form
    await user.click(saveButton);
    await waitFor(() => {
      expect(mockedProcessBillPayment).toHaveBeenCalledWith(expectedPayload, 'test-uuid-1');
    });
  });
});
