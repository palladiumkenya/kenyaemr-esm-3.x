import React, { useEffect } from 'react';
import { showToast } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';

interface PopupBannerProps {
  expiryDate: string;
}
const PopupBanner: React.FC<PopupBannerProps> = ({ expiryDate }) => {
  const { t } = useTranslation();
  const message = t(
    'message',
    `Your License Number will be expiring on ${expiryDate} Once expired, any services offered may not be claimed from SHA.`,
  );
  useEffect(() => {
    const currentDate = new Date();
    const formattedExpiryDate = new Date(expiryDate);

    if (formattedExpiryDate < currentDate) {
      showToast({
        critical: false,
        kind: 'error',
        description: <div>{message}</div>,
        title: 'Alert',
        onActionButtonClick: () => {},
      });
    }
  }, [expiryDate]);

  return null;
};
export default PopupBanner;
