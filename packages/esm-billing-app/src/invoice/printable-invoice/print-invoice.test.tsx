import React from 'react';
import { screen, render } from '@testing-library/react';
import PrintableInvoice from './printable-invoice.component';
import { mockBills } from '../../../../../__mocks__/bills.mock';
import { mockPatient } from '../../../../../__mocks__/patient.mock';
import { extractString } from '../../helpers';

describe('PrintableInvoice', () => {
  test('should render PrintableInvoice', () => {
    render(
      <PrintableInvoice
        bill={{ ...mockBills, dateCreated: '2021-01-18T09:42:40+00:00', tenderedAmount: 650 }}
        patient={mockPatient}
        isPrinting={false}
        facilityInfo={{ display: 'facility test' }}
      />,
    );
    expect(screen.getByText('Invoice')).toBeInTheDocument();
    expect(screen.getByText('Billed to')).toBeInTheDocument();
    const lineItems = mockBills.lineItems;
    lineItems.forEach((item, index) => {
      expect(screen.getByText(`${index + 1} - ${extractString(item.billableService)}`)).toBeInTheDocument();
    });
    expect(screen.getAllByText('facility test')).toHaveLength(2);
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(
      screen.getByText(
        /The invoice has been electronically generated and is a valid document. It was created by {{userName}} on {{date}} at {{time}}/,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Invoice #')).toBeInTheDocument();
    expect(screen.getByText('Invoice date')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText(/Pending/i)).toBeInTheDocument();
  });
});
