import React from 'react';
import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import { EditBillForm } from './edit-bill-form.workspace';
import userEvent from '@testing-library/user-event';
import { processBillPayment } from '../../../billing.resource';

jest.mock('../../../billing.resource', () => ({
  processBillPayment: jest.fn(), // Mock the function
}));
const mockedCloseWorkspace = jest.fn();
const mockedPromptBeforeClosing = jest.fn();
const mockedCloseWorkspaceWithSavedChanges = jest.fn();
const mockedSetTitle = jest.fn();

const mockLineItem = {
  uuid: '4bf2fa1c-4460-4eb6-9a22-b587c3c831a5',
  display: 'BillLineItem',
  voided: false,
  voidReason: null,
  item: '',
  billableService: '7c1ed871-8b45-4097-a9fa-12e6efba3686:Injection',
  quantity: 1,
  price: 1000,
  priceName: 'Default',
  priceUuid: '',
  lineItemOrder: 0,
  paymentStatus: 'PENDING',
  itemOrServiceConceptUuid: '1762AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  order: null,
  resourceVersion: '1.8',
};

const mockBill = {
  id: 1903,
  uuid: 'f516aeee-9b47-4398-a076-cc9ff98d868b',
  patientName: ' ZAWADI ZAWADI ZAWADI',
  identifier: 'MGVEAX ',
  patientUuid: '734a323c-3814-4336-a2a8-6b6b65f489e9',
  status: 'PENDING',
  receiptNumber: '1932-3',
  cashier: {
    uuid: '6a88ca55-8213-4883-bdad-0c93324a2715',
    display: '0100 - User User',
    links: [
      {
        rel: 'self',
        uri: 'http://dev.kenyahmis.org/openmrshttp://dev.kenyahmis.org/openmrs/ws/rest/v1/provider/6a88ca55-8213-4883-bdad-0c93324a2715',
        resourceAlias: 'provider',
      },
    ],
  },
  cashPointUuid: '54065383-b4d4-42d2-af4d-d250a1fd2590',
  cashPointName: 'OPD Cash Point',
  cashPointLocation: 'Moi Teaching Refferal Hospital',
  dateCreated: 'Today, 16:19',
  dateCreatedUnformatted: 'Today, 16:19',
  lineItems: [
    {
      uuid: '4bf2fa1c-4460-4eb6-9a22-b587c3c831a5',
      display: 'BillLineItem',
      voided: false,
      voidReason: null,
      item: '',
      billableService: 'b4254165-ed1a-48dd-b931-c5a9c3363242:Registration New',
      quantity: 1,
      price: 1000,
      priceName: 'Default',
      priceUuid: '',
      lineItemOrder: 0,
      paymentStatus: 'PENDING',
      itemOrServiceConceptUuid: '1762AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      order: null,
      resourceVersion: '1.8',
    },
  ],
  billingService: 'b4254165-ed1a-48dd-b931-c5a9c3363242:Registration New',
  payments: [],
  display: '1932-3',
  totalAmount: 1000,
};

describe('EditBillForm', () => {
  const mockedProcessBillPayment = processBillPayment; // Access the mock

  test('should generate the correct payload  when the form is submitted', async () => {
    const user = userEvent.setup();

    render(
      <EditBillForm
        promptBeforeClosing={mockedPromptBeforeClosing}
        setTitle={mockedSetTitle}
        closeWorkspaceWithSavedChanges={mockedCloseWorkspaceWithSavedChanges}
        closeWorkspace={mockedCloseWorkspace}
        bill={mockBill}
        lineItem={mockLineItem}
      />,
    );

    const unitPrice = await screen.findByPlaceholderText(/New price/i);
    expect(unitPrice).toHaveValue(mockLineItem.price);

    const quantity = screen.getByRole('spinbutton', { name: /quantity/i });
    expect(quantity).toHaveValue(mockLineItem.quantity);
    await user.clear(quantity);
    await user.type(quantity, '20');
    expect(quantity).toHaveValue(20);

    const submitButton = screen.getByRole('button', { name: /save & close/i });
    await user.click(submitButton);
    expect(mockedProcessBillPayment).toHaveBeenCalledTimes(1);
    expect(mockedProcessBillPayment).toHaveBeenCalledWith(
      {
        billAdjusted: 'f516aeee-9b47-4398-a076-cc9ff98d868b',
        cashPoint: '54065383-b4d4-42d2-af4d-d250a1fd2590',
        cashier: '6a88ca55-8213-4883-bdad-0c93324a2715',
        lineItems: [
          {
            item: '',
            lineItemOrder: 0,
            paymentStatus: 'PENDING',
            price: 1000,
            priceName: 'Default',
            priceUuid: '',
            quantity: 20,
            uuid: '4bf2fa1c-4460-4eb6-9a22-b587c3c831a5',
          },
        ],
        patient: '734a323c-3814-4336-a2a8-6b6b65f489e9',
        payments: [],
        status: 'PENDING',
      },
      'f516aeee-9b47-4398-a076-cc9ff98d868b',
    );
    expect(mockedCloseWorkspace).toHaveBeenCalledTimes(1);
  });
});
