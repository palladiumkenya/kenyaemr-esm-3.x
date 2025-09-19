import {
  Button,
  ButtonSet,
  Column,
  Form,
  InlineLoading,
  InlineNotification,
  Layer,
  MultiSelect,
  Row,
  Stack,
  TextInput,
  TextInputSkeleton,
  ComboBox,
} from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { navigate, showModal, showSnackbar, toOmrsIsoString, useConfig, useSession } from '@openmrs/esm-framework';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { z } from 'zod';
import SHABenefitPackangesAndInterventions from '../../../benefits-package/forms/packages-and-interventions-form.component';
import { BillingConfig } from '../../../config-schema';
import { useSystemSetting } from '../../../hooks/getMflCode';
import usePatientDiagnosis from '../../../hooks/usePatientDiagnosis';
import useProvider from '../../../hooks/useProvider';
import { ClaimSummary, LineItem, MappedBill, OTPVerificationModalOptions } from '../../../types';
import ClaimExplanationAndJusificationInput from './claims-explanation-and-justification-form-input.component';
import { processClaims, SHAPackagesAndInterventionVisitAttribute, useVisit } from './claims-form.resource';
import useProviderList from '../../../hooks/useProviderList';

import styles from './claims-form.scss';
import debounce from 'lodash-es/debounce';
import { formatDateTime } from '../../utils';
import { otpManager } from '../../../hooks/useOTP';
import { usePhoneNumberAttribute } from '../../../hooks/usePhoneNumber';

type ClaimsFormProps = {
  bill: MappedBill;
  selectedLineItems: LineItem[];
};

const ClaimsFormSchemaBase = z.object({
  claimExplanation: z.string(),
  claimJustification: z.string(),
  diagnoses: z.array(z.string()),
  visitType: z.string(),
  facility: z.string(),
  treatmentStart: z.string(),
  treatmentEnd: z.string(),
  packages: z.array(z.string()),
  interventions: z.array(z.string()),
  provider: z.string(),
});

const ClaimsFormSchema = z.object({
  claimExplanation: z.string().min(1, { message: 'Claim explanation is required' }),
  claimJustification: z.string().min(1, { message: 'Claim justification is required' }),
  diagnoses: z.array(z.string()).min(1, { message: 'At least one diagnosis is required' }),
  visitType: z.string().min(1, { message: 'Visit type is required' }),
  facility: z.string().min(1, { message: 'Facility is required' }),
  treatmentStart: z.string().min(1, { message: 'Treatment start date is required' }),
  treatmentEnd: z.string().min(1, { message: 'Treatment end date is required' }),
  packages: z.array(z.string()).min(1, { message: 'At least one package is required' }),
  interventions: z.array(z.string()).min(1, { message: 'At least one intervention is required' }),
  provider: z.string().min(1, { message: 'Provider is required' }),
});

enum OTPState {
  NOT_STARTED = 'not_started',
  REQUESTED = 'requested',
  VERIFIED = 'verified',
}

