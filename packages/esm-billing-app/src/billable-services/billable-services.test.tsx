import React from 'react';
import { render, screen } from '@testing-library/react';
import BillableServices from './billable-services.component';

describe('BillableService', () => {
  test('should render billable services', () => {
    renderBillableServices();
    const title = screen.getByRole('heading', { name: /Billable services/i });
    expect(title).toBeInTheDocument();
  });
});

function renderBillableServices() {
  render(<BillableServices />);
}
