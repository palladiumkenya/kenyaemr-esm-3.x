import '@testing-library/jest-dom/extend-expect';

declare global {
  interface Window {
    openmrsBase: string;
    spaBase: string;
  }
}

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultNameSpace: string) => defaultNameSpace,
  }),
}));

window.openmrsBase = '/openmrs';
window.spaBase = '/spa';
window.getOpenmrsSpaBase = () => '/openmrs/spa/';
window.HTMLElement.prototype.scrollIntoView = jest.fn();
