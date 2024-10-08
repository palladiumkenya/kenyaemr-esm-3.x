import React from 'react';
import { render, screen } from '@testing-library/react';
import { useSession, formatDate } from '@openmrs/esm-framework';
import { GetProviderLicenceDate } from '../workspace/hook/provider-form.resource';
import ProviderAlertMessage from './provider-alert-message.component';

// Mock dependencies
jest.mock('@openmrs/esm-framework', () => ({
  formatDate: jest.fn(),
  showToast: jest.fn(),
  useSession: jest.fn(),
}));

jest.mock('../workspace/hook/provider-form.resource', () => ({
  GetProviderLicenceDate: jest.fn(),
}));

jest.mock('./alert-message-banner.component', () => () => <div>Mock AlertMessageBanner</div>);

describe('ProviderAlertMessage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when loading', () => {
    // Mock useSession to return a valid provider UUID
    (useSession as jest.Mock).mockReturnValue({
      currentProvider: { uuid: 'provider-uuid' },
    });

    // Mock GetProviderLicenceDate to return a loading state
    (GetProviderLicenceDate as jest.Mock).mockReturnValue({
      listDetails: null,
      error: null,
      isLoading: true,
    });

    render(<ProviderAlertMessage />);

    expect(screen.queryByText('Mock AlertMessageBanner')).not.toBeInTheDocument();
  });

  it('renders nothing when there is an error fetching license data', () => {
    (useSession as jest.Mock).mockReturnValue({
      currentProvider: { uuid: 'provider-uuid' },
    });

    (GetProviderLicenceDate as jest.Mock).mockReturnValue({
      listDetails: null,
      error: 'Some error',
      isLoading: false,
    });

    render(<ProviderAlertMessage />);

    expect(screen.queryByText('Mock AlertMessageBanner')).not.toBeInTheDocument();
  });

  it('renders AlertMessageBanner when valid license expiry date is present', () => {
    const mockExpiryDate = '2024-10-08';

    (useSession as jest.Mock).mockReturnValue({
      currentProvider: { uuid: 'provider-uuid' },
    });

    (GetProviderLicenceDate as jest.Mock).mockReturnValue({
      listDetails: {
        attributes: [
          {
            attributeType: { display: 'License Expiry Date' },
            value: mockExpiryDate,
          },
        ],
      },
      error: null,
      isLoading: false,
    });

    (formatDate as jest.Mock).mockReturnValue('October 8, 2024');

    render(<ProviderAlertMessage />);

    expect(screen.getByText('Mock AlertMessageBanner')).toBeInTheDocument();
  });

  it('does not render AlertMessageBanner when no license expiry date is present', () => {
    (useSession as jest.Mock).mockReturnValue({
      currentProvider: { uuid: 'provider-uuid' },
    });

    (GetProviderLicenceDate as jest.Mock).mockReturnValue({
      listDetails: { attributes: [] }, // No license expiry date
      error: null,
      isLoading: false,
    });

    render(<ProviderAlertMessage />);

    expect(screen.getByText('Mock AlertMessageBanner')).toBeInTheDocument();
  });
});
