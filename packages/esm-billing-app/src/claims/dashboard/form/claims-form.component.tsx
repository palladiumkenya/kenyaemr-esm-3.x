import {
  Button,
  ButtonSet,
  Column,
  Dropdown,
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
import { navigate, showSnackbar, useConfig, useSession } from '@openmrs/esm-framework';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { z } from 'zod';
import SHABenefitPackangesAndInterventions from '../../../benefits-package/forms/packages-and-interventions-form.component';
import { BillingConfig } from '../../../config-schema';
import { formatDate } from '../../../helpers/functions';
import { useSystemSetting } from '../../../hooks/getMflCode';
import usePatientDiagnosis from '../../../hooks/usePatientDiagnosis';
import useProvider from '../../../hooks/useProvider';
import { LineItem, MappedBill } from '../../../types';
import ClaimExplanationAndJusificationInput from './claims-explanation-and-justification-form-input.component';
import { processClaims, SHAPackagesAndInterventionVisitAttribute, useVisit } from './claims-form.resource';
import useProviderList from '../../../hooks/useProviderList';

import styles from './claims-form.scss';
import debounce from 'lodash-es/debounce';

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

const ClaimsForm: React.FC<ClaimsFormProps> = ({ bill, selectedLineItems }) => {
  const { t } = useTranslation();
  const { mflCodeValue } = useSystemSetting('facility.mflcode');
  const { patientUuid, billUuid } = useParams();
  const { visits: recentVisit, error: visitError, isLoading: visitLoading } = useVisit(patientUuid);
  const { diagnoses, error: diagnosisError, isLoading: diagnosisLoading } = usePatientDiagnosis(patientUuid);
  const {
    currentProvider: { uuid: providerUuid },
  } = useSession();
  const { providerLoading: providerLoading, provider, error: providerError } = useProvider(providerUuid);
  const { visitAttributeTypes } = useConfig<BillingConfig>();
  const { providers, providersLoading } = useProviderList();

  const packagesAndinterventions = useMemo(() => {
    if (recentVisit) {
      const values = recentVisit.attributes?.find(
        (attr) => attr.attributeType.uuid === visitAttributeTypes.shaBenefitPackagesAndInterventions,
      )?.value;
      if (values) {
        const payload: SHAPackagesAndInterventionVisitAttribute = JSON.parse(values);
        return payload;
      }
    }
    return null;
  }, [recentVisit, visitAttributeTypes]);

  const encounterUuid = recentVisit?.encounters[0]?.uuid;
  const visitTypeUuid = recentVisit?.visitType.uuid;
  const [loading, setLoading] = useState(false);
  const [formInitialized, setFormInitialized] = useState(false);
  const [validationEnabled, setValidationEnabled] = useState(false);

  const handleNavigateToBillingOptions = () =>
    navigate({
      to: window.getOpenmrsSpaBase() + `home/billing/patient/${patientUuid}/${billUuid}`,
    });

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
    formState: { errors, isValid, isDirty, touchedFields },
    setValue,
    reset,
    trigger,
    watch,
  } = form;

  const packages = watch('packages');
  const interventions = watch('interventions');
  const claimExplanation = watch('claimExplanation');
  const claimJustification = watch('claimJustification');

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
        treatmentStart: recentVisit?.startDatetime ? formatDate(recentVisit.startDatetime) : '',
        treatmentEnd: recentVisit?.stopDatetime ? formatDate(recentVisit.stopDatetime) : '',
        packages: packagesAndinterventions?.packages ?? [],
        interventions: packagesAndinterventions?.interventions ?? [],
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
    packagesAndinterventions,
    visitLoading,
    diagnosisLoading,
    providerLoading,
    providerUuid,
  ]);

  const onSubmit = async (data: z.infer<typeof ClaimsFormSchema>) => {
    setValidationEnabled(true);
    const isFormValid = await trigger();
    if (!isFormValid) {
      return;
    }

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
      startDate: data.treatmentStart,
      endDate: data.treatmentEnd,
      location: mflCodeValue,
      diagnoses: data.diagnoses,
      paidInFacility: true,
      patient: patientUuid,
      visitType: visitTypeUuid,
      guaranteeId: 'G-001',
      claimCode: 'C-001',
      provider: data.provider,
      visitUuid: recentVisit.uuid,
      encounterUuid: encounterUuid,
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
        subtitle: t('sendClaim', 'Claim sent successfully'),
        timeoutInMs: 3000,
        isLowContrast: true,
      });
      setTimeout(() => {
        navigate({
          to: window.getOpenmrsSpaBase() + 'home/billing/',
        });
      }, 1000);
    } catch (err) {
      console.error(err);
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

  return (
    <FormProvider {...form}>
      <Form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
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
                      {...field}
                      id="provider"
                      invalid={shouldShowError('provider')}
                      invalidText={errors.provider?.message}
                      placeholder={t('providerPlaceholder', 'Select Provider')}
                      titleText={t('provider', 'Provider')}
                      items={providers}
                      itemToString={(item) => item?.display?.split('-')?.at(-1)?.trim() ?? ''}
                      selectedItem={providers?.find((p) => p?.uuid === field.value)}
                      onChange={({ selectedItem }) => {
                        field.onChange(selectedItem?.display?.split('-')?.at(-1)?.trim() ?? '');
                        setValidationEnabled(true);
                      }}
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
            <Button className={styles.button} kind="secondary" onClick={handleNavigateToBillingOptions}>
              {t('discardClaim', 'Discard Claim')}
            </Button>
            <Button
              className={styles.button}
              kind="primary"
              type="submit"
              onClick={() => setValidationEnabled(true)}
              disabled={
                loading || !isValid || !packages?.length || !interventions?.length || !selectedLineItems?.length
              }
              tooltipPosition="top"
              tooltipAlignment="center"
              renderIcon={loading ? InlineLoading : undefined}>
              {loading ? (
                <InlineLoading description={t('processing', 'Processing...')} />
              ) : (
                <>{t('processClaim', 'Process Claim')}</>
              )}
            </Button>
          </ButtonSet>
        </Stack>
      </Form>
    </FormProvider>
  );
};

export default ClaimsForm;
