import React from 'react';
import { useTranslation } from 'react-i18next';
import { SideNav } from '@carbon/react';
import { attach, ExtensionSlot, isDesktop, useLayoutType } from '@openmrs/esm-framework';
import styles from './left-panel.scss';

attach('nav-menu-slot', 'admin-left-panel');

const LeftPanel: React.FC = () => {
  const { t } = useTranslation();
  const layout = useLayoutType();

  return (
    isDesktop(layout) && (
      <SideNav
        aria-label={t('facilitydashboardLeftPannel', 'facility Dashboard Left Panel')}
        className={styles.leftPanel}
        expanded>
        <ExtensionSlot name="facility-dashboard-left-panel-slot" />
      </SideNav>
    )
  );
};

export default LeftPanel;
