import React from 'react';
import { render } from '@testing-library/react';
import AlertMessageBanner from './alert-message-banner.component';
import { showToast } from '@openmrs/esm-framework';

describe('AlertMessageBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows toast when expiryDate is in the past', () => {
    const pastDate = '2023-09-15';
    render(<AlertMessageBanner expiryDate={pastDate} />);

    expect(showToast).toHaveBeenCalledWith({
      critical: false,
      kind: 'error',
      description: expect.anything(),
      title: 'Alert',
      onActionButtonClick: expect.any(Function),
    });
  });

  it('does not show toast when expiryDate is in the future', () => {
    const futureDate = '2025-01-01';
    render(<AlertMessageBanner expiryDate={futureDate} />);

    expect(showToast).not.toHaveBeenCalled();
  });
  it('shows toast with correct message text', () => {
    const pastDate = '2023-09-15';
    render(<AlertMessageBanner expiryDate={pastDate} />);

    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({
        critical: false,
        kind: 'error',
        description: expect.anything(),
        title: 'Alert',
        onActionButtonClick: expect.any(Function),
      }),
    );
  });
});
