import React from 'react';
import styles from './nextOfKinDetails.scss';
import { useTranslation } from 'react-i18next';
import { Tag } from '@carbon/react';
import toUpper from 'lodash/toUpper';
import capitalize from 'lodash/capitalize';
import { formatDateTime } from '../../utils/utils';
import { CardHeader } from '@openmrs/esm-patient-common-lib';

interface NextOfKinProps {
  nextOfKin?: {
    name: string;
    phone: string;
    address: string;
    relationship: string;
  };
}

const NextOfKinDetails: React.FC<NextOfKinProps> = ({ nextOfKin }) => {
  const { t } = useTranslation();

  if (!nextOfKin) {
    return <div>{t('noAvailable', 'No available')}</div>;
  }

  return (
    <div className={styles.nextOfKinDetailsContainer}>
      <div className={styles.nextOfKinTitle}>
        <span>{toUpper(t('nextOfKin', 'Next of Kin'))}</span>
        <span>{formatDateTime(new Date())}</span>
      </div>
      <div className={styles.nextOfKinName}>
        <span>
          {toUpper(nextOfKin?.name)} &middot;
          <Tag size="md">{capitalize(nextOfKin?.relationship)}</Tag>
        </span>
      </div>
      <div className={styles.nextOfKinInfo}>
        <span className={styles.nextOfKinPhone}>
          {t('phone', 'Phone')}: {nextOfKin?.phone}
        </span>
        <span>
          {t('address', 'Address')}: {nextOfKin?.address}
        </span>
      </div>
    </div>
  );
};

export default NextOfKinDetails;