const ClaimsForm: React.FC<ClaimsFormProps> = ({ bill, selectedLineItems }) => {
  const { t } = useTranslation();
  const { mflCodeValue } = useSystemSetting('facility.mflcode');
  const { patientUuid, billUuid } = useParams();
  const { visits: recentVisit, error: visitError, isLoading: visitLoading } = useVisit(patientUuid);
  const { diagnoses, error: diagnosisError, isLoading: diagnosisLoading } = usePatientDiagnosis(patientUuid);
  const {
    currentProvider: { uuid: providerUuid },
  } = useSession();
  const { providerLoading, provider, error: providerError } = useProvider(providerUuid);
  const { visitAttributeTypes } = useConfig<BillingConfig>();
  const { providers, providersLoading } = useProviderList();
  const { phoneNumber } = usePhoneNumberAttribute(patientUuid);

  const [otpState, setOtpState] = useState<OTPState>(OTPState.NOT_STARTED);
  const [pendingClaimData, setPendingClaimData] = useState<z.infer<typeof ClaimsFormSchema> | null>(null);
  const [formInitialized, setFormInitialized] = useState(false);
  const [validationEnabled, setValidationEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentOtpPhoneNumber, setCurrentOtpPhoneNumber] = useState<string>('');

  const currentPhoneRef = useRef<string>('');

  const patientName = `${bill.patientName}`;
  const otpExpiryMinutes = 5;

  const form = useForm<z.infer<typeof ClaimsFormSchema>>({
    mode: 'onTouched',
    resolver: zodResolver(validationEnabled ? ClaimsFormSchema : ClaimsFormSchemaBase),
    defaultValues: {
      claimExplanation: '',
      claimJustification: '',
      diagnoses: [],
      visitType: '',
      facility: '',
      treatmentStart: '',
      treatmentEnd: '',
      packages: [],
      interventions: [],
      provider: '',
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, touchedFields },
    setValue,
    trigger,
    watch,
  } = form;

  const packages = watch('packages');
  const interventions = watch('interventions');

  const debouncedValidation = useCallback(
    debounce(() => {
      if (formInitialized) {
        trigger();
      }
    }, 500),
    [formInitialized, trigger],
  );

  useEffect(() => {
    debouncedValidation();
    return () => debouncedValidation.cancel();
  }, [packages, interventions, debouncedValidation]);

  useEffect(() => {
    if (!visitLoading && !diagnosisLoading && !providerLoading) {
      const updates = {
        diagnoses: diagnoses?.map((d) => d.id) ?? [],
        visitType: recentVisit?.visitType?.display || '',
        facility: `${recentVisit?.location?.display || ''} - ${mflCodeValue || ''}`,
        treatmentStart: formatDateTime(recentVisit?.startDatetime || ''),
        treatmentEnd: formatDateTime(recentVisit?.stopDatetime || ''),
        packages: recentVisit?.attributes?.find(
          (attr) => attr.attributeType.uuid === visitAttributeTypes.shaBenefitPackagesAndInterventions,
        )?.value
          ? JSON.parse(
              recentVisit.attributes.find(
                (attr) => attr.attributeType.uuid === visitAttributeTypes.shaBenefitPackagesAndInterventions,
              ).value,
            ).packages
          : [],
        interventions: recentVisit?.attributes?.find(
          (attr) => attr.attributeType.uuid === visitAttributeTypes.shaBenefitPackagesAndInterventions,
        )?.value
          ? JSON.parse(
              recentVisit.attributes.find(
                (attr) => attr.attributeType.uuid === visitAttributeTypes.shaBenefitPackagesAndInterventions,
              ).value,
            ).interventions
          : [],
        provider: providerUuid,
      };

      Object.entries(updates).forEach(([field, value]) => {
        setValue(field as any, value, { shouldValidate: false, shouldDirty: false, shouldTouch: false });
      });

      setTimeout(() => {
        setFormInitialized(true);
      }, 100);
    }
  }, [
    diagnoses,
    recentVisit,
    mflCodeValue,
    setValue,
    provider,
    visitLoading,
    diagnosisLoading,
    providerLoading,
    providerUuid,
    visitAttributeTypes,
  ]);

  const generateClaimSummary = (data: z.infer<typeof ClaimsFormSchema>): ClaimSummary => {
    const billServiceNames = selectedLineItems.map((item) => item.billableService);
    const services = billServiceNames.map((service) => service.replace(/^[a-f0-9-]+:/, '').trim());
    const totalAmount = selectedLineItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return {
      totalAmount,
      facility: recentVisit?.location?.display || '',
      totalItems: selectedLineItems.length,
      services: services.join(', '),
      startDate: data.treatmentStart,
      endDate: data.treatmentEnd,
    };
  };

  const createDynamicOTPHandlers = useCallback(
    (initialPhone: string) => {
      currentPhoneRef.current = initialPhone;

      return {
        onRequestOtp: async (phoneNumber: string): Promise<void> => {
          if (currentPhoneRef.current && currentPhoneRef.current !== phoneNumber) {
            otpManager.transferOTP(currentPhoneRef.current, phoneNumber);
          }

          setCurrentOtpPhoneNumber(phoneNumber);
          currentPhoneRef.current = phoneNumber;

          const currentFormData = form.getValues();
          if (!currentFormData || !selectedLineItems?.length) {
            throw new Error('No claim data available for OTP request');
          }

          const claimSummary = generateClaimSummary(currentFormData);
          await otpManager.requestOTP(phoneNumber, patientName, claimSummary, otpExpiryMinutes);
        },
        onVerify: async (otp: string): Promise<void> => {
          const phoneForVerification = currentPhoneRef.current;

          if (!phoneForVerification) {
            throw new Error('No phone number available for verification');
          }

          const isValid = await otpManager.verifyOTP(phoneForVerification, otp);
          if (!isValid) {
            throw new Error('OTP verification failed');
          }
        },
      };
    },
    [patientName, form, selectedLineItems, otpExpiryMinutes],
  );

  const launchOtpVerificationModal = (props: OTPVerificationModalOptions) => {
    const dispose = showModal('otp-verification-modal', {
      ...props,
      onClose: () => {
        if (otpState === OTPState.REQUESTED) {
          setOtpState(OTPState.NOT_STARTED);
        }
        dispose();
      },
      size: 'xs',
    });
    return dispose;
  };

  const handleOTPVerificationSuccess = async (): Promise<void> => {
    setOtpState(OTPState.VERIFIED);
  };

  const processClaim = async (data: z.infer<typeof ClaimsFormSchema>) => {
    setLoading(true);

    const providedItems = selectedLineItems.reduce((acc, item) => {
      acc[item.uuid] = {
        items: [
          {
            uuid: item.itemOrServiceConceptUuid,
            price: item.price,
            quantity: item.quantity,
          },
        ],
        explanation: data.claimExplanation,
        justification: data.claimJustification,
      };
      return acc;
    }, {});

    const payload = {
      providedItems,
      claimExplanation: data.claimExplanation,
      claimJustification: data.claimJustification,
      startDate: toOmrsIsoString(data.treatmentStart),
      endDate: toOmrsIsoString(data.treatmentEnd),
      location: mflCodeValue,
      diagnoses: data.diagnoses,
      paidInFacility: true,
      patient: patientUuid,
      visitType: recentVisit?.visitType?.uuid,
      guaranteeId: 'G-001',
      claimCode: 'C-001',
      provider: data.provider,
      visitUuid: recentVisit?.uuid,
      encounterUuid: recentVisit?.encounters?.[0]?.uuid,
      use: 'claim',
      insurer: 'SHA',
      billNumber: billUuid,
      packages: data.packages,
      interventions: data.interventions,
    };

    try {
      await processClaims(payload);

      showSnackbar({
        kind: 'success',
        title: t('processClaim', 'Process Claim'),
        subtitle: t('claimProcessedSuccessfully', 'Claim processed and sent successfully'),
        timeoutInMs: 4000,
        isLowContrast: true,
      });

      setOtpState(OTPState.NOT_STARTED);
      setPendingClaimData(null);
      setCurrentOtpPhoneNumber('');
      currentPhoneRef.current = '';
      otpManager.clearAllOTPs();

      setTimeout(() => {
        navigate({
          to: window.getOpenmrsSpaBase() + 'home/billing/',
        });
      }, 1000);
    } catch (err) {
      showSnackbar({
        kind: 'error',
        title: t('claimError', 'Claim Error'),
        subtitle: t('sendClaimError', 'Request Failed, Please try later...'),
        timeoutInMs: 2500,
        isLowContrast: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateOTPVerification = async (data: z.infer<typeof ClaimsFormSchema>) => {
    setValidationEnabled(true);
    const isFormValid = await trigger();
    if (!isFormValid) {
      return;
    }

    if (!phoneNumber) {
      showSnackbar({
        kind: 'error',
        title: t('noPhoneNumber', 'No Phone Number'),
        subtitle: t(
          'noPhoneNumberMessage',
          'No phone number found for this patient. Please update patient information.',
        ),
        timeoutInMs: 4000,
        isLowContrast: false,
      });
      return;
    }

    setPendingClaimData(data);
    setOtpState(OTPState.REQUESTED);
    setCurrentOtpPhoneNumber(phoneNumber);
    currentPhoneRef.current = phoneNumber;

    const dynamicHandlers = createDynamicOTPHandlers(phoneNumber);

    setTimeout(() => {
      launchOtpVerificationModal({
        otpLength: 5,
        obscureText: false,
        phoneNumber: phoneNumber,
        expiryMinutes: otpExpiryMinutes,
        onRequestOtp: dynamicHandlers.onRequestOtp,
        onVerify: dynamicHandlers.onVerify,
        onVerificationSuccess: handleOTPVerificationSuccess,
      });
    }, 0);
  };

  const handleProcessVerifiedClaim = async () => {
    if (pendingClaimData && otpState === OTPState.VERIFIED) {
      await processClaim(pendingClaimData);
    }
  };

  const handleReopenOTPModal = () => {
    const dynamicHandlers = createDynamicOTPHandlers(phoneNumber);

    launchOtpVerificationModal({
      otpLength: 5,
      obscureText: false,
      phoneNumber: currentOtpPhoneNumber || phoneNumber,
      expiryMinutes: otpExpiryMinutes,
      onRequestOtp: dynamicHandlers.onRequestOtp,
      onVerify: dynamicHandlers.onVerify,
      onVerificationSuccess: handleOTPVerificationSuccess,
    });
  };

  const handleDiscardClaim = () => {
    setOtpState(OTPState.NOT_STARTED);
    setPendingClaimData(null);
    setCurrentOtpPhoneNumber('');
    currentPhoneRef.current = '';
    otpManager.clearAllOTPs();
    navigate({
      to: window.getOpenmrsSpaBase() + `home/billing/patient/${patientUuid}/${billUuid}`,
    });
  };

  if (visitLoading || diagnosisLoading || providerLoading) {
    return (
      <Layer className={styles.loading}>
        {Array.from({ length: 6 }).map((_, index) => (
          <TextInputSkeleton key={index} />
        ))}
      </Layer>
    );
  }

  if (visitError || diagnosisError || providerError) {
    return (
      <Layer className={styles.loading}>
        <InlineNotification
          kind="error"
          subtitle={
            visitError?.message ??
            diagnosisError?.message ??
            providerError?.message ??
            'Error occurred while loading claims form'
          }
          lowContrast
        />
      </Layer>
    );
  }

  const shouldShowError = (fieldName: string) => {
    return validationEnabled && errors[fieldName] && (touchedFields[fieldName] || formInitialized);
  };

  const isFormValid = isValid && packages?.length > 0 && interventions?.length > 0 && selectedLineItems?.length > 0;
  const displayPhoneNumber = currentOtpPhoneNumber || phoneNumber;

  return (
    <FormProvider {...form}>
      <Form className={styles.form}>
        {!selectedLineItems?.length && (
          <div className={styles.notificationContainer}>
            <InlineNotification
              kind="info"
              title={t('noItemsSelected', 'No items selected')}
              subtitle={t('pleaseSelectItems', 'Please select line items to raise a claim')}
              hideCloseButton={true}
              lowContrast={true}
              className={styles.notification}
            />
          </div>
        )}

        {!displayPhoneNumber && (
          <div className={styles.notificationContainer}>
            <InlineNotification
              kind="warning"
              title={t('noPhoneNumber', 'No Phone Number')}
              subtitle={t(
                'noPhoneNumberFound',
                'No phone number found for this patient. OTP verification will not be available.',
              )}
              hideCloseButton={true}
              lowContrast={true}
              className={styles.notification}
            />
          </div>
        )}

        {otpState === OTPState.REQUESTED && (
          <div className={styles.notificationContainer}>
            <InlineNotification
              kind="info"
              title={t('otpVerificationPending', 'OTP Verification Pending')}
              subtitle={t('otpVerificationPendingMessage', 'Please complete OTP verification to process the claim')}
              hideCloseButton={true}
              lowContrast={true}
              className={styles.notification}
            />
          </div>
        )}

        {otpState === OTPState.VERIFIED && (
          <div className={styles.notificationContainer}>
            <InlineNotification
              kind="success"
              title={t('otpVerified', 'OTP Verified')}
              subtitle={t('otpVerifiedReadyToProcess', 'OTP has been verified. Click "Process Claim" to submit.')}
              hideCloseButton={true}
              lowContrast={true}
              className={styles.notification}
            />
          </div>
        )}

        <Stack gap={4} className={styles.grid}>
          <span className={styles.claimFormTitle}>{t('formTitle', 'Fill in the form details')}</span>
          <Row className={styles.formClaimRow}>
            <Column className={styles.formClaimColumn}>
              <Layer className={styles.input}>
                <Controller
                  control={control}
                  name="visitType"
                  render={({ field }) => (
                    <TextInput
                      {...field}
                      id="visittype"
                      labelText={t('visittype', 'Visit Type')}
                      readOnly
                      value={field.value}
                    />
                  )}
                />
              </Layer>
            </Column>
            <Column className={styles.formClaimColumn}>
              <Layer className={styles.input}>
                <Controller
                  control={control}
                  name="facility"
                  render={({ field }) => (
                    <TextInput
                      {...field}
                      id="facility"
                      labelText={t('facility', 'Facility')}
                      readOnly
                      value={field.value}
                    />
                  )}
                />
              </Layer>
            </Column>
          </Row>
          <Row className={styles.formClaimRow}>
            <Column className={styles.formClaimColumn}>
              <Layer className={styles.input}>
                <Controller
                  control={control}
                  name="treatmentStart"
                  render={({ field }) => (
                    <TextInput
                      {...field}
                      id="treatmentStart"
                      labelText={t('treatmentstart', 'Treatment Start')}
                      readOnly
                      value={field.value}
                    />
                  )}
                />
              </Layer>
            </Column>
            <Column className={styles.formClaimColumn}>
              <Layer className={styles.input}>
                <Controller
                  control={control}
                  name="treatmentEnd"
                  render={({ field }) => (
                    <TextInput
                      {...field}
                      id="treatmentEnd"
                      labelText={t('treatmentend', 'Treatment End')}
                      readOnly
                      value={field.value}
                    />
                  )}
                />
              </Layer>
            </Column>
          </Row>
          <SHABenefitPackangesAndInterventions patientUuid={patientUuid} />
          <Column>
            <Layer className={styles.input}>
              <Controller
                control={control}
                name="diagnoses"
                render={({ field }) => (
                  <MultiSelect
                    ref={field.ref}
                    invalid={shouldShowError('diagnoses')}
                    invalidText={errors.diagnoses?.message}
                    id="diagnoses"
                    titleText={t('finalDiagnosis', 'Final Diagnosis')}
                    selectedItems={field.value}
                    label="Choose option"
                    items={diagnoses.map((r) => r.id)}
                    itemToString={(item) => diagnoses.find((r) => r.id === item)?.text ?? ''}
                    onChange={(e) => {
                      field.onChange(e.selectedItems);
                      setValidationEnabled(true);
                    }}
                  />
                )}
              />
            </Layer>
          </Column>
          <Row className={styles.formClaimRow}>
            <Column className={styles.formClaimColumn}>
              <Layer className={styles.input}>
                <Controller
                  control={control}
                  name="provider"
                  render={({ field }) => (
                    <ComboBox
                      id="provider"
                      invalid={shouldShowError('provider')}
                      invalidText={errors.provider?.message}
                      placeholder={t('selectProvider', 'Select Provider')}
                      titleText={t('provider', 'Provider')}
                      items={providers}
                      itemToString={(item) => item?.display?.split('-')?.at(-1)?.trim() ?? ''}
                      initialSelectedItem={
                        field.value && providers ? providers.find((p) => p.uuid === field.value) : null
                      }
                      onChange={({ selectedItem }) => {
                        field.onChange(selectedItem?.uuid || '');
                        setValidationEnabled(true);
                      }}
                      name={field.name}
                      onBlur={field.onBlur}
                      ref={field.ref}
                    />
                  )}
                />
              </Layer>
            </Column>
          </Row>
          <ClaimExplanationAndJusificationInput
            patientUuid={patientUuid}
            disabled={!packages?.length || !interventions?.length}
            validationEnabled={validationEnabled}
            onInteraction={() => setValidationEnabled(true)}
          />

          <ButtonSet className={styles.buttonSet}>
            <Button className={styles.button} kind="secondary" onClick={handleDiscardClaim}>
              {t('discardClaim', 'Discard Claim')}
            </Button>

            {otpState === OTPState.NOT_STARTED && (
              <Button
                className={styles.button}
                kind="primary"
                onClick={handleSubmit(handleInitiateOTPVerification)}
                disabled={!isFormValid || !displayPhoneNumber}
                tooltipPosition="top"
                tooltipAlignment="center">
                {t('sendOtp', 'Send OTP')}
              </Button>
            )}

            {otpState === OTPState.REQUESTED && (
              <Button className={styles.button} kind="ghost" onClick={handleReopenOTPModal}>
                {t('enterOtp', 'Enter OTP')}
              </Button>
            )}

            {otpState === OTPState.VERIFIED && (
              <Button
                className={styles.button}
                kind="primary"
                onClick={handleProcessVerifiedClaim}
                disabled={!pendingClaimData || loading}
                tooltipPosition="top"
                tooltipAlignment="center">
                {loading ? (
                  <InlineLoading description={t('processing', 'Processing claim...')} />
                ) : (
                  t('processClaim', 'Process Claim')
                )}
              </Button>
            )}
          </ButtonSet>
        </Stack>
      </Form>
    </FormProvider>
  );
};

export default ClaimsForm;
