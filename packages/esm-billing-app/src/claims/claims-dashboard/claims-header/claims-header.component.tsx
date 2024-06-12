import React, { useEffect, useState } from 'react';
import { InlineLoading } from '@carbon/react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ExtensionSlot, usePatient, showModal } from '@openmrs/esm-framework';
import { ErrorState } from '@openmrs/esm-patient-common-lib';
import styles from './claims-header.scss';
import { useBill } from '../../../billing.resource';
import { LineItem } from '../../../types';
import ClaimsTable from '../claims-table.component.tsx/claims-table.component';
import { ClaimsBreakDown } from '../claims-breakdown/claims-breakdown.component';
import ClaimsForm from '../claims-form/claims-form.component';

const ClaimsHeader: React.FC = () => {
  const { t } = useTranslation();
  const { billUuid, patientUuid } = useParams();
  const { patient, isLoading: isLoadingPatient } = usePatient(patientUuid);
  const { bill, isLoading: isLoadingBill, error } = useBill(billUuid);
  const [selectedLineIems, setSelectedLineItems] = useState([]);
  const handleSelectItem = (lineItems: Array<LineItem>) => {
    setSelectedLineItems(lineItems);
  };

  useEffect(() => {
    const paidLineItems = bill?.lineItems?.filter((item) => item.paymentStatus === 'PAID') ?? [];
    setSelectedLineItems(paidLineItems);
  }, [bill.lineItems]);

  if (isLoadingPatient && isLoadingBill) {
    return (
      <div className={styles.claimContainer}>
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
        <ErrorState headerTitle={t('invoiceError', 'Invoice error')} error={error} />
      </div>
    );
  }

  return (
    <div className={styles.claimContainer}>
      {patient && patientUuid && <ExtensionSlot name="patient-header-slot" state={{ patient, patientUuid }} />}
      <div className={styles.detailsContainer}>
        <span className={styles.claimTitle}>Create Claim Form</span>
      </div>

      <ClaimsTable bill={bill} isLoadingBill={isLoadingBill} onSelectItem={handleSelectItem} />
      <ClaimsBreakDown label={t('amountClaimed', 'Amount Claimed')} value="Ksh. 1000" />
    </div>
  );
};

export default ClaimsHeader;
