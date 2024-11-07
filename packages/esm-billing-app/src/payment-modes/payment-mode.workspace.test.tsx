import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import PaymentModeWorkspace from './payment-mode.workspace';
import userEvent from '@testing-library/user-event';
import { createPaymentMode } from './payment-mode.resource';
import { showSnackbar } from '@openmrs/esm-framework';

const testProps = {
  closeWorkspace: jest.fn(),
  promptBeforeClosing: jest.fn(),
  closeWorkspaceWithSavedChanges: jest.fn(),
  setTitle: jest.fn(),
};

const mockCreatePaymentMode = jest.mocked(createPaymentMode);

jest.mock('./payment-mode.resource', () => ({
  ...jest.requireActual('./payment-mode.resource'),
  createPaymentMode: jest.fn(),
}));

describe('PaymentModeWorkspace', () => {
  beforeEach(() => {
    mockCreatePaymentMode.mockClear();
  });

  test('should validate and submit correct form payload', async () => {
    const user = userEvent.setup();
    render(<PaymentModeWorkspace {...testProps} />);
    const nameInput = screen.getByRole('textbox', { name: /Payment mode name/i });
    const descriptionInput = screen.getByRole('textbox', { name: /Payment mode description/i });
    const submitButton = screen.getByRole('button', { name: /Save & Close/i });

    await user.click(submitButton);

    // Should show validation error
    expect(screen.getByText(/Payment mode name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Payment mode description is required/i)).toBeInTheDocument();

    await user.type(nameInput, 'Test Name');
    await user.type(descriptionInput, 'Test Description');
    await user.click(submitButton);

    // should not show validation error
    expect(screen.queryByText(/Payment mode name is required/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Payment mode description is required/i)).not.toBeInTheDocument();

    // should call createPaymentMode
    expect(mockCreatePaymentMode).toHaveBeenCalledWith(
      { description: 'Test Description', name: 'Test Name', attributeTypes: [], retired: false },
      '',
    );
  });

  test('should show error message when submitting form fails', async () => {
    const user = userEvent.setup();
    mockCreatePaymentMode.mockRejectedValue({
      responseBody: {
        error: {
          message: 'An error occurred while creating the payment mode',
        },
      },
    });
    render(<PaymentModeWorkspace {...testProps} />);
    const nameInput = screen.getByRole('textbox', { name: /Payment mode name/i });
    const descriptionInput = screen.getByRole('textbox', { name: /Payment mode description/i });
    const submitButton = screen.getByRole('button', { name: /Save & Close/i });

    await user.type(nameInput, 'Test Name');
    await user.type(descriptionInput, 'Test Description');
    await user.click(submitButton);

    // should show error message
    expect(showSnackbar).toHaveBeenCalledWith({
      title: 'Payment mode creation failed',
      subtitle: 'An error occurred while creating the payment mode {{errorMessage}}',
      kind: 'error',
      isLowContrast: true,
    });
  });

  test('should submit payload with attributeTypes', async () => {
    const user = userEvent.setup();
    render(<PaymentModeWorkspace {...testProps} />);

    // key in name, description and retired
    const nameInput = screen.getByRole('textbox', { name: /Payment mode name/i });
    const descriptionInput = screen.getByRole('textbox', { name: /Payment mode description/i });
    const retiredToggle = screen.getByRole('switch', { name: /Retired/i });

    await user.type(nameInput, 'Test Name');
    await user.type(descriptionInput, 'Test Description');
    await user.click(retiredToggle);

    // Click to add attribute type
    const addAttributeTypeButton = screen.getByRole('button', { name: /Add attribute type/i });
    await user.click(addAttributeTypeButton);

    // Key in attribute type name, description, required and format
    const attributeTypeNameInput = screen.getByRole('textbox', { name: /Attribute name/i });
    const attributeTypeDescriptionInput = screen.getByRole('textbox', { name: /Attribute description/i });
    const attributeRegExpInput = screen.getByRole('textbox', { name: /Enter regular expression/i });
    const attributeRetiredToggle = screen.getByRole('switch', { name: /Attribute retired/i });
    const attributeRequiredToggle = screen.getByRole('switch', { name: /Attribute required/i });
    const attributeFormatDropdown = screen.getByRole('combobox', { name: /Attribute format/i });

    // Key in attribute type details
    await user.type(attributeTypeNameInput, 'Test Attribute Name');
    await user.type(attributeTypeDescriptionInput, 'Test Attribute Description');
    await user.type(attributeRegExpInput, 'Test Regular Expression');
    await user.click(attributeRetiredToggle);
    await user.click(attributeRequiredToggle);

    // key retired reason
    const attributeRetiredReasonInput = screen.getByRole('textbox', { name: /Retired reason/i });
    await user.type(attributeRetiredReasonInput, 'Test Retired Reason');

    // Click the dropdown to select format
    const openDropdownButton = screen.getByRole('img', { name: /Open menu/i });
    await user.click(openDropdownButton);

    // Select the format
    const formatOption = screen.getByText('java.lang.String');
    await user.click(formatOption);

    // Click save and close
    const saveAndCloseButton = screen.getByRole('button', { name: /Save & Close/i });
    await user.click(saveAndCloseButton);

    // should call createPaymentMode with attributeTypes
    expect(mockCreatePaymentMode).toHaveBeenCalledWith(
      {
        description: 'Test Description',
        name: 'Test Name',
        attributeTypes: [
          {
            name: 'Test Attribute Name',
            description: 'Test Attribute Description',
            retired: true,
            required: true,
            format: 'java.lang.String',
            regExp: 'Test Regular Expression',
            attributeOrder: 0,
            foreignKey: null,
          },
        ],
        retired: true,
      },
      '',
    );
  });
});
