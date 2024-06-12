import React from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ClaimsHeader from './claims-header/claims-header.component';
import { usePatient, ErrorState } from '@openmrs/esm-framework';
import styles from './claims-header/claims-header.scss';
import { InlineLoading } from '@carbon/react';

const ClaimScreen: React.FC = () => {
  const { billUuid, patientUuid } = useParams();
  const { t } = useTranslation();

  const { patient, isLoading: isLoadingPatient, error } = usePatient(patientUuid);

  if (isLoadingPatient) {
    return (
      <div className={styles.invoiceContainer}>
        <InlineLoading
          className={styles.loader}
          status="active"
          iconDescription={t('loading', 'Loading')}
          description={t('loadingPatientHeader', 'Loading patient header...')}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <ErrorState headerTitle={t('createClaimError', 'Create Claim error')} error={error} />
      </div>
    );
  }

  return (
    <>
      <ClaimsHeader patient={patient} billUuid={billUuid} />
    </>
  );
};

export default ClaimScreen;
