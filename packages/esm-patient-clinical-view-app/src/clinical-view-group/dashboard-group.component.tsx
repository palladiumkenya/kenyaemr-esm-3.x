import React, { useEffect } from 'react';
import { ExtensionSlot } from '@openmrs/esm-framework';
import { Accordion, AccordionItem } from '@carbon/react';
import { registerNavGroup } from '@openmrs/esm-patient-common-lib';
import styles from './dashboard-group.scss';

export interface DashboardGroupExtensionProps {
  title: string;
  slotName?: string;
  basePath: string;
  isExpanded?: boolean;
}

export const DashboardGroupExtension = ({ title, slotName, basePath, isExpanded }: DashboardGroupExtensionProps) => {
  useEffect(() => {
    registerNavGroup(slotName);
  }, [slotName]);

  return (
    <div className={styles.accordionContainer}>
      <Accordion>
        <AccordionItem
          className={styles.accordionItem}
          open={isExpanded ?? true}
          title={title}
          style={{ borderBottom: 'none' }}>
          <ExtensionSlot style={{ width: '100%', minWidth: '15rem' }} name={slotName ?? title} state={{ basePath }} />
        </AccordionItem>
      </Accordion>
    </div>
  );
};
