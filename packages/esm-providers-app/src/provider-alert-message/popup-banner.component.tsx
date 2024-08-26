import React, { useEffect } from 'react';
import { showToast } from '@openmrs/esm-framework';

interface PopupBannerProps {
  expiryDate: string;
}
const PopupBanner: React.FC<PopupBannerProps> = ({ expiryDate }) => {
  useEffect(() => {
    const currentDate = new Date();
    const formattedExpiryDate = new Date(expiryDate);

    if (formattedExpiryDate < currentDate) {
      showToast({
        critical: false,
        kind: 'error',
        description: (
          <div>
            Your Licence Number will be expiring on <strong>{expiryDate}</strong>. Once expired, any services offered
            may not be claimed from SHA.
          </div>
        ),
        title: 'Alert',
        onActionButtonClick: () => {},
      });
    }
  }, [expiryDate]);

  return null;
};
export default PopupBanner;
