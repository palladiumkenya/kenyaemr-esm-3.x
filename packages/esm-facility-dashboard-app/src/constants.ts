export const moduleName = '@kenyaemr/esm-facility-dashboard-app';
export const etlBasePath = `${window.spaBase}`;

export const today = () => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export const DATE_PICKER_CONTROL_FORMAT = 'd/m/Y';

export const DATE_PICKER_FORMAT = 'DD/MM/YYYY';

export const formatNewDate = (date: Date | null | undefined) => {
  return date ? new Date(date) : '';
};

export const sevenDaysRunningDates = (index: number) => {
  const date = new Date(today());
  date.setDate(today().getDate() - index);
  const formattedDate = date.toISOString().split('T')[0];
  return formattedDate;
};
