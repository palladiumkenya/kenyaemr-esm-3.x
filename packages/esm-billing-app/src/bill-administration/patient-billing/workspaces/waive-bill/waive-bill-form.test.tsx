import React from 'react';
import { render, screen } from '@testing-library/react';
import { processBillPayment, usePaymentModes } from '../../../../billing.resource';
import { WaiveBillForm } from './waive-bill-form.workspace';
import userEvent from '@testing-library/user-event';
import { LineItem, MappedBill, PaymentMethod } from '../../../../types';
import { showSnackbar } from '@openmrs/esm-framework';

const mockedUsePaymentModes = usePaymentModes as jest.MockedFunction<typeof usePaymentModes>;
const mockProcessBillPayment = processBillPayment as jest.MockedFunction<typeof processBillPayment>;
const mockShowSnackbar = showSnackbar as jest.MockedFunction<typeof showSnackbar>;

jest.mock('../../../../billing.resource', () => ({
  processBillPayment: jest.fn(),
  usePaymentModes: jest.fn(),
}));

const mockedBill: MappedBill = {
  id: 1909,
  uuid: '45143fae-b83d-4768-ada5-621e8dc1229d',
  patientName: ' Test Patient',
  identifier: 'MGVDGL ',
  patientUuid: '03de0a73-67f1-483f-a9e3-b432295c014a',
  status: 'PENDING',
  receiptNumber: '1937-2',
  cashier: {
    uuid: '48b55692-e061-4ffa-b1f2-fd4aaf506224',
    display: 'admin - Super User',
    links: [],
  },
  cashPointUuid: '54065383-b4d4-42d2-af4d-d250a1fd2590',
  cashPointName: 'OPD Cash Point',
  cashPointLocation: 'Moi Teaching Refferal Hospital',
  dateCreated: 'Today, 00:33',
  lineItems: [
    {
      uuid: 'e53c5589-e588-4bb9-bb72-6d4d16189679',
      display: 'BillLineItem',
      voided: false,
      voidReason: null,
      item: '',
      billableService: '3f5d0684-a280-477e-a67b-2a956a1f6dca:Registration Revist',
      quantity: 1,
      price: 50,
      priceName: 'Default',
      priceUuid: '',
      lineItemOrder: 0,
      paymentStatus: 'PENDING',
      resourceVersion: '1.8',
      itemOrServiceConceptUuid: '',
    } as unknown as LineItem,
  ],
  billingService: '3f5d0684-a280-477e-a67b-2a956a1f6dca:Registration Revist',
  payments: [],
  display: '1937-2',
  totalAmount: 50,
  dateCreatedUnformatted: '',
};

const mockedPaymentMode = [
  {
    uuid: 'eb6173cb-9678-4614-bbe1-0ccf7ed9d1d4',
    name: 'Waiver',
    description: 'Waiver payment',
    retired: false,
    retireReason: null,
    auditInfo: null,
    sortOrder: 0,
    resourceVersion: '1.8',
    attributeTypes: [
      {
        uuid: 'eb6173cb-9678-4614-bbe1-0ccf7ed9d1d4',
        name: 'Waiver',
        description: 'Waiver payment',
        retired: false,
      },
    ],
  } as unknown as PaymentMethod,
];

describe('BillWaiverForm', () => {
  test('Should post waiver correctly', async () => {
    const user = userEvent.setup();
    mockedUsePaymentModes.mockReturnValue({
      paymentModes: mockedPaymentMode,
      isLoading: false,
      error: null,
      mutate: jest.fn(),
    });
    render(
      <WaiveBillForm
        bill={mockedBill}
        closeWorkspace={jest.fn()}
        patientUuid="some-patient-uuid"
        promptBeforeClosing={jest.fn()}
        setTitle={jest.fn()}
        closeWorkspaceWithSavedChanges={jest.fn()}
      />,
    );
    expect(screen.getByText('Bill Items')).toBeInTheDocument();

    // get waiver amount input
    const waiverAmountInput = screen.getByRole('spinbutton', { name: 'Enter amount to waive' });
    const waiverReasonInput = screen.getByRole('textbox', { name: 'Waiver reason' });

    // Input waiver amount and reason
    await user.type(waiverAmountInput, '50');
    await user.type(waiverReasonInput, 'Test reason');

    // should display error if amount keyed in is greater than total amount
    expect(screen.queryByText('Amount to waive cannot be greater than total amount')).toBeNull();
    await user.type(waiverAmountInput, '100');
    expect(screen.getByText('Amount to waive cannot be greater than total amount')).toBeInTheDocument();

    // should post waiver correctly
    mockProcessBillPayment.mockResolvedValue({
      headers: new Headers(),
      ok: true,
      redirected: false,
      status: 200,
      statusText: 'OK',
      type: 'basic',
      url: 'http://example.com',
      body: null,
    } as any);
    await user.clear(waiverAmountInput);
    await user.type(waiverAmountInput, '50');
    await user.click(screen.getByRole('button', { name: 'Post waiver' }));

    expect(mockProcessBillPayment).toHaveBeenCalledTimes(1);

    const expectedBill = {
      cashPoint: mockedBill.cashPointUuid,
      cashier: mockedBill.cashier.uuid,
      lineItems: [
        {
          uuid: 'e53c5589-e588-4bb9-bb72-6d4d16189679',
          display: 'BillLineItem',
          voided: false,
          voidReason: null,
          item: '3f5d0684-a280-477e-a67b-2a956a1f6dca',
          billableService: '3f5d0684-a280-477e-a67b-2a956a1f6dca',
          quantity: 1,
          price: 50,
          priceName: 'Default',
          priceUuid: '',
          lineItemOrder: 0,
          paymentStatus: 'PAID',
          resourceVersion: '1.8',
          itemOrServiceConceptUuid: '',
        },
      ],
      payments: [
        {
          amount: 50,
          amountTendered: 50,
          attributes: [{ attributeType: mockedPaymentMode[0].uuid, value: 'Test reason' }],
          instanceType: mockedPaymentMode[0].uuid,
        },
      ],
      patient: mockedBill.patientUuid,
    };

    expect(mockProcessBillPayment).toHaveBeenCalledWith(expectedBill, '45143fae-b83d-4768-ada5-621e8dc1229d');
    expect(mockShowSnackbar).toHaveBeenCalledWith({
      title: 'Bill waiver',
      subtitle: 'Bill waiver successful',
      kind: 'success',
      timeoutInMs: 3500,
      isLowContrast: true,
    });
  });
});
