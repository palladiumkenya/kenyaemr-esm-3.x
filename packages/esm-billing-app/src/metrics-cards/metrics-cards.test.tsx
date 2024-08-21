import React from 'react';
import { render, screen } from '@testing-library/react';
import MetricsCards from './metrics-cards.component';
import { useBills } from '../billing.resource';
import { billsSummary } from '../../../../__mocks__/bills.mock';

const mockUseBills = useBills as jest.Mock;

jest.mock('../billing.resource', () => ({
  useBills: jest.fn(),
}));

describe('MetricsCards', () => {
  test('renders loading state', () => {
    mockUseBills.mockReturnValue({ isLoading: true, bills: [], error: null });
    renderMetricsCards();
    expect(screen.getByText(/Loading bill metrics.../i)).toBeInTheDocument();
  });

  test('renders error state', () => {
    mockUseBills.mockReturnValue({ isLoading: false, bills: [], error: new Error('Internal server error') });
    renderMetricsCards();
    expect(
      screen.getByText(
        /Sorry, there was a problem displaying this information. You can try to reload this page, or contact the site administrator and quote the error code above./i,
      ),
    ).toBeInTheDocument();
  });

  test('renders metrics cards', () => {
    mockUseBills.mockReturnValue({ isLoading: false, bills: billsSummary, error: null });
    renderMetricsCards();
    expect(screen.getByText('Cumulative Bills')).toBeInTheDocument();
    expect(screen.getByText('Pending Bills')).toBeInTheDocument();
    expect(screen.getByText('Paid Bills')).toBeInTheDocument();
  });
});

function renderMetricsCards() {
  render(<MetricsCards />);
}
