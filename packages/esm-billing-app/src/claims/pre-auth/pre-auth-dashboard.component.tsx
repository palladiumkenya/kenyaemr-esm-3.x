import React from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePatient, ErrorState, ExtensionSlot } from '@openmrs/esm-framework';
import styles from './pre-auth-dashboard.scss';
import { InlineLoading } from '@carbon/react';
import { useBill } from '../../billing.resource';

const PreAuthRequestDashboard: React.FC = () => {
  const { billUuid, patientUuid } = useParams();
  const { t } = useTranslation();

  const { patient, isLoading: isLoadingPatient } = usePatient(patientUuid);
  const { bill, isLoading: isLoadingBill, error } = useBill(billUuid);

  if (isLoadingPatient && isLoadingBill) {
    return (
      <div className={styles.preAuthContainer}>
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
      <div className={styles.preAuthContainer}>
        <ErrorState headerTitle={t('preAuthRequestError', 'Pre-authorization request error page')} error={error} />
      </div>
    );
  }
};

export default PreAuthRequestDashboard;
