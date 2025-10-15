import { useActiveSheet } from './payment-points.resource';

export const useClockInStatus = () => {
  const { timesheets, error, isLoading } = useActiveSheet();

  const globalActiveSheet = timesheets.find((sheet) => sheet.clockIn && !sheet.clockOut);

  return {
    globalActiveSheet,
    isClockedIn: Boolean(globalActiveSheet),
    error: error,
    isLoading: isLoading,
  };
};
