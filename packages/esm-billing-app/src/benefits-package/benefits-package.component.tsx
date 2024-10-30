import React, { useState } from 'react';
import BenefitsTable from './table/benefits-table.component';
import { ContentSwitcher, Switch } from '@carbon/react';
import styles from './benefits-package.scss';
import { useTranslation } from 'react-i18next';
import { CardHeader } from '@openmrs/esm-patient-common-lib';
import { useLayoutType } from '@openmrs/esm-framework';
import Benefits from './benefits/benefits.component';

const BenefitsPackage = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const isTablet = useLayoutType() === 'tablet';
  const { t } = useTranslation();

  const switchTabs = [
    { name: t('eligibleBenefits', 'Eligible benefits'), component: <Benefits /> },
    { name: t('preauthRequest', 'Preauth requests'), component: <BenefitsTable /> },
  ];

  return (
    <div className={styles.widgetCard}>
      <CardHeader title={t('sha', 'SHA')}>
        <div className={styles.contentSwitcherWrapper}>
          <ContentSwitcher size={isTablet ? 'md' : 'sm'} onChange={(event) => setActiveIndex(event.index)}>
            {switchTabs.map((tab, index) => (
              <Switch key={index} name={tab.name} text={tab.name} />
            ))}
          </ContentSwitcher>
        </div>
      </CardHeader>
      <div className={styles.tabContent}>{switchTabs[activeIndex].component}</div>
    </div>
  );
};

export default BenefitsPackage;
