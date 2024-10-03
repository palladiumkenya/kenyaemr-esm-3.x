import { showModal } from '@openmrs/esm-framework';
import React, { useEffect } from 'react';
import { useClockInStatus } from './payment-points.resource';

// Wrap this component around each place where a user should be clocked in to access
export const ClockInBoundary = ({ children }: { children: React.ReactNode }) => {
  const { isClockedIn } = useClockInStatus();
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
