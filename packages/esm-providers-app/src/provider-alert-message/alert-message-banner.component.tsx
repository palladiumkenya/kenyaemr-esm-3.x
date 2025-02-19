import React, { useEffect } from 'react';
import { showToast } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';

interface AlertMessageBannerProps {
  expiryDate: string;
}
const AlertMessageBanner: React.FC<AlertMessageBannerProps> = ({ expiryDate }) => {
  const { t } = useTranslation();
  const messageText = t(
    'messageText',
    `Your License Number will be expiring on ${expiryDate} Once expired, any services offered may not be claimed from SHA.`,
  );
  useEffect(() => {
    const currentDate = new Date();
    const formattedExpiryDate = new Date(expiryDate);

    if (formattedExpiryDate < currentDate) {
      showToast({
        critical: false,
        kind: 'error',
        description: <div>{messageText}</div>,
        title: 'Alert',
        onActionButtonClick: () => {},
      });
    }
  }, [expiryDate, messageText]);

  return null;
};
export default AlertMessageBanner;
