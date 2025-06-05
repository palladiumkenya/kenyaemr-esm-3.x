import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@openmrs/esm-framework';
import styles from './patient-summary.scss';

interface PatientSummaryRowProps {
  items: Array<{
    label: string;
    value: any;
    isDate?: boolean;
    isGender?: boolean;
    isNone?: boolean;
  }>;
}

const PatientSummaryRow: React.FC<PatientSummaryRowProps> = ({ items }) => {
  const { t } = useTranslation();

  const getDisplayValue = (item) => {
    if (item.isDate) {
      return item.value ? formatDate(new Date(item.value), { noToday: true }) : '--';
    }
    if (item.isGender) {
      switch (item.value) {
        case 'F':
          return 'Female';
        case 'M':
          return 'Male';
        default:
          return 'Unknown';
      }
    }
    if (item.isNone) {
      return item.value === 'N/A' || item.value === '' ? 'None' : item.value;
    }
    return item.value || '--';
  };

  return (
    <div className={styles.container}>
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} className={styles.content}>
          <p className={styles.label}>{t(item.label, item.label)}</p>
          <p>
            <span className={styles.value}>{getDisplayValue(item)}</span>
          </p>
        </div>
      ))}
    </div>
  );
};

export default PatientSummaryRow;
