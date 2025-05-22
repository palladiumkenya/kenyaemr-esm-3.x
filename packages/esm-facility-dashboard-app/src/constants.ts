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

export const formattedDate = (date: Date) => {
  return date ? dayjs(date).format(DATE_PICKER_FORMAT) : '';
};

export const thirtyDays = () => {
  return dayjs().subtract(30, 'day').toDate();
};
