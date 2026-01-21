import { FilterableMultiSelect, InlineLoading, InlineNotification } from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { showSnackbar, useConfig, useFeatureFlag, type Visit } from '@openmrs/esm-framework';
import React, { useCallback, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { createPatientBill, useBillableItems, useCashPoint } from '../billing.resource';
import { BillingConfig } from '../config-schema';
import { EXEMPTED_PAYMENT_STATUS, PENDING_PAYMENT_STATUS, SHA_INSURANCE_SCHEME } from '../constants';
import styles from './billing-checkin-form.scss';
import { visitAttributesFormSchema, VisitAttributesFormValue } from './check-in-form.utils';
import { hasPatientBeenExempted } from './helper';
import SHANumberValidity from './social-health-authority/sha-number-validity.component';
import VisitAttributesForm from './visit-attributes/visit-attributes-form.component';
import SHABenefitPackangesAndInterventions from '../benefits-package/forms/packages-and-interventions-form.component';

interface VisitFormCallbacks {
  onVisitCreatedOrUpdated: (visit: Visit) => Promise<any>;
}

type BillingCheckInFormProps = {
  patientUuid: string;
  setVisitFormCallbacks: (callbacks: VisitFormCallbacks) => void;
};

const BillingCheckInForm: React.FC<BillingCheckInFormProps> = ({ patientUuid, setVisitFormCallbacks }) => {
  const { t } = useTranslation();
  const hieFeatureFlags = useFeatureFlag('healthInformationExchange');
  const {
    visitAttributeTypes: { isPatientExempted },
  } = useConfig<BillingConfig>();
  const { cashPoints, isLoading: isLoadingCashPoints, error: cashError } = useCashPoint();
  const { lineItems, isLoading: isLoadingLineItems, error: lineError } = useBillableItems();
  const [attributes, setAttributes] = useState([]);
  const [selectedBillingServices, setSelectedBillingServices] = useState([]);

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

  const handleCreateBill = useCallback(
    (billPayload) => {
      return createPatientBill(billPayload).then(
        () => {
          showSnackbar({
            title: t('patientBill', 'Patient Bill'),
            subtitle: t('patientBilledSuccessfully', 'Patient has been billed successfully'),
            kind: 'success',
          });
        },
        (error) => {
          const errorMessage = JSON.stringify(
            error?.responseBody?.error?.message?.replace(/\[/g, '').replace(/\]/g, '') || '',
          );
          showSnackbar({
            title: t('patientBillError', 'Patient Bill Error'),
            subtitle: t(
              'errorCreatingBill',
              'An error has occurred while creating patient bill, Contact system administrator quoting this error {{errorMessage}}',
              { errorMessage },
            ),
            kind: 'error',
            isLowContrast: true,
          });
          // Re-throw to propagate error up the promise chain
          throw error;
        },
      );
    },
    [t],
  );

  const createBillPayload = useCallback(
    (selectedItems) => {
      const cashPointUuid = cashPoints?.[0]?.uuid ?? '';
      const billStatus = hasPatientBeenExempted(attributes, isPatientExempted)
        ? EXEMPTED_PAYMENT_STATUS
        : PENDING_PAYMENT_STATUS;

      const lineItemsData = selectedItems.map((item, index) => {
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

      return {
        lineItems: lineItemsData,
        cashPoint: cashPointUuid,
        patient: patientUuid,
        status: billStatus,
        payments: [],
      };
    },
    [cashPoints, attributes, isPatientExempted, paymentMethod, patientUuid],
  );

  const handleBillingService = useCallback((selectedItems) => {
    setSelectedBillingServices(selectedItems);
  }, []);

  useEffect(() => {
    const onVisitCreatedOrUpdated = async (visit: Visit) => {
      if (selectedBillingServices.length > 0) {
        const billPayload = createBillPayload(selectedBillingServices);
        await handleCreateBill(billPayload);
      }
      return visit;
    };

    setVisitFormCallbacks({
      onVisitCreatedOrUpdated,
    });
  }, [selectedBillingServices, createBillPayload, handleCreateBill, setVisitFormCallbacks]);

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
          <div className={styles.sectionTitle}>{t('chargeableService', 'Chargeable service')}</div>
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
