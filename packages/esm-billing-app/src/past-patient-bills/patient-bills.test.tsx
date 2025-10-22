import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { usePatient } from '@openmrs/esm-framework';
import { PatientBills, PatientHeader } from './patient-bills.component';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import { MappedBill } from '../types';

// Mock dependencies
jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  usePatient: jest.fn(),
  getPatientName: jest.fn((patient) => {
    return `${patient?.name?.[0]?.given?.[0]} ${patient?.name?.[0]?.family}`;
  }),
  ConfigurableLink: jest.fn(({ children, to, templateParams }) => (
    <a href={to.replace('${patientUuid}', templateParams.patientUuid).replace('${uuid}', templateParams.uuid)}>
      {children}
    </a>
  )),
}));

jest.mock('../helpers', () => ({
  convertToCurrency: jest.fn((amount) => `KES ${amount.toFixed(2)}`),
}));

jest.mock('./patient-bills-dashboard/empty-patient-bill.component', () => {
  return jest.fn(({ title, subTitle }) => (
    <div>
      <p>{title}</p>
      <p>{subTitle}</p>
    </div>
  ));
});

const mockUsePatient = usePatient as jest.MockedFunction<typeof usePatient>;

const mockBills: Array<MappedBill> = [
  {
    uuid: '65f9f19a-f70e-44f4-9c6c-55b23dab4a3f',
    id: 30,
    patientUuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
    patientName: 'John Wilson',
    cashPointUuid: '381595a0-2229-4152-9c45-bd3692aac7cc',
    cashPointName: 'Pharmacy Cashier',
    cashPointLocation: 'Amani Family Medical Clinic',
    cashier: {
      uuid: '48b55692-e061-4ffa-b1f2-fd4aaf506224',
      display: 'admin - ayunda ayunda ayunda',
      links: [],
    },
    receiptNumber: 'CP2-0011-0',
    status: 'PENDING' as any,
    identifier: '100GEJ',
    dateCreated: '2023-11-29T09:35:20.000+0300',
    dateCreatedUnformatted: '2023-11-29T09:35:20.000+0300',
    lineItems: [
      {
        uuid: '6ff72ef2-4265-4fdb-8563-a3a2eefa484e',
        display: 'BillLineItem',
        billableService: 'uuid:HIV self-test kit',
        voided: false,
        voidReason: null,
        item: 'HIV self-test kit',
        quantity: 1,
        price: 500.0,
        priceName: '',
        priceUuid: '',
        lineItemOrder: 0,
        resourceVersion: '1.8',
        paymentStatus: 'PENDING',
        itemOrServiceConceptUuid: '',
        serviceTypeUuid: '',
        order: null,
      },
    ],
    billingService: 'uuid:HIV self-test kit',
    payments: [],
    totalAmount: 500,
    tenderedAmount: 0,
  },
  {
    uuid: '75f9f19a-f70e-44f4-9c6c-55b23dab4a3f',
    id: 31,
    patientUuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
    patientName: 'John Wilson',
    cashPointUuid: '381595a0-2229-4152-9c45-bd3692aac7cc',
    cashPointName: 'Pharmacy Cashier',
    cashPointLocation: 'Amani Family Medical Clinic',
    cashier: {
      uuid: '48b55692-e061-4ffa-b1f2-fd4aaf506224',
      display: 'admin - ayunda ayunda ayunda',
      links: [],
    },
    receiptNumber: 'CP2-0012-0',
    status: 'PAID' as any,
    identifier: '100GEJ',
    dateCreated: '2023-11-30T10:15:20.000+0300',
    dateCreatedUnformatted: '2023-11-30T10:15:20.000+0300',
    lineItems: [
      {
        uuid: '7ff72ef2-4265-4fdb-8563-a3a2eefa484e',
        display: 'BillLineItem',
        billableService: 'uuid2:Medical Certificate',
        voided: false,
        voidReason: null,
        item: 'Medical Certificate',
        quantity: 1,
        price: 1000.0,
        priceName: '',
        priceUuid: '',
        lineItemOrder: 0,
        resourceVersion: '1.8',
        paymentStatus: 'PAID',
        itemOrServiceConceptUuid: '',
        serviceTypeUuid: '',
        order: null,
      },
    ],
    billingService: 'uuid2:Medical Certificate',
    payments: [],
    totalAmount: 1000,
    tenderedAmount: 1000,
  },
];

