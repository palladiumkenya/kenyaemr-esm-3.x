import React from 'react';
import { screen, render } from '@testing-library/react';
import { BillingDashboard } from './billing-dashboard.component';

test('renders an empty state when there are no billing records', () => {
  renderBillingDashboard();

  expect(screen.getByTitle(/empty data illustration/i)).toBeInTheDocument();
  expect(screen.getByText(/there are no billing records to display/i)).toBeInTheDocument();
});

function renderBillingDashboard() {
  render(<BillingDashboard />);
}
