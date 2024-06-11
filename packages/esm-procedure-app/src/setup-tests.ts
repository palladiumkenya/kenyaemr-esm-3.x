import '@testing-library/jest-dom/extend-expect';

window.URL.createObjectURL = jest.fn();
global.openmrsBase = '/openmrs';
global.spaBase = '/spa';
global.getOpenmrsSpaBase = () => '/openmrs/spa/';
global.Response = Object as any;
