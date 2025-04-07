declare module '*.css';
declare module '*.scss';
declare module '@carbon/react';
declare module 'react-aria' {
  export const I18nProvider: (...args: any) => JSX.Element;
  export { DateValue } from '@react-types/datepicker';
  export const mergeProps: any;
  export const useLocale: any;
  export const useDateField: any;
  export const useDatePicker: any;
  export const useDateSegment: any;
  export const useFocusRing: any;
  export const useHover: any;
  export const useObjectRef: any;
}
