import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePatient, ErrorState, ExtensionSlot, navigate } from '@openmrs/esm-framework';
import { InlineLoading, Button } from '@carbon/react';
import { useBill } from '../../billing.resource';
import { CardHeader } from '@openmrs/esm-patient-common-lib';
import { PreviousOutline } from '@carbon/react/icons';
import { spaBasePath } from '../../constants';
import { LineItem } from '../../types';
import styles from './pre-auth-dashboard.scss';
import PreAuthTable from './table/pre-auth-table.component';
import PreAuthForm from './form/pre-auth-form.component';

const PreAuthRequestDashboard: React.FC = () => {
  const { billUuid, patientUuid } = useParams();
  const { t } = useTranslation();
  const { patient, isLoading: isLoadingPatient } = usePatient(patientUuid);
  const { bill, isLoading: isLoadingBill, error } = useBill(billUuid);
  const preAuthTitle = t('makePreauthRequest', 'Make Pre-auth Request');

  const [selectedLineItems, setSelectedLineItems] = useState<LineItem[]>([]);

  const handleSelectItem = (selectedItems: LineItem[]) => {
    setSelectedLineItems(selectedItems);
  };

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

  return (
    <div className={styles.preAuthContainer}>
      {patient && (
        <ExtensionSlot
          name="patient-header-slot"
          state={{ patientUuid: patient.id, patient }}
          className={styles.preAuthContainer}
        />
      )}
      <CardHeader title={preAuthTitle}>
        <Button
          kind="secondary"
          size="sm"
          className={styles.backButton}
          onClick={() => navigate({ to: `${spaBasePath}/billing/patient/${patientUuid}/${billUuid}` })}
          renderIcon={PreviousOutline}
          iconDescription="back">
          {t('backButton', 'Back')}
        </Button>{' '}
      </CardHeader>
      <div className={styles.preAuthMainContainer}>
        <div className={styles.content}>
          <PreAuthTable bill={bill} isLoadingBill={isLoadingBill} onSelectItem={handleSelectItem} />
          <PreAuthForm bill={bill} selectedLineItems={selectedLineItems} />
        </div>
      </div>
    </div>
  );
};

export default PreAuthRequestDashboard;
