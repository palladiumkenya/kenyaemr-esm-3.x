import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './patient-bills-dashboard.scss';
import { EmptySvg } from './empty-svg.component';

type EmptyPatientBillProps = {
  title?: string;
  subTitle?: string;
};
const EmptyPatientBill: React.FC<EmptyPatientBillProps> = ({ title, subTitle }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.emptyStateContainer}>
        <EmptySvg />
        <p className={styles.title}>{title ?? t('searchForAPatient', 'Search for a patient')}</p>
        <p className={styles.subTitle}>
          {subTitle ?? t('enterAnIdNumberOrPatientName', 'Enter an ID number or patient name')}
        </p>
      </div>
    </>
  );
};

export default EmptyPatientBill;
