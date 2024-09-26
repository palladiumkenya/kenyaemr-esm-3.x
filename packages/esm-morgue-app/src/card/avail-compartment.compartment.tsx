import React from 'react';
import styles from './compartment.scss';
import { Button, Tag } from '@carbon/react';
import { View } from '@carbon/react/icons';
import { DeceasedInfo } from '../tables/generic-table.resource';
import { toUpperCase } from '../helpers/expression-helper';
import { formatDate } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';

interface AvailableCompartmentProps {
  patientInfo: DeceasedInfo;
}

const AvailableCompartment: React.FC<AvailableCompartmentProps> = ({ patientInfo }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.cardView}>
      <div className={styles.cardRow}>
        <div className={styles.cardLabelWrapper}>
          <div className={styles.cardLabel}>3</div>
        </div>
        <span className={styles.deceasedName}>{toUpperCase(patientInfo.person.display)}</span>
      </div>
      <div className={styles.cardRow}>
        <span className={styles.deceasedDate}>
          {t('deathDate', 'Death date: ')}
          {formatDate(new Date(patientInfo.person.deathDate))}
        </span>
        <span className={styles.deceasedAge}>
          {t('age', 'Age: ')}
          {patientInfo?.person?.age}
        </span>
        <span className={styles.deceasedResidences}>
          {t('area', 'Area: ')} {patientInfo.person.preferredAddress?.address4}
        </span>
      </div>
      <div className={styles.cardRow}>
        <span className={styles.compartmentStatus}>
          {t('status', 'Status: ')}
          <Tag type="green">{t('logged', 'Logged')}</Tag>
        </span>
        <span className={styles.deceasedNoDays}>{t('daysOnUnit', 'Days on this unit:')}</span>
        <span className={styles.noDays}>4 days</span>
      </div>
      <Button className={styles.assignButton} kind="primary" renderIcon={View}>
        {t('viewDetails', 'View details')}
      </Button>
    </div>
  );
};

export default AvailableCompartment;
