declare module '*.css';
declare module '*.scss';
declare module '@carbon/react';
declare module '@openmrs/esm-styleguide/src/left-nav' {
  import { SideNavProps } from '@carbon/react';

  export interface LeftNavMenuProps extends SideNavProps {
    isChildOfHeader?: boolean;
  }

  export const LeftNavMenu: React.ForwardRefExoticComponent<LeftNavMenuProps & React.RefAttributes<HTMLElement>>;
}

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
