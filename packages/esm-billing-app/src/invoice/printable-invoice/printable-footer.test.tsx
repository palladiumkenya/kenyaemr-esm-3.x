import React from 'react';
import { screen, render } from '@testing-library/react';
import PrintableFooter from './printable-footer.component';

jest.mock('../../billing.resource', () => ({
  useDefaultFacility: jest.fn(),
}));

describe('PrintableFooter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render PrintableFooter component', () => {
    render(<PrintableFooter facilityInfo={{ display: 'MTRH', uuid: 'mtrh-uuid' }} />);
    const footer = screen.getByText('MTRH');
    expect(footer).toBeInTheDocument();
  });
});
