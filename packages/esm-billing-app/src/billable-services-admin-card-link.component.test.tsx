import React from 'react';
import { render, screen } from '@testing-library/react';
import BillableServicesCardLink from './billable-services-admin-card-link.component';

describe('BillableServicesCardLink', () => {
  test('should render billable services admin link', () => {
    renderBillableServicesCardLink();
    const billiableText = screen.getAllByText(/Billable Services/i);
    expect(billiableText[0]).toHaveClass('heading');
    expect(billiableText[1]).toHaveClass('content');

    const billiableServiceLink = screen.getByRole('link', { name: /Billable Services/i });
    expect(billiableServiceLink).toHaveAttribute('href', '/spa/billable-services');
  });
});

function renderBillableServicesCardLink() {
  render(<BillableServicesCardLink />);
}
