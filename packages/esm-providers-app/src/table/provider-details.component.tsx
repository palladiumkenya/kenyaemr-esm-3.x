import React from 'react';
import styles from './generic-data-table.scss';
import { useTranslation } from 'react-i18next';
import {
  StructuredListWrapper,
  StructuredListHead,
  StructuredListRow,
  StructuredListCell,
  StructuredListBody,
} from '@carbon/react';
import { usePersonDetails } from '../workspace/hook/provider-form.resource';

interface ProviderDetailsProps {
  personUuid: string;
  license: string;
}

const ProviderDetails: React.FC<ProviderDetailsProps> = ({ personUuid, license }) => {
  const { t } = useTranslation();
  const { currentPerson, isLoading, error } = usePersonDetails('89345921-60fc-4e12-bddb-4fab4e3e59d7');

  if (isLoading) {
    return <div>{t('loading', 'Loading...')}</div>;
  }

  if (error) {
    return <div>{t('error', 'Error loading user details')}</div>;
  }

  return (
    <div className={styles.providerDetailsContainer}>
      <p className={styles.title}>{t('WorkerDetails', 'Health Worker details')}</p>

      <div className={styles.providerInfoGrid}>
        <div>
          <p className={styles.gridTitle}>{t('LicenseNumber', 'License Number')}</p>
          <div className={styles.labelContainer}>
            <p className={styles.labelBold}>{t('license', 'License')}: </p>
            <p className={styles.label}>{license}</p>
          </div>
        </div>

        {currentPerson && (
          <>
            <div>
              <p className={styles.gridTitle}>{t('PersonDetails', 'Person Details')}</p>
              <div className={styles.labelContainer}>
                <p className={styles.labelBold}>{t('PersonDisplay', 'Person Display')}: </p>
                <p className={styles.label}>{currentPerson.display}</p>
              </div>
              <div className={styles.labelContainer}>
                <p className={styles.labelBold}>{t('Gender', 'Gender')}: </p>
                <p className={styles.label}>{currentPerson.gender}</p>
              </div>
              {/* Add more details here as needed */}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProviderDetails;
