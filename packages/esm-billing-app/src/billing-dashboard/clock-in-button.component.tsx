import { Button, ButtonSkeleton } from '@carbon/react';
import { IbmCloudLogging } from '@carbon/react/icons';
import { showModal, useLayoutType } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useClockInStatus } from '../bill-administration/payment-points/use-clock-in-status';
import styles from './billing-dashboard.scss';

const ClockInButton = () => {
  const { t } = useTranslation();
  const { isClockedIn, isLoading } = useClockInStatus();
  const controlSize = useLayoutType() === 'tablet' ? 'md' : 'sm';

  const openClockInModal = () => {
    const dispose = showModal('clock-in-modal', {
      closeModal: () => dispose(),
    });
  };

  if (isLoading) {
    return <ButtonSkeleton className={styles.clockInSkeleton} />;
  }

  if (isClockedIn) {
    return null;
  }

  return (
    <Button
      onClick={openClockInModal}
      className={styles.clockIn}
      renderIcon={IbmCloudLogging}
      iconDescription="Clock In"
      size={controlSize}>
      {t('clockIn', 'Clock In')}
    </Button>
  );
};

export default ClockInButton;
