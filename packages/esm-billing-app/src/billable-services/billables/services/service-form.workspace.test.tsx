import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ServiceForm from './service-form.workspace';
import { createBillableService, useConceptsSearch, useServiceTypes } from '../../billable-service.resource';
import { usePaymentModes } from '../../../billing.resource';

const mockUseConceptsSearch = useConceptsSearch as jest.MockedFunction<typeof useConceptsSearch>;
const mockUseServiceTypes = useServiceTypes as jest.MockedFunction<typeof useServiceTypes>;
const mockUsePaymentModes = usePaymentModes as jest.MockedFunction<typeof usePaymentModes>;
const mockCreateBillableService = createBillableService as jest.MockedFunction<typeof createBillableService>;

const mockerConcepts = {
  searchResults: [
    {
      concept: {
        uuid: '123e4567-e89b-12d3-a456-426614174000',
        display: 'Consultation',
        datatype: { display: 'Text', uuid: '8d4a4c94-c2cc-11de-8d13-0010c6dffd0f' },
        conceptClass: { display: 'Misc', uuid: '8d491e50-c2cc-11de-8d13-0010c6dffd0f' },
      },
      conceptName: {
        uuid: '123e4567-e89b-12d3-a456-426614174001',
        display: 'Consultation',
        locale: 'en',
        localePreferred: true,
      },
      display: 'Consultation',
    },
    {
      concept: {
        uuid: '123e4567-e89b-12d3-a456-426614174002',
        display: 'Laboratory Test',
        datatype: { display: 'Text', uuid: '8d4a4c94-c2cc-11de-8d13-0010c6dffd0f' },
        conceptClass: { display: 'Test', uuid: '8d491e50-c2cc-11de-8d13-0010c6dffd0f' },
      },
      conceptName: {
        uuid: '123e4567-e89b-12d3-a456-426614174003',
        display: 'Laboratory Test',
        locale: 'en',
        localePreferred: true,
      },
      display: 'Laboratory Test',
    },
  ],
  error: null,
  isSearching: false,
};

const mockServiceTypes = {
  serviceTypes: [
    {
      uuid: 'd7bd4cc0-90b1-4f22-90f2-ab7fde936728',
      display: 'Laboratory',
      id: 1,
    },
    {
      uuid: 'd7bd4cc0-90b1-4f22-90f2-ab7fde936729',
      display: 'Pharmacy',
      id: 2,
    },
    {
      uuid: 'd7bd4cc0-90b1-4f22-90f2-ab7fde936730',
      display: 'Surgical',
      id: 3,
    },
  ],
  error: null,
  isLoading: false,
};

const mockPaymentModes = {
  paymentModes: [
    {
      uuid: 'd7bd4cc0-90b1-4f22-90f2-ab7fde936731',
      name: 'Cash',
      description: 'Cash payment',
      retired: false,
      retireReason: null,
      auditInfo: {
        creator: {
          uuid: '1',
          display: 'Admin',
          links: [{ rel: 'self', uri: 'http://localhost:8080/openmrs/ws/rest/v1/user/1', resourceAlias: 'user' }],
        },
        dateCreated: '2024-01-01',
        changedBy: null,
        dateChanged: null,
      },
      attributeTypes: [],
      sortOrder: null,
      resourceVersion: '1.8',
    },
    {
      uuid: 'd7bd4cc0-90b1-4f22-90f2-ab7fde936732',
      name: 'Insurance',
      description: 'Insurance payment',
      retired: false,
      retireReason: null,
      auditInfo: {
        creator: {
          uuid: '1',
          display: 'Admin',
          links: [{ rel: 'self', uri: 'http://localhost:8080/openmrs/ws/rest/v1/user/1', resourceAlias: 'user' }],
        },
        dateCreated: '2024-01-01',
        changedBy: null,
        dateChanged: null,
      },
      attributeTypes: [],
      sortOrder: null,
      resourceVersion: '1.8',
    },
    {
      uuid: 'd7bd4cc0-90b1-4f22-90f2-ab7fde936733',
      name: 'Waiver',
      description: 'Payment waiver',
      retired: false,
      retireReason: null,
      auditInfo: {
        creator: {
          uuid: '1',
          display: 'Admin',
          links: [{ rel: 'self', uri: 'http://localhost:8080/openmrs/ws/rest/v1/user/1', resourceAlias: 'user' }],
        },
        dateCreated: '2024-01-01',
        changedBy: null,
        dateChanged: null,
      },
      attributeTypes: [],
      sortOrder: null,
      resourceVersion: '1.8',
    },
  ],
  isLoading: false,
  error: null,
  mutate: jest.fn(),
};