describe('PatientBills', () => {
  const mockOnCancel = jest.fn();
  const patientUuid = '8673ee4f-e2ab-4077-ba55-4980f408773e';

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePatient.mockReturnValue({
      patient: mockPatient as any,
      isLoading: false,
      error: null,
      patientUuid: patientUuid,
    });
  });

  it('should render loading state when patient data is loading', () => {
    mockUsePatient.mockReturnValue({
      patient: null,
      isLoading: true,
      error: null,
      patientUuid: patientUuid,
    });

    render(<PatientBills bills={mockBills} onCancel={mockOnCancel} patientUuid={patientUuid} />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render empty state when there are no bills', () => {
    render(<PatientBills bills={[]} onCancel={mockOnCancel} patientUuid={patientUuid} />);

    expect(screen.getByText('No bills found')).toBeInTheDocument();
    expect(screen.getByText('No bills found for this patient')).toBeInTheDocument();
  });

  it('should render patient header with patient information', () => {
    render(<PatientBills bills={mockBills} onCancel={mockOnCancel} patientUuid={patientUuid} />);

    expect(screen.getByText('John Wilson')).toBeInTheDocument();
    expect(screen.getByText('Male')).toBeInTheDocument();
    expect(screen.getByText('100732HE')).toBeInTheDocument();
  });

  it('should render bills table with correct headers', () => {
    render(<PatientBills bills={mockBills} onCancel={mockOnCancel} patientUuid={patientUuid} />);

    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Charge Item')).toBeInTheDocument();
    expect(screen.getByText('Total Amount')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('should render bill data in the table', () => {
    render(<PatientBills bills={mockBills} onCancel={mockOnCancel} patientUuid={patientUuid} />);

    expect(screen.getByText('HIV self-test kit')).toBeInTheDocument();
    expect(screen.getByText('Medical Certificate')).toBeInTheDocument();
    expect(screen.getByText('KES 500.00')).toBeInTheDocument();
    expect(screen.getByText('KES 1000.00')).toBeInTheDocument();
    expect(screen.getByText('PENDING')).toBeInTheDocument();
    expect(screen.getByText('PAID')).toBeInTheDocument();
  });

  it('should render table title and description', () => {
    render(<PatientBills bills={mockBills} onCancel={mockOnCancel} patientUuid={patientUuid} />);

    expect(screen.getByText(/patient bill summary/i)).toBeInTheDocument();
    expect(screen.getByText(/a list of all bills for this patient/i)).toBeInTheDocument();
  });

  it('should call onCancel when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<PatientBills bills={mockBills} onCancel={mockOnCancel} patientUuid={patientUuid} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(mockOnCancel).toHaveBeenCalledWith('');
  });

  it('should render charge items as links', () => {
    render(<PatientBills bills={mockBills} onCancel={mockOnCancel} patientUuid={patientUuid} />);

    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
    expect(links[0]).toHaveAttribute('href', expect.stringContaining('8673ee4f-e2ab-4077-ba55-4980f408773e'));
  });

  it('should handle bills with multiple line items correctly', () => {
    const billWithMultipleItems: MappedBill = {
      ...mockBills[0],
      lineItems: [
        mockBills[0].lineItems[0],
        {
          uuid: '8ff72ef2-4265-4fdb-8563-a3a2eefa484e',
          display: 'BillLineItem',
          billableService: 'uuid3:Lab Test',
          voided: false,
          voidReason: null,
          item: 'Lab Test',
          quantity: 1,
          price: 300.0,
          priceName: '',
          priceUuid: '',
          lineItemOrder: 1,
          resourceVersion: '1.8',
          paymentStatus: 'PENDING',
          itemOrServiceConceptUuid: '',
          serviceTypeUuid: '',
          order: null,
        },
      ],
    };

    render(<PatientBills bills={[billWithMultipleItems]} onCancel={mockOnCancel} patientUuid={patientUuid} />);

    expect(screen.getByText(/HIV self-test kit, Lab Test/i)).toBeInTheDocument();
  });
});

describe('PatientHeader', () => {
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render patient name, gender, and identifier', () => {
    render(<PatientHeader patient={mockPatient as any} onCancel={mockOnCancel} />);

    expect(screen.getByText('John Wilson')).toBeInTheDocument();
    expect(screen.getByText('Male')).toBeInTheDocument();
    expect(screen.getByText('100732HE')).toBeInTheDocument();
  });

  it('should render close button', () => {
    render(<PatientHeader patient={mockPatient as any} onCancel={mockOnCancel} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    expect(closeButton).toBeInTheDocument();
  });

  it('should call onCancel with empty string when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<PatientHeader patient={mockPatient as any} onCancel={mockOnCancel} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(mockOnCancel).toHaveBeenCalledWith('');
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('should display -- when patient identifier is not available', () => {
    const patientWithoutIdentifier = {
      ...mockPatient,
      identifier: [],
    };

    render(<PatientHeader patient={patientWithoutIdentifier as any} onCancel={mockOnCancel} />);

    expect(screen.getByText('--')).toBeInTheDocument();
  });

  it('should capitalize patient gender', () => {
    const patientWithLowercaseGender = {
      ...mockPatient,
      gender: 'female',
    };

    render(<PatientHeader patient={patientWithLowercaseGender as any} onCancel={mockOnCancel} />);

    expect(screen.getByText('Female')).toBeInTheDocument();
  });
});
