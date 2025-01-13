import { Button } from '@carbon/react';
import { Alarm, IbmCloudSysdigSecure, Shuffle } from '@carbon/react/icons';
import { showModal } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useClockInStatus } from '../payment-points/use-clock-in-status';
import styles from './billing-dashboard.scss';

export const ClockOutStrip = () => {
  const { isClockedIn, globalActiveSheet } = useClockInStatus();
  const { t } = useTranslation();

  if (!isClockedIn) {
    return null;
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
        <Alarm />
        <p className={styles.clockInTime}>
          {t('clockInTime', 'Clocked in on {{clockInDate}}', {
            clockInDate: dayjs(globalActiveSheet.clockIn).format('D MMM YYYY, HH:mm A'),
          })}
        </p>
        <span className={styles.middot}>&middot;</span>
        <p className={styles.cashPointName}>{globalActiveSheet.cashPoint.name}</p>
      </div>
      <div>
        <Button kind="ghost" renderIcon={Shuffle} onClick={openClockInModal}>
          Switch Payment Point
        </Button>
        <Button className={styles.clockIn} onClick={openClockOutModal} kind="danger" renderIcon={IbmCloudSysdigSecure}>
          Clock Out
        </Button>
      </div>
    </div>
  );
};
