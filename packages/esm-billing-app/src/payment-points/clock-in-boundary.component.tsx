import { showModal } from '@openmrs/esm-framework';
import React, { useEffect } from 'react';
import { useClockInStatus } from './use-clock-in-status';

// Wrap this component around each place where a user should be clocked in to access
export const ClockInBoundary = ({ children }: { children: React.ReactNode }) => {
  const { isClockedInSomewhere, isLoading } = useClockInStatus();
  const openClockInModal = () => {
    const dispose = showModal('clock-in-modal', {
      closeModal: () => dispose(),
    });
  };

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!isClockedInSomewhere) {
      openClockInModal();
    }
  }, [isClockedInSomewhere, isLoading]);

  return <>{children}</>;
};
