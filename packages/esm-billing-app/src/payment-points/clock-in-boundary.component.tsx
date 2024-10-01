import { showModal } from '@openmrs/esm-framework';
import React, { useEffect } from 'react';
import { useClockInStatus } from './payment-points.resource';

export const ClockInBoundary = ({ children }: { children: React.ReactNode }) => {
  const { isClockedIn, error, isLoading, userTimesheet } = useClockInStatus();
  const openClockInModal = () => {
    const dispose = showModal('clock-in-modal', {
      closeModal: () => dispose(),
    });
  };

  useEffect(() => {
    if (!isClockedIn) {
      openClockInModal();
    }
  }, [isClockedIn]);

  return <>{children}</>;
};
