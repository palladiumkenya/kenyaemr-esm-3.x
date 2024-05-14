import React from 'react';
import { render, screen } from '@testing-library/react';
import BillableServicesCardLink from './billable-services-admin-card-link.component';

describe('BillableServicesCardLink', () => {
  test('should render billable services admin link', () => {
    renderBillableServicesCardLink();
    const manageBillableServicesText = screen.getByText('Manage billable services');
    expect(manageBillableServicesText).toHaveClass('heading');

    const billableText = screen.getByText('Billable Services');
    expect(billableText).toHaveClass('content');

    const billableServiceLink = screen.getByRole('link', { name: /Billable Services/i });
    expect(billableServiceLink).toHaveAttribute('href', '/spa/billable-services');
  });
});

function renderBillableServicesCardLink() {
  render(<BillableServicesCardLink />);
}
