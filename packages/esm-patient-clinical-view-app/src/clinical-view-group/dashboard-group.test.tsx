import React from 'react';
import { render, screen } from '@testing-library/react';
import * as openmrsEsmFramework from '@openmrs/esm-patient-common-lib';
import { DashboardGroupExtension } from './dashboard-group.component';
import userEvent from '@testing-library/user-event';

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  registerNavGroup: jest.fn(),
}));

describe('DashboardGroupExtension', () => {
  const defaultProps = {
    title: 'Test Title',
    slotName: 'test-slot',
    basePath: '/base/path',
    isExpanded: true,
  };

  test('renders with default props', async () => {
    const user = userEvent.setup();
    render(<DashboardGroupExtension {...defaultProps} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    const accodionButton = screen.getByRole('button', { name: 'Test Title' });
    expect(accodionButton).toHaveAttribute('aria-expanded', 'true');

    // should collapse the accordion
    await userEvent.click(accodionButton);
    expect(accodionButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('calls registerNavGroup with slotName', () => {
    render(<DashboardGroupExtension {...defaultProps} />);
    expect(openmrsEsmFramework.registerNavGroup).toHaveBeenCalledWith('test-slot');
  });
});
