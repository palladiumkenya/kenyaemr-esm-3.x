import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './bed-layout.scss';
import BedCard from '../bed/bed.component';

const BedLayout: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className={styles.bedLayoutContainer}>
        <BedCard
          headerLabel={t('awaitingAdmissionHeader', 'Awaiting Admission')}
          label={t('totalCount', 'total')}
          value={'0'}
        />
        <BedCard headerLabel={t('admittedHeader', 'Admitted')} label={t('totalCount', 'total')} value={'0'} />
        <BedCard headerLabel={t('dischargedHeader', 'Discharged')} label={t('totalCount', 'total')} value={'0'} />
        <BedCard headerLabel={t('dischargedHeader', 'Discharged')} label={t('totalCount', 'total')} value={'0'} />
        <BedCard headerLabel={t('dischargedHeader', 'Discharged')} label={t('totalCount', 'total')} value={'0'} />
        <BedCard headerLabel={t('dischargedHeader', 'Discharged')} label={t('totalCount', 'total')} value={'0'} />
        <BedCard headerLabel={t('dischargedHeader', 'Discharged')} label={t('totalCount', 'total')} value={'0'} />
        <BedCard headerLabel={t('dischargedHeader', 'Discharged')} label={t('totalCount', 'total')} value={'0'} />
      </div>
    </>
  );
};

export default BedLayout;
