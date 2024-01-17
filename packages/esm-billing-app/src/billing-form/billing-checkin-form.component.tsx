import React, { useCallback, useState } from 'react';
import { Dropdown, InlineLoading, InlineNotification } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useCashPoint, useBillableItems, createPatientBill } from './billing-form.resource';
import { showSnackbar } from '@openmrs/esm-framework';
import styles from './billing-checkin-form.scss';
import VisitAttributesForm from './visit-attributes/visit-attributes-form.component';

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
  const [attributes, setAttributes] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState<any>();
  let lineList = [];

  const shouldBillPatient =
    attributes.find((item) => item.attributeType === 'caf2124f-00a9-4620-a250-efd8535afd6d')?.value ===
    '1c30ee58-82d4-4ea4-a8c1-4bf2f9dfc8cf';

  const handleCreateBill = useCallback(
    (createBillPayload) => {
      shouldBillPatient &&
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
    },
    [shouldBillPatient],
  );

  const handleBillingService = ({ selectedItem }) => {
    const cashPointUuid = cashPoints?.[0]?.uuid ?? '';
    const itemUuid = selectedItem?.uuid ?? '';
    const priceForPaymentMode = selectedItem.servicePrices.find((p) => p.paymentMode?.uuid === paymentMethod);

    // TODO: This line list should come from backend to avoid hard coding prices in the frontend
    const createBillPayload = {
      lineItems: [
        {
          billableService: itemUuid,
          quantity: 1,
          price: priceForPaymentMode ? priceForPaymentMode.price : '0.000',
          priceName: 'Default',
          priceUuid: priceForPaymentMode ? priceForPaymentMode.uuid : '',
          lineItemOrder: 0,
          paymentStatus: PENDING_PAYMENT_STATUS,
        },
      ],
      cashPoint: cashPointUuid,
      patient: patientUuid,
      status: PENDING_PAYMENT_STATUS,
      payments: [],
    };

    setBillingInfo({ createBillPayload, handleCreateBill: () => handleCreateBill(createBillPayload), attributes });
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

  if (paymentMethod) {
    lineList = [];
    lineList = lineItems.filter((e) =>
      e.servicePrices.some((p) => p.paymentMode && p.paymentMode.uuid === paymentMethod),
    );
  }

  const setServicePrice = (prices) => {
    const matchingPrice = prices.find((p) => p.paymentMode?.uuid === paymentMethod);
    return matchingPrice ? `(${matchingPrice.name}:${matchingPrice.price})` : '';
  };

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
      <VisitAttributesForm setAttributes={setAttributes} setPaymentMethod={setPaymentMethod} />
      {shouldBillPatient && (
        <>
          <div className={styles.sectionTitle}>{t('billing', 'Billing')}</div>
          <div className={styles.sectionField}></div>
          <Dropdown
            label={t('selectBillableService', 'Select a billable service...')}
            onChange={handleBillingService}
            id="billable-items"
            items={lineList}
            itemToString={(item) => (item ? `${item.name} ${setServicePrice(item.servicePrices)}` : '')}
            titleText={t('billableService', 'Billable service')}
          />
        </>
      )}
    </section>
  );
};

export default React.memo(BillingCheckInForm);
