import React from 'react';
import { render, screen } from '@testing-library/react';
import MetricsCards from './metrics-cards.component';

test('renders metrics cards', () => {
  renderMetricsCards();

  expect(screen.getByRole('heading', { name: /cumulative bills/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /pending bills/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /fulfilled bills/i })).toBeInTheDocument();
});

function renderMetricsCards() {
  render(<MetricsCards />);
}
