import React, { useEffect, useState } from 'react';
import { formatDate, showToast, useSession } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import AlertMessageBanner from './alert-message-banner.component';
import { GetProviderLicenceDate } from '../workspace/hook/provider-form.resource';

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
      const formattedDate = licenseExpiryDate ? formatDate(licenseExpiryDate) : '';
      setFormattedExpiryDate(formattedDate);
      setShouldShowNotification(true);
    }
  }, [licenceLoading, patientUuid, listDetails]);

  return <div>{shouldShowNotification && <AlertMessageBanner expiryDate={formattedExpiryDate} />}</div>;
};

export default ProviderAlertMessage;
