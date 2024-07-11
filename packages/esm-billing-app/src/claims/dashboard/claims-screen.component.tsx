import React from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePatient, ErrorState } from '@openmrs/esm-framework';
import styles from './header/claims-header.scss';
import { InlineLoading } from '@carbon/react';
import { useBill } from '../../billing.resource';
import ClaimsHeader from './header/claims-header.component';

const ClaimScreen: React.FC = () => {
  const { billUuid, patientUuid } = useParams();
  const { t } = useTranslation();

  const { patient, isLoading: isLoadingPatient } = usePatient(patientUuid);
  const { bill, isLoading: isLoadingBill, error } = useBill(billUuid);

  if (isLoadingPatient && isLoadingBill) {
    return (
      <div className={styles.invoiceContainer}>
        <InlineLoading
          className={styles.loader}
          status="active"
          iconDescription="Loading"
          description="Loading patient header..."
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

  return <ClaimsHeader patient={patient} bill={bill} />;
};

export default ClaimScreen;
