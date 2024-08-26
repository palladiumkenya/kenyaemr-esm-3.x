import React, { useEffect, useState } from 'react';
import PopupBanner from './popup-banner.component';
import { GetProviderLicenceDate, GetProviderId } from '../api/api';
const ProviderAlertMessage = () => {
  const [shouldShowNotification, setShouldShowNotification] = useState(false);
  const { patientUuid } = GetProviderId();
  const { listDetails } = GetProviderLicenceDate(patientUuid);
  const licenseExpiryDate = listDetails?.attributes?.find(
    (attr) => attr?.attributeType?.display === 'License Expiry Date',
  )?.value;

  const formattedExpiryDate = licenseExpiryDate
    ? new Date(licenseExpiryDate).toLocaleDateString('en-GB').split('/').reverse().join('-')
    : '';

  useEffect(() => {
    const isProvider = true;
    if (isProvider) {
      setShouldShowNotification((alreadyShowing) => alreadyShowing || true);
    }
  }, []);

  return <div>{shouldShowNotification && <PopupBanner expiryDate={formattedExpiryDate} />}</div>;
};
export default ProviderAlertMessage;
