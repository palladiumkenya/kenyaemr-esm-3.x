import React, { useEffect } from 'react';
import { ExtensionSlot, useLayoutType } from '@openmrs/esm-framework';
import { Accordion, AccordionItem, SideNavItems, SideNavMenu, SideNavMenuItem } from '@carbon/react';
import { registerNavGroup } from '@openmrs/esm-patient-common-lib';
import styles from './dashboard-group.scss';

export interface DashboardGroupExtensionProps {
  title: string;
  slotName?: string;
  basePath: string;
  isExpanded?: boolean;
}

export const DashboardGroupExtension: React.FC<DashboardGroupExtensionProps> = ({
  title,
  slotName,
  basePath,
  isExpanded,
}) => {
  const isTablet = useLayoutType() === 'tablet';
  useEffect(() => {
    registerNavGroup(slotName);
  }, [slotName]);

  return (
    <SideNavItems className={styles.sideMenuItems} isSideNavExpanded={true}>
      <SideNavMenu defaultExpanded={isExpanded ?? true} title={title}>
        <ExtensionSlot style={{ width: '100%', minWidth: '15rem' }} name={slotName ?? title} state={{ basePath }} />
      </SideNavMenu>
    </SideNavItems>
  );
};
