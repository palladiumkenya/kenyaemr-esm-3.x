import React, { useCallback } from 'react';
import { Dropdown, InlineLoading, InlineNotification } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useCashPoint, useBillableItems, createPatientBill } from './billing-form.resource';
import { showSnackbar } from '@openmrs/esm-framework';
import styles from './billing-checkin-form.scss';

const DEFAULT_PRICE = 500.00001;
const PENDING_PAYMENT_STATUS = 'PENDING';

type BillingCheckInFormProps = {
  patientUuid: string;
  setBillingInfo: (state) => void;
};

const BillingCheckInForm: React.FC<BillingCheckInFormProps> = ({ patientUuid, setBillingInfo }) => {
  const { t } = useTranslation();
  const { cashPoints, isLoading: isLoadingCashPoints, error: cashError } = useCashPoint();
  const { lineItems, isLoading: isLoadingLineItems, error: lineError } = useBillableItems();

  const handleCreateBill = useCallback((createBillPayload) => {
    createPatientBill(createBillPayload).then(
      () => {
        showSnackbar({ title: 'Patient Bill', subtitle: 'Patient has been billed successfully', kind: 'success' });
      },
      (error) => {
        showSnackbar({
          title: 'Patient Bill Error',
          subtitle: 'An error has occurred while creating patient bill',
          kind: 'error',
        });
      },
    );
  }, []);

  const handleBillingService = ({ selectedItem }) => {
    const cashPointUuid = cashPoints?.[0]?.uuid ?? '';
    const itemUuid = selectedItem?.uuid ?? '';

    // TODO: This line list should come from backend to avoid hard coding prices in the frontend
    const createBillPayload = {
      lineItems: [
        {
          item: itemUuid,
          quantity: 1,
          price: DEFAULT_PRICE,
          priceName: 'Default',
          priceUuid: '',
          lineItemOrder: 0,
          paymentStatus: PENDING_PAYMENT_STATUS,
        },
      ],
      cashPoint: cashPointUuid,
      patient: patientUuid,
      status: PENDING_PAYMENT_STATUS,
      payments: [],
    };

    setBillingInfo({ createBillPayload, handleCreateBill: () => handleCreateBill(createBillPayload) });
  };

  if (isLoadingLineItems || isLoadingCashPoints) {
    return (
      <InlineLoading
        status="active"
        iconDescription={t('loading', 'Loading')}
        description={t('loadingBillingServices', 'Loading billing services...')}
      />
    );
  }

  if (cashError || lineError) {
    return (
      <InlineNotification
        kind="error"
        lowContrast
        title={t('billErrorService', 'Bill service error')}
        subtitle={t('errorLoadingBillServices', 'Error loading bill services')}
      />
    );
  }

  return (
    <section className={styles.sectionContainer}>
      <div className={styles.sectionTitle}>{t('billing', 'Billing')}</div>
      <div className={styles.sectionField}></div>
      <Dropdown
        label={t('selectBillableService', 'Select a billable service...')}
        onChange={handleBillingService}
        id="billable-items"
        items={lineItems}
        itemToString={(item) => (item ? item.commonName : '')}
        titleText={t('billableService', 'Billable service')}
      />
    </section>
  );
};

export default React.memo(BillingCheckInForm);
