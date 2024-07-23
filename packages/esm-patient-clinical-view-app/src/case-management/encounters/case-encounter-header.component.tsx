import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './case-encounter-header.scss';
import { ComboBox } from '@carbon/react';

const CaseEncounterHeader = () => {
  const { t } = useTranslation();
  const title = t('caseEncounter', 'Case management encounters');

  const items = [
    { id: '1', text: 'Clinical Encounter' },
    { id: '2', text: 'High IIT Intervention' },
    { id: '3', text: 'CCC Defaulter Tracing' },
  ];

  return (
    <div className={styles.headerContainer}>
      <span className={styles.headerTitle}>{title}</span>
      <div className={styles.actionBtn}>
        <ComboBox
          onChange={() => {}}
          id="select-form"
          items={items}
          itemToString={(item) => (item ? item.text : '')}
          placeholder="Select forms"
          className={styles.comboBox}
        />
      </div>
    </div>
  );
};

export default CaseEncounterHeader;
