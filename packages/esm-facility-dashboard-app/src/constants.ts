import dayjs from 'dayjs';

export const moduleName = '@kenyaemr/esm-facility-dashboard-app';
export const etlBasePath = `${window.spaBase}`;

export const today = () => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export const sevenDaysAgo = () => {
  return dayjs().subtract(7, 'day').toDate();
};

export const DATE_PICKER_CONTROL_FORMAT = 'd/m/Y';

export const DATE_PICKER_FORMAT = 'DD/MM/YYYY';

export const formatNewDate = (date: Date | null | undefined) => {
  return date ? new Date(date) : '';
};

// Generate Dammy dates
export const sevenDaysRunningDates = (index: number, endDate: Date = new Date()): string => {
  const date = new Date(endDate);
  date.setDate(date.getDate() - index);
  return date.toISOString().split('T')[0];
};

export const formattedDate = (date: Date) => {
  return date ? dayjs(date).format(DATE_PICKER_FORMAT) : '';
};

export const getNumberOfDays = (startDate?: Date, endDate?: Date) => {
  if (!startDate || !endDate) {
    return 7;
  }
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  return end.diff(start, 'day');
};
