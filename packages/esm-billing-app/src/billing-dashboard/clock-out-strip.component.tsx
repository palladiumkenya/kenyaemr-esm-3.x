import React from 'react';
import { Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { IbmCloudSysdigSecure, Shuffle, Location as LocationIcon } from '@carbon/react/icons';
import { formatDate, parseDate, showModal, useLayoutType } from '@openmrs/esm-framework';

import { useClockInStatus } from '../bill-administration/payment-points/use-clock-in-status';

import ClockInButton from './clock-in-button.component';
import styles from './billing-dashboard.scss';

export const ClockOutStrip = () => {
  const { isClockedIn, globalActiveSheet } = useClockInStatus();
  const controlSize = useLayoutType() === 'tablet' ? 'md' : 'sm';
  const { t } = useTranslation();

  if (!isClockedIn) {
    return (
      <div className={styles.clockInContainer}>
        <ClockInButton />
      </div>
    );
  }

  const openClockOutModal = () => {
    const dispose = showModal('clock-out-modal', {
      closeModal: () => dispose(),
    });
  };

  const openClockInModal = () => {
    const dispose = showModal('clock-in-modal', {
      closeModal: () => dispose(),
    });
  };

  return (
    <div className={styles.clockOutStrip}>
      <div className={styles.clockOutInfo}>
        <p className={styles.clockInTime}>
          {t('clockInTime', 'Clocked in on {{clockInDate}}', {
            clockInDate: formatDate(parseDate(globalActiveSheet.clockIn), { noToday: true, mode: 'wide' }),
          })}
        </p>
        <span className={styles.middot}>&middot;</span>
        <p className={styles.cashPointName}>{globalActiveSheet.cashPoint.name}</p>
      </div>
      <div>
        <Button size={controlSize} kind="ghost" renderIcon={Shuffle} onClick={openClockInModal}>
          {t('switchPaymentPoint', 'Switch Payment Point')}
        </Button>
        <Button
          size={controlSize}
          className={styles.clockIn}
          onClick={openClockOutModal}
          kind="danger"
          renderIcon={IbmCloudSysdigSecure}>
          {t('clockOut', 'Clock Out')}
        </Button>
      </div>
    </div>
  );
};
