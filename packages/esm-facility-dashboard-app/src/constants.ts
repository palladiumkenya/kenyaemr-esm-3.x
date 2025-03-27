import dayjs from 'dayjs';

export const moduleName = '@kenyaemr/esm-facility-dashboard-app';
export const etlBasePath = `${window.spaBase}`;

export const today = () => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export const sevenDaysAgo = () => {
  const date = today(); // Get today's date
  date.setDate(date.getDate() - 7); // Subtract 7 days
  return date;
};

export const DATE_PICKER_CONTROL_FORMAT = 'd/m/Y';

export const DATE_PICKER_FORMAT = 'DD/MM/YYYY';

export const formatNewDate = (date: Date | null | undefined) => {
  return date ? new Date(date) : '';
};

// Generate Dammy dates
export const sevenDaysRunningDates = (index: number) => {
  const date = new Date(today());
  date.setDate(today().getDate() - index);
  const formattedDate = date.toISOString().split('T')[0];
  return formattedDate;
};

export const formattedDate = (date: Date) => {
  return date ? dayjs(date).format(DATE_PICKER_FORMAT) : '';
};
