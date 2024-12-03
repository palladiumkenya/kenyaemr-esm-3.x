import { useActiveSheet } from './payment-points.resource';

export const useClockInStatus = (paymentPointUUID?: string) => {
  const { timesheets, error, isLoading } = useActiveSheet();

  const globalActiveSheet = timesheets.find((sheet) => sheet.clockIn && !sheet.clockOut);

  const localActiveSheet = timesheets.find(
    (sheet) => sheet.clockIn && !sheet.clockOut && paymentPointUUID && sheet.cashPoint.uuid === paymentPointUUID,
  );

  return {
    globalActiveSheet,
    localActiveSheet,
    isClockedInSomewhere: Boolean(globalActiveSheet),
    error: error,
    isLoading: isLoading,
    isClockedInCurrentPaymentPoint: Boolean(localActiveSheet),
  };
};
