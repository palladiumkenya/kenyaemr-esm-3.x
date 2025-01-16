import dayjs from 'dayjs';

export const moduleName = '@kenyaemr/esm-admin-app';
export const etlBasePath = `${window.spaBase}`;

export const today = () => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export const DATE_PICKER_CONTROL_FORMAT = 'd/m/Y';

// to move to a location

export const DATE_PICKER_FORMAT = 'DD/MM/YYYY';

export const formatForDatePicker = (date: Date | null | undefined) => {
  return formatDisplayDate(date, DATE_PICKER_FORMAT);
};

export const formatDisplayDate = (date: Date | null | undefined, format?: string) => {
  return date ? dayjs(date).format(format ?? 'DD-MMM-YYYY') : '';
};
