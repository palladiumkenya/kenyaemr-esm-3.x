import React from 'react';
import { render, screen } from '@testing-library/react';
import MetricsCards from './metrics-cards.component';
import { useBills } from '../billing.resource';
import { billsSummary } from '../../../../__mocks__/bills.mock';

const mockUseBills = useBills as jest.Mock;

jest.mock('../billing.resource', () => ({
  useBills: jest.fn(),
}));

test('renders metrics cards', () => {
  mockUseBills.mockReturnValue({ isLoading: false, bills: billsSummary, error: null });
  renderMetricsCards();
  expect(screen.getByRole('heading', { name: /cumulative bills/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /pending bills/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /paid bills/i })).toBeInTheDocument();
});

function renderMetricsCards() {
  render(<MetricsCards />);
}
