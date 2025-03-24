export const moduleName = '@kenyaemr/esm-admin-app';
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

/**
 * Represents the error response from the Health Care Worker Registry API
 * when no valid credentials are provided or found.
 * @constant {string}
 */
export const HWR_API_NO_CREDENTIALS = 'NO_API_CREDENNTIALS';
/**
 * Represents the error response from the Health Care Worker Registry API
 * when when resource is not found
 * @constant {string}
 */
export const RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND';
/**
 * Represents the error response from the Health Care Worker Registry API
 * When Uknown error occures
 * @constant {string}
 */
export const UNKNOWN = 'UNKNOWN';

/**
 * Represents the error response from the Health Care Worker Registry API
 * when when prover with given identifier is not found
 * @constant {string}
 */
export const PROVIDER_NOT_FOUND = 'PROVIDER_NOT_FOUND';
export const ROLE_CATEGORIES = {
  CORE_INVENTORY: 'Core Inventory Roles',
};
export const SECTIONS = {
  LOGIN: 'login',
  ROLES: 'roles',
  DEMOGRAPHIC: 'demographic',
  PROVIDER: 'provider',
};
