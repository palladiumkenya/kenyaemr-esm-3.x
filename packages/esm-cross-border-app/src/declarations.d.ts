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
