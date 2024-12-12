import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import React, { useEffect } from 'react';
import { useClockInStatus } from './use-clock-in-status';

// Wrap this component around each place where a user should be clocked in to access
export const ClockInBoundary = ({ children }: { children: React.ReactNode }) => {
  const { isClockedIn, isLoading, error } = useClockInStatus();

  const openClockInModal = () => {
    launchPatientWorkspace('clock-in-workspace', {
      disableCancelling: true,
    });
  };

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (error) {
      return;
    }

    if (!isClockedIn) {
      openClockInModal();
    }
  }, [error, isClockedIn, isLoading]);

  if (error) {
    return null;
  }

  return <>{children}</>;
};
