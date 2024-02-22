import React, { useCallback, useState } from 'react';
import { Dropdown, InlineLoading, InlineNotification, Layer } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useCashPoint, useBillableItems, createPatientBill } from './billing-form.resource';
import { showSnackbar, useConfig } from '@openmrs/esm-framework';
import styles from './billing-checkin-form.scss';
import VisitAttributesForm from './visit-attributes/visit-attributes-form.component';
import { BillingConfig } from '../config-schema';
import { hasPatientBeenExempted } from './helper';
import { EXEMPTED_PAYMENT_STATUS, PENDING_PAYMENT_STATUS } from '../constants';

type BillingCheckInFormProps = {
  patientUuid: string;
  setBillingInfo: (state) => void;
};

const BillingCheckInForm: React.FC<BillingCheckInFormProps> = ({ patientUuid, setBillingInfo }) => {
  const { t } = useTranslation();
  const {
    visitAttributeTypes: { isPatientExempted },
  } = useConfig<BillingConfig>();
  const { cashPoints, isLoading: isLoadingCashPoints, error: cashError } = useCashPoint();
  const { lineItems, isLoading: isLoadingLineItems, error: lineError } = useBillableItems();
  const [attributes, setAttributes] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState<any>();
  let lineList = [];

  const handleCreateBill = useCallback((createBillPayload) => {
    createPatientBill(createBillPayload).then(
      () => {
        showSnackbar({ title: 'Patient Bill', subtitle: 'Patient has been billed successfully', kind: 'success' });
      },
      (error) => {
        const errorMessage = JSON.stringify(error?.responseBody?.error?.message?.replace(/\[/g, '').replace(/\]/g, ''));
        showSnackbar({
          title: 'Patient Bill Error',
          subtitle: `An error has occurred while creating patient bill, Contact system administrator quoting this error ${errorMessage}`,
          kind: 'error',
          isLowContrast: true,
        });
      },
    );
  }, []);

  const handleBillingService = ({ selectedItem }) => {
    const cashPointUuid = cashPoints?.[0]?.uuid ?? '';
    const itemUuid = selectedItem?.uuid ?? '';

    // should default to first price if check returns empty. todo - update backend to return default price
    const priceForPaymentMode =
      selectedItem.servicePrices.find((p) => p.paymentMode?.uuid === paymentMethod) || selectedItem?.servicePrices[0];
    const billStatus = hasPatientBeenExempted(attributes, isPatientExempted)
      ? EXEMPTED_PAYMENT_STATUS
      : PENDING_PAYMENT_STATUS;
    const createBillPayload = {
      lineItems: [
        {
          billableService: itemUuid,
          quantity: 1,
          price: priceForPaymentMode ? priceForPaymentMode.price : '0.000',
          priceName: 'Default',
          priceUuid: priceForPaymentMode ? priceForPaymentMode.uuid : '',
          lineItemOrder: 0,
          paymentStatus: billStatus,
        },
      ],
      cashPoint: cashPointUuid,
      patient: patientUuid,
      status: billStatus,
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
      e.servicePrices.some((p) => p.paymentMode && p.paymentMode.uuid === paymentMethod?.uuid),
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
    <>
      <VisitAttributesForm setAttributes={setAttributes} setPaymentMethod={setPaymentMethod} />
      <section className={styles.sectionContainer}>
        <div className={styles.sectionTitle}>{t('billing', 'Billing')}</div>
        <div className={styles.sectionField}>
          <Layer>
            <Dropdown
              label={t('selectServices', 'Select a service...')}
              onChange={handleBillingService}
              id="billable-items"
              items={lineList}
              itemToString={(item) => (item ? `${item.name} ${setServicePrice(item.servicePrices)}` : '')}
              titleText={t('billableService', 'Billable service')}
            />
          </Layer>
        </div>
      </section>
    </>
  );
};

export default React.memo(BillingCheckInForm);
