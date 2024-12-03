import { showModal } from '@openmrs/esm-framework';
import React, { useEffect } from 'react';
import { useClockInStatus } from './use-clock-in-status';

// Wrap this component around each place where a user should be clocked in to access
export const ClockInBoundary = ({ children }: { children: React.ReactNode }) => {
  const { isClockedInSomewhere, isLoading, error } = useClockInStatus();

  const openClockInModal = () => {
    const dispose = showModal('clock-in-modal', {
      closeModal: () => dispose(),
    });
  };

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (error) {
      return;
    }

    if (!isClockedInSomewhere) {
      openClockInModal();
    }
  }, [error, isClockedInSomewhere, isLoading]);

  if (error) {
    return null;
  }

  return <>{children}</>;
};
