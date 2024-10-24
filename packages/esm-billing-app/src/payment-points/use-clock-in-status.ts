import { useProviderUUID, useTimeSheets } from './payment-points.resource';

export const useClockInStatus = (paymentPointUUID?: string) => {
  const { timesheets, error, isLoading } = useTimeSheets();
  const { providerUUID, isLoading: isLoadingProviderUUID, error: providerUUIDError } = useProviderUUID();
  const globalActiveSheet = timesheets.find(
    (sheet) => sheet.cashier.uuid === providerUUID && sheet.clockIn && !sheet.clockOut,
  );

  const localActiveSheet = timesheets.find(
    (sheet) =>
      sheet.cashier.uuid === providerUUID &&
      sheet.clockIn &&
      !sheet.clockOut &&
      paymentPointUUID &&
      sheet.cashPoint.uuid === paymentPointUUID,
  );

  return {
    globalActiveSheet,
    localActiveSheet,
    isClockedInSomewhere: Boolean(globalActiveSheet),
    error: error || providerUUIDError,
    isLoading: isLoading || isLoadingProviderUUID,
    isClockedInCurrentPaymentPoint: Boolean(localActiveSheet),
  };
};
