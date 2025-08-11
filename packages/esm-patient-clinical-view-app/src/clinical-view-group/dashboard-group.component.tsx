import React, { useEffect } from 'react';
import { ExtensionSlot, useLayoutType } from '@openmrs/esm-framework';
import { SideNavItems, SideNavMenu } from '@carbon/react';
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
  // TODO: ensure nav group is working

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
