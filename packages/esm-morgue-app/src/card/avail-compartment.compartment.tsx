import React from 'react';
import styles from './compartment.scss';
import { Button, Tag } from '@carbon/react';
import { View } from '@carbon/react/icons';
import { toUpperCase } from '../helpers/expression-helper';
import { ConfigurableLink, formatDate, usePatient, Visit } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

interface AvailableCompartmentProps {
  patientVisitInfo: Visit;
  index: number;
}

const AvailableCompartment: React.FC<AvailableCompartmentProps> = ({ patientVisitInfo, index }) => {
  const { t } = useTranslation();
  const { patient } = usePatient(patientVisitInfo?.patient?.uuid);
  const deceasedName = patient?.name.map((names) => names.text).join(' ');
  const deceasedResidence = patient?.address.map((residence) => residence?.city);
  const deathDate = patient?.deceasedDateTime;
  const formatDeathDate = dayjs(deathDate).format('YYYY-MM-DD');

  return (
    <div className={styles.cardView}>
      <div className={styles.cardRow}>
        <div className={styles.cardLabelWrapper}>
          <div className={styles.cardLabel}>{index + 1}</div>
        </div>
        <span className={styles.deceasedName}>{toUpperCase(deceasedName)}</span>
      </div>
      <div className={styles.cardRow}>
        <span className={styles.deceasedAge}>
          {t('gender', 'Gender: ')}
          {toUpperCase(patient?.gender)}
        </span>
        <span className={styles.deceasedDate}>
          {t('deathDate', 'Death date: ')}
          {formatDeathDate}
        </span>
        <span className={styles.deceasedResidences}>
          {t('area', 'Area: ')} {deceasedResidence}
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
      <ConfigurableLink
        className={styles.configurableLink}
        to={`\${openmrsSpaBase}/patient/${patientVisitInfo?.uuid}/chart/deceased-panel`}>
        <Button className={styles.assignButton} kind="primary" renderIcon={View}>
          {t('viewDetails', 'View details')}
        </Button>
      </ConfigurableLink>
    </div>
  );
};

export default AvailableCompartment;
