import React from 'react';
import { screen, render } from '@testing-library/react';
import { BillableServicesDashboard } from './dashboard.component';

test('renders an empty state when there are no services', () => {
  renderBillingDashboard();

  expect(screen.getByText(/Billable Services Management/i)).toBeInTheDocument();
});

function renderBillingDashboard() {
  render(<BillableServicesDashboard />);
}
