import { Accordion, AccordionItem } from '@carbon/react';
import { CarbonIconType } from '@carbon/react/icons';
import { ExtensionSlot } from '@openmrs/esm-framework';
import { registerNavGroup } from '@openmrs/esm-patient-common-lib';
import React, { useEffect } from 'react';
import styles from './nav.scss';
import { useTranslation } from 'react-i18next';
type Props = {
  title: string;
  slotName?: string;
  basePath: string;
  isExpanded?: boolean;
  icon?: CarbonIconType;
};
const DashboardGroupExtension: React.FC<Props> = ({ basePath, title, isExpanded, slotName, icon }) => {
  const { t } = useTranslation();
  useEffect(() => {
    registerNavGroup(slotName);
  }, [slotName]);

  return (
    <Accordion>
      <AccordionItem
        className={styles.item}
        open={isExpanded ?? true}
        title={
          <span className={styles.itemTitle}>
            {icon && React.createElement(icon)}
            {t(title)}
          </span>
        }>
        <ExtensionSlot name={slotName} state={{ basePath }} />
      </AccordionItem>
    </Accordion>
  );
};

export default DashboardGroupExtension;
