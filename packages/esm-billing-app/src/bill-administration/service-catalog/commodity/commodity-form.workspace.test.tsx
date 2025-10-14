import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import CommodityForm from './commodity-form.workspace';
import userEvent from '@testing-library/user-event';
import { useCommodityItem } from './useCommodityItem';
import { usePaymentModes } from '../../../billing.resource';
import { createBillableService } from '../../billable-service.resource';

jest.mock('../../billable-service.resource', () => ({
  createBillableService: jest.fn(),
}));

const mockStockItems = [
  {
    uuid: '123',
    drugUuid: '123',
    drugName: 'Paracetamol 250mg',
    conceptUuid: '456',
    conceptName: 'Paracetamol 250mg',
    hasExpiration: true,
    preferredVendorUuid: '789',
    preferredVendorName: 'Test Vendor',
    purchasePrice: 100,
    purchasePriceUoMUuid: '101',
    purchasePriceUoMName: 'Test UoM',
    purchasePriceUoMFactor: 1,
    dispensingUnitName: 'Test Unit',
    dispensingUnitUuid: '102',
    dispensingUnitPackagingUoMUuid: '103',
    dispensingUnitPackagingUoMName: 'Test Packaging',
    dispensingUnitPackagingUoMFactor: 1,
    defaultStockOperationsUoMUuid: '104',
    defaultStockOperationsUoMName: 'Test Operations',
    defaultStockOperationsUoMFactor: 1,
    categoryUuid: '105',
    categoryName: 'Test Category',
    commonName: 'Paracetamol 250mg',
    acronym: 'PCM',
    reorderLevel: 10,
    reorderLevelUoMUuid: '106',
    reorderLevelUoMName: 'Test Level',
    reorderLevelUoMFactor: 1,
    dateCreated: '2024-01-01',
    creatorGivenName: 'Test',
    creatorFamilyName: 'User',
    voided: false,
    expiryNotice: 30,
    links: [
      {
        rel: 'self',
        uri: '/ws/rest/v1/stockmanagement/stockitem/123',
        resourceAlias: 'stockitem',
      },
    ],
    resourceVersion: '1.0',
  },
  {
    uuid: '321',
    drugUuid: '321',
    drugName: 'Test Item 2',
    conceptUuid: '654',
    conceptName: 'Test Concept 2',
    hasExpiration: true,
    preferredVendorUuid: '987',
    preferredVendorName: 'Test Vendor 2',
    purchasePrice: 200,
    purchasePriceUoMUuid: '201',
    purchasePriceUoMName: 'Test UoM 2',
    purchasePriceUoMFactor: 1,
    dispensingUnitName: 'Test Unit 2',
    dispensingUnitUuid: '202',
    dispensingUnitPackagingUoMUuid: '203',
    dispensingUnitPackagingUoMName: 'Test Packaging 2',
    dispensingUnitPackagingUoMFactor: 1,
    defaultStockOperationsUoMUuid: '204',
    defaultStockOperationsUoMName: 'Test Operations 2',
    defaultStockOperationsUoMFactor: 1,
    categoryUuid: '205',
    categoryName: 'Test Category 2',
    commonName: 'Test Item 2',
    acronym: 'TI2',
    reorderLevel: 15,
    reorderLevelUoMUuid: '206',
    reorderLevelUoMName: 'Test Level 2',
    reorderLevelUoMFactor: 1,
    dateCreated: '2024-01-01',
    creatorGivenName: 'Test',
    creatorFamilyName: 'User',
    voided: false,
    expiryNotice: 30,
    links: [
      {
        rel: 'self',
        uri: '/ws/rest/v1/stockmanagement/stockitem/321',
        resourceAlias: 'stockitem',
      },
    ],
    resourceVersion: '1.0',
  },
];

const mockUseCommodityItem = useCommodityItem as jest.MockedFunction<typeof useCommodityItem>;
const mockUsePaymentModes = usePaymentModes as jest.MockedFunction<typeof usePaymentModes>;

