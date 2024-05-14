import React from 'react';
import { render, screen } from '@testing-library/react';
import BillableServices from './billable-services.component';

describe('BillableService', () => {
  test('should render billable services', () => {
    renderBillableServices();
    expect(screen.getByText(/Empty data illustration/i)).toBeInTheDocument();
    expect(screen.getByText(/There are no {{displayText}} to display for this patient/i)).toBeInTheDocument();
  });
});

function renderBillableServices() {
  render(<BillableServices />);
}
