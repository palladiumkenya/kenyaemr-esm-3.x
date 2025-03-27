import { FilterableMultiSelect, InlineLoading, InlineNotification } from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { showSnackbar, useConfig, useFeatureFlag } from '@openmrs/esm-framework';
import React, { useCallback, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { createPatientBill, useBillableItems, useCashPoint } from '../billing.resource';
import { BillingConfig } from '../config-schema';
import { EXEMPTED_PAYMENT_STATUS, PENDING_PAYMENT_STATUS, SHA_INSURANCE_SCHEME } from '../constants';
import { BillingService } from '../types';
import styles from './billing-checkin-form.scss';
import { visitAttributesFormSchema, VisitAttributesFormValue } from './check-in-form.utils';
import { hasPatientBeenExempted } from './helper';
import SHANumberValidity from './social-health-authority/sha-number-validity.component';
import VisitAttributesForm from './visit-attributes/visit-attributes-form.component';
import SHABenefitPackangesAndInterventions from '../benefits-package/forms/packages-and-interventions-form.component';

type BillingCheckInFormProps = {
  patientUuid: string;
  setExtraVisitInfo: (state) => void;
};

const BillingCheckInForm: React.FC<BillingCheckInFormProps> = ({ patientUuid, setExtraVisitInfo }) => {
  const { t } = useTranslation();
  const hieFeatureFlags = useFeatureFlag('healthInformationExchange');
  const {
    visitAttributeTypes: { isPatientExempted },
  } = useConfig<BillingConfig>();
  const { cashPoints, isLoading: isLoadingCashPoints, error: cashError } = useCashPoint();
  const { lineItems, isLoading: isLoadingLineItems, error: lineError } = useBillableItems();
  const [attributes, setAttributes] = useState([]);
  const formMethods = useForm<VisitAttributesFormValue>({
    mode: 'all',
    defaultValues: {
      isPatientExempted: '',
      paymentMethods: '',
      insuranceScheme: '',
      policyNumber: '',
      exemptionCategory: '',
      interventions: [],
      packages: [],
    },
    resolver: zodResolver(visitAttributesFormSchema),
  });
  const isPatientExemptedValue = formMethods.watch('isPatientExempted');
  const paymentMethod = formMethods.watch('paymentMethods');
  const isInsuranceSchemeSha = formMethods.watch('insuranceScheme') === SHA_INSURANCE_SCHEME;

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

  const handleBillingService = (selectedItems: Array<BillingService>) => {
    const cashPointUuid = cashPoints?.[0]?.uuid ?? '';
    const billStatus = hasPatientBeenExempted(attributes, isPatientExempted)
      ? EXEMPTED_PAYMENT_STATUS
      : PENDING_PAYMENT_STATUS;

    const lineItems = selectedItems.map((item, index) => {
      const priceForPaymentMode =
        item.servicePrices.find((p) => p.paymentMode?.uuid === paymentMethod) || item?.servicePrices[0];
      return {
        billableService: item?.uuid ?? '',
        quantity: 1,
        price: priceForPaymentMode ? priceForPaymentMode.price : '0.000',
        priceName: 'Default',
        priceUuid: priceForPaymentMode ? priceForPaymentMode.uuid : '',
        lineItemOrder: index,
        paymentStatus: billStatus,
      };
    });

    const billPayload = {
      lineItems: lineItems,
      cashPoint: cashPointUuid,
      patient: patientUuid,
      status: billStatus,
      payments: [],
    };

    setExtraVisitInfo({
      handleCreateExtraVisitInfo: () => handleCreateBill(billPayload),
      attributes,
    });
  };

  useEffect(() => {
    setExtraVisitInfo({
      handleCreateExtraVisitInfo: () => {},
      attributes,
    });
  }, [attributes, setExtraVisitInfo]);

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
    <FormProvider {...formMethods}>
      <VisitAttributesForm setAttributes={setAttributes} />
      {hieFeatureFlags && <SHANumberValidity paymentMethod={attributes} patientUuid={patientUuid} />}
      {hieFeatureFlags && isInsuranceSchemeSha && <SHABenefitPackangesAndInterventions patientUuid={patientUuid} />}
      {paymentMethod && (
        <section className={styles.sectionContainer}>
          <div className={styles.sectionTitle}>{t('billing', 'Billing')}</div>
          <div className={styles.sectionField}>
            <FilterableMultiSelect
              key={isPatientExemptedValue}
              id="billing-service"
              titleText={t('searchServices', 'Search services')}
              items={lineItems ?? []}
              itemToString={(item) => (item ? item?.name : '')}
              onChange={({ selectedItems }) => handleBillingService(selectedItems)}
              disabled={isPatientExemptedValue === ''}
            />
          </div>
        </section>
      )}
    </FormProvider>
  );
};

export default React.memo(BillingCheckInForm);