const mockPaymentModes = {
  paymentModes: [
    {
      uuid: 'payment-mode-1',
      name: 'Cash',
      description: 'Cash payment',
      retired: false,
      display: 'Cash',
      retireReason: null,
      auditInfo: {
        dateCreated: '2024-01-01',
        creator: {
          uuid: 'user-1',
          display: 'Test User',
          links: [
            {
              rel: 'self',
              uri: '/ws/rest/v1/user/user-1',
              resourceAlias: 'user',
            },
          ],
        },
        dateChanged: null,
        changedBy: null,
      },
      attributeTypes: [],
      sortOrder: null,
      links: [
        {
          rel: 'self',
          uri: '/ws/rest/v1/cashier/paymentMode/payment-mode-1',
          resourceAlias: 'paymentMode',
        },
      ],
      resourceVersion: '1.0',
    },
    {
      uuid: 'payment-mode-2',
      name: 'Insurance',
      description: 'Insurance payment',
      retired: false,
      display: 'Insurance',
      retireReason: null,
      auditInfo: {
        dateCreated: '2024-01-01',
        creator: {
          uuid: 'user-1',
          display: 'Test User',
          links: [
            {
              rel: 'self',
              uri: '/ws/rest/v1/user/user-1',
              resourceAlias: 'user',
            },
          ],
        },
        dateChanged: null,
        changedBy: null,
      },
      attributeTypes: [],
      sortOrder: null,
      links: [
        {
          rel: 'self',
          uri: '/ws/rest/v1/cashier/paymentMode/payment-mode-2',
          resourceAlias: 'paymentMode',
        },
      ],
      resourceVersion: '1.0',
    },
    {
      uuid: 'payment-mode-3',
      name: 'Mobile Money',
      description: 'Mobile money payment',
      retired: false,
      display: 'Mobile Money',
      retireReason: null,
      auditInfo: {
        dateCreated: '2024-01-01',
        creator: {
          uuid: 'user-1',
          display: 'Test User',
          links: [
            {
              rel: 'self',
              uri: '/ws/rest/v1/user/user-1',
              resourceAlias: 'user',
            },
          ],
        },
        dateChanged: null,
        changedBy: null,
      },
      attributeTypes: [],
      sortOrder: null,
      links: [
        {
          rel: 'self',
          uri: '/ws/rest/v1/cashier/paymentMode/payment-mode-3',
          resourceAlias: 'paymentMode',
        },
      ],
      resourceVersion: '1.0',
    },
  ],
  isLoading: false,
  mutate: jest.fn(),
  error: null,
};

jest.mock('./useCommodityItem', () => ({
  useCommodityItem: jest.fn(),
}));

jest.mock('../../../billing.resource', () => ({
  usePaymentModes: jest.fn(),
}));

const commodityFormProps = {
  patient: {} as fhir.Patient,
  patientUuid: 'patient-123',
  closeWorkspace: jest.fn(),
  promptBeforeClosing: jest.fn(),
  closeWorkspaceWithSavedChanges: jest.fn(),
  setTitle: jest.fn(),
};

describe('CommodityForm', () => {
  beforeEach(() => {
    mockUseCommodityItem.mockReturnValue({
      stockItems: mockStockItems,
      isLoading: false,
      isValidating: false,
      error: null,
      mutate: jest.fn(),
    });
    mockUsePaymentModes.mockReturnValue(mockPaymentModes);
  });

  it('should render commodity form and be a able to search and save a commodity billiable item', async () => {
    render(<CommodityForm {...commodityFormProps} />);

    const commoditySearchInput = await screen.findByPlaceholderText(/Search for commodity/i);
    expect(commoditySearchInput).toHaveProperty('value', '');

    expect(screen.getByText(/Add payment method/i)).toBeInTheDocument();
    const saveAndCloseButton = screen.getByText(/Save & close/i);
    expect(saveAndCloseButton).toBeDisabled();

    const cancelButton = screen.getByText(/Cancel/i);
    expect(cancelButton).toBeInTheDocument();

    // simulate a search for a commodity
    await userEvent.type(commoditySearchInput, 'paracetamol');
    expect(commoditySearchInput).toHaveProperty('value', 'paracetamol');

    // select the first result
    const firstResult = screen.getByRole('option', { name: /Paracetamol 250mg/i });
    await waitFor(() => {
      userEvent.click(firstResult);
    });

    // Add a payment method
    const addPaymentMethodButton = screen.getByText(/Add payment method/i);
    userEvent.click(addPaymentMethodButton);

    const openDropdown = await screen.findByRole('button', { name: /Open/i });
    userEvent.click(openDropdown);

    const cashOption = await screen.findByRole('option', { name: /Cash/i });
    userEvent.click(cashOption);

    const priceInput = await screen.findByPlaceholderText(/Enter price/i);
    expect(priceInput).toHaveProperty('value', '0');

    await userEvent.type(priceInput, '100');
    expect(priceInput).toHaveProperty('value', '100');

    // Wait for the save button to be enabled
    await waitFor(() => {
      expect(saveAndCloseButton).not.toBeDisabled();
    });

    // Click save and wait for the API call
    userEvent.click(saveAndCloseButton);

    // Wait for the API call to be made
    await waitFor(() => {
      expect(createBillableService).toHaveBeenCalledWith(
        {
          concept: '456',
          name: 'Paracetamol 250mg',
          servicePrices: [{ name: 'Cash', paymentMode: 'payment-mode-1', price: 100 }],
          serviceStatus: 'ENABLED',
          serviceType: '',
          shortName: 'Paracetamol 250mg',
          stockItem: '123',
        },
        undefined,
      );
    });
  });
});