jest.mock('../../billable-service.resource', () => ({
  useConceptsSearch: jest.fn(),
  useServiceTypes: jest.fn(),
  createBillableService: jest.fn(),
}));

jest.mock('../../../billing.resource', () => ({
  usePaymentModes: jest.fn(),
}));

const defaultProps = {
  patient: null,
  patientUuid: 'test-uuid',
  closeWorkspace: jest.fn(),
  promptBeforeClosing: jest.fn(),
  setTitle: jest.fn(),
  closeWorkspaceWithSavedChanges: jest.fn(),
};

describe('ServiceForm', () => {
  test('should render billiable service form and submit successfully', async () => {
    const user = userEvent.setup();
    mockUseConceptsSearch.mockReturnValue(mockerConcepts);
    mockUseServiceTypes.mockReturnValue(mockServiceTypes);
    mockUsePaymentModes.mockReturnValue(mockPaymentModes);
    const { container } = render(<ServiceForm {...defaultProps} />);

    // should render all the form fields
    const serviceNameInput = screen.getByLabelText('Service name');
    const serviceShortNameInput = screen.getByLabelText('Service short name');
    const serviceTypeSelect = screen.getByPlaceholderText('Select service type');
    const serviceConceptInput = screen.getByPlaceholderText('Search for concept');
    const addPaymentMethodButton = screen.getByRole('button', { name: 'Add payment method' });

    // user should be able to type in service name, short name, concept and service type
    await user.type(serviceNameInput, 'Test Service');
    await user.type(serviceShortNameInput, 'TS');
    await user.type(serviceConceptInput, 'Consultation');

    const searchResults = container.querySelector('.searchResults');
    expect(searchResults).toBeInTheDocument();

    const firstSearchResultItem = screen.getByRole('button', { name: 'Consultation' });
    await user.click(firstSearchResultItem);

    expect(serviceConceptInput).toHaveValue('Consultation');

    const openServiceTypeSelect = screen.getByRole('button', { name: 'Open' });
    await user.click(openServiceTypeSelect);

    const serviceTypeOptions = screen.getAllByRole('option', { name: 'Laboratory' });
    await user.click(serviceTypeOptions[0]);

    expect(serviceTypeSelect).toHaveValue('Laboratory');

    // user should be able to add payment method and remove it
    await user.click(addPaymentMethodButton);
    const allOpenButtons = screen.getAllByRole('button', { name: 'Open' });
    expect(allOpenButtons).toHaveLength(2);

    const paymentMethodCombobox = allOpenButtons[1];
    expect(paymentMethodCombobox).toHaveAttribute('aria-expanded', 'false');

    await user.click(paymentMethodCombobox);
    expect(paymentMethodCombobox).toHaveAttribute('aria-expanded', 'true');
    const paymentMethodOption = screen.getByRole('option', { name: 'Cash' });
    await user.click(paymentMethodOption);

    // add price
    const priceInput = screen.getByRole('spinbutton', { name: 'Price' });
    await user.type(priceInput, '100');

    const saveAndCloseButton = screen.getByRole('button', { name: 'Save & close' });
    await user.click(saveAndCloseButton);

    expect(mockCreateBillableService).toHaveBeenCalledWith(
      {
        concept: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Service',
        servicePrices: [{ name: 'Cash', paymentMode: 'd7bd4cc0-90b1-4f22-90f2-ab7fde936731', price: 100 }],
        serviceStatus: 'ENABLED',
        serviceType: 'd7bd4cc0-90b1-4f22-90f2-ab7fde936728',
        shortName: 'TS',
        stockItem: null,
      },
      undefined,
    );
  });
});
