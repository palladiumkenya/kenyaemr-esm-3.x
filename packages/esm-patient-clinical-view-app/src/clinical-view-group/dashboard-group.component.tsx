import React, { useEffect } from 'react';
import { ExtensionSlot, useLayoutType } from '@openmrs/esm-framework';
import { SideNavItems, SideNavMenu, SideNavDivider } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { registerNavGroup } from '@openmrs/esm-patient-common-lib';
import styles from './dashboard-group.scss';

export interface DashboardGroupExtensionProps {
  title: string;
  slotName?: string;
  basePath: string;
  isExpanded?: boolean;
  isChild?: boolean;
}

export const DashboardGroupExtension: React.FC<DashboardGroupExtensionProps> = ({
  title,
  slotName,
  basePath,
  isExpanded,
  isChild,
}) => {
  const isTablet = useLayoutType() === 'tablet';
  useEffect(() => {
    registerNavGroup(slotName);
  }, [slotName]);

  return (
    <SideNavItems className={styles.sideMenuItems} isSideNavExpanded={true}>
      <SideNavMenu
        className={isChild && styles.sideNavMenu}
        large={isTablet}
        defaultExpanded={isExpanded ?? true}
        title={title}>
        <ExtensionSlot style={{ width: '100%', minWidth: '15rem' }} name={slotName ?? title} state={{ basePath }} />
      </SideNavMenu>
    </SideNavItems>
  );
};
