import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './patient-bills-dashboard.scss';
import { EmptySvg } from './empty-svg.component';
import { Button } from '@carbon/react';
import { Add } from '@carbon/react/icons';
type BaseEmptyPatientBillProps = {
  title?: string;
  subTitle?: string;
};

type WithLaunchForm = BaseEmptyPatientBillProps & {
  launchForm: () => void;
  buttonText: string;
};

type WithoutLaunchForm = BaseEmptyPatientBillProps & {
  launchForm?: never;
  buttonText?: never;
};

type EmptyPatientBillProps = WithLaunchForm | WithoutLaunchForm;

const EmptyPatientBill: React.FC<EmptyPatientBillProps> = ({ title, subTitle, launchForm, buttonText }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.emptyStateContainer}>
      <EmptySvg />
      <p className={styles.title}>{title ?? t('searchForAPatient', 'Search for a patient')}</p>
      <p className={styles.subTitle}>
        {subTitle ?? t('enterAnIdNumberOrPatientName', 'Enter an ID number or patient name')}
      </p>
      {launchForm && buttonText && (
        <Button onClick={launchForm} kind="ghost" renderIcon={Add}>
          {buttonText}
        </Button>
      )}
    </div>
  );
};

export default EmptyPatientBill;
