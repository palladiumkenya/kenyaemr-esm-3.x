import React from 'react';
import { screen, render } from '@testing-library/react';
import { ChargeItemsDashboard } from './dashboard.component';

test('renders an empty state when there are no services', () => {
  renderBillingDashboard();
});

function renderBillingDashboard() {
  render(<ChargeItemsDashboard />);
}
