import React, { useEffect, useState } from 'react';
import { GetProviderLicenceDate } from '../api/api';
import { showToast, useSession } from '@openmrs/esm-framework';
import dayjs from 'dayjs';

const PopupBanner = React.lazy(() => import('./popup-banner.component'));

const ProviderAlertMessage = () => {
  const session = useSession();
  const patientUuid = session?.currentProvider?.uuid;
  const { listDetails, error: licenceError, isLoading: licenceLoading } = GetProviderLicenceDate(patientUuid);
  const [shouldShowNotification, setShouldShowNotification] = useState(false);
  const [formattedExpiryDate, setFormattedExpiryDate] = useState('');

  useEffect(() => {
    if (patientUuid && listDetails) {
      const licenseExpiryDate = listDetails?.attributes?.find(
        (attr) => attr?.attributeType?.display === 'License Expiry Date',
      )?.value;
      const formattedDate = licenseExpiryDate ? dayjs(licenseExpiryDate).format('YYYY-MM-DD') : '';
      setFormattedExpiryDate(formattedDate);
      setShouldShowNotification(true);
    }
  }, [licenceLoading, patientUuid, listDetails]);

  return <div>{shouldShowNotification && <PopupBanner expiryDate={formattedExpiryDate} />}</div>;
};

export default ProviderAlertMessage;
