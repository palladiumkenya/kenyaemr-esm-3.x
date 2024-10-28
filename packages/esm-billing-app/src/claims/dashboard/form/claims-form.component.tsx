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
  TextArea,
  TextInput,
  TextInputSkeleton,
} from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { navigate, showSnackbar, useSession } from '@openmrs/esm-framework';
import React, { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { z } from 'zod';
import PackageIntervensions from '../../../benefits-package/forms/package-intervensions.component';
import { formatDate } from '../../../helpers/functions';
import { useSystemSetting } from '../../../hooks/getMflCode';
import usePackages from '../../../hooks/usePackages';
import usePatientDiagnosis from '../../../hooks/usePatientDiagnosis';
import { LineItem, MappedBill } from '../../../types';
import { processClaims, useVisit } from './claims-form.resource';
import styles from './claims-form.scss';
import useProvider from '../../../hooks/useProvider';

type ClaimsFormProps = {
  bill: MappedBill;
  selectedLineItems: LineItem[];
};

const ClaimsFormSchema = z.object({
  claimExplanation: z.string().nonempty({ message: 'Claim explanation is required' }),
  claimJustification: z.string().nonempty({ message: 'Claim justification is required' }),
  diagnoses: z.array(z.string()).nonempty({ message: 'At least one diagnosis is required' }),
  visitType: z.string().nonempty({ message: 'Visit type is required' }),
  facility: z.string().nonempty({ message: 'Facility is required' }),
  treatmentStart: z.string().nonempty({ message: 'Treatment start date is required' }),
  treatmentEnd: z.string().nonempty({ message: 'Treatment end date is required' }),
  package: z.string().min(1, 'Package Required'),
  interventions: z.array(z.string()).nonempty({ message: 'At least one intervention is required' }),
  provider: z.string().nonempty({ message: 'provider is provider' }),
});

const ClaimsForm: React.FC<ClaimsFormProps> = ({ bill, selectedLineItems }) => {
  const { t } = useTranslation();
  const { mflCodeValue } = useSystemSetting('facility.mflcode');
  const { patientUuid, billUuid } = useParams();
  const { visits: recentVisit, error: visitError, isLoading: visitLoading } = useVisit(patientUuid);
  const { diagnoses, error: diagnosisError, isLoading: diagnosisLoading } = usePatientDiagnosis(patientUuid);
  const { error: packagesError, isLoading: packagesLoading, packages } = usePackages();
  const {
    currentProvider: { uuid: providerUuid },
  } = useSession();
  const { providerLoading: providerLoading, provider, error: providerError } = useProvider(providerUuid);

  const encounterUuid = recentVisit?.encounters[0]?.uuid;
  const visitTypeUuid = recentVisit?.visitType.uuid;

  const [loading, setLoading] = useState(false);
  const { user } = useSession();

  const handleNavigateToBillingOptions = () =>
    navigate({
      to: window.getOpenmrsSpaBase() + `home/billing/patient/${patientUuid}/${billUuid}`,
    });

  const form = useForm<z.infer<typeof ClaimsFormSchema>>({
    mode: 'all',
    resolver: zodResolver(ClaimsFormSchema),
    defaultValues: {
      claimExplanation: '',
      claimJustification: '',
      diagnoses: [],
      visitType: recentVisit?.visitType?.display || '',
      facility: `${recentVisit?.location?.display || ''} - ${mflCodeValue || ''}`,
      treatmentStart: recentVisit?.startDatetime ? formatDate(recentVisit.startDatetime) : '',
      treatmentEnd: recentVisit?.stopDatetime ? formatDate(recentVisit.stopDatetime) : '',
      package: '',
      interventions: [],
      provider: providerUuid,
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    reset,
  } = form;

  const onSubmit = async (data: z.infer<typeof ClaimsFormSchema>) => {
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
      packages: [data.package],
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
      reset();
      setTimeout(() => {
        navigate({
          to: window.getOpenmrsSpaBase() + `home/billing/`,
        });
      }, 2000);
    } catch (err) {
      console.error(err);
      showSnackbar({
        kind: 'error',
        title: t('claimError', 'Claim Error'),
        subtitle: t('sendClaimError', 'Request Failed, Please try later........'),
        timeoutInMs: 2500,
        isLowContrast: true,
      });
    } finally {
      setLoading(false);
    }
  };
  const selectedPackageObservable = form.watch('package');

  useEffect(() => {
    setValue('diagnoses', diagnoses?.map((d) => d.id) ?? ([] as any));
    setValue('visitType', recentVisit?.visitType?.display || '');
    setValue('facility', `${recentVisit?.location?.display || ''} - ${mflCodeValue || ''}`);
    setValue('treatmentStart', recentVisit?.startDatetime ? formatDate(recentVisit.startDatetime) : '');
    setValue('treatmentEnd', recentVisit?.stopDatetime ? formatDate(recentVisit.stopDatetime) : '');
  }, [diagnoses, recentVisit, mflCodeValue, setValue, provider]);

  if (visitLoading || diagnosisLoading || packagesLoading || providerLoading) {
    return (
      <Layer className={styles.loading}>
        {Array.from({ length: 6 }).map((_, index) => (
          <TextInputSkeleton key={index} />
        ))}
      </Layer>
    );
  }

  if (visitError || diagnosisError || packagesError || providerError) {
    return (
      <Layer className={styles.loading}>
        <InlineNotification
          kind="error"
          subtitle={
            visitError?.message ??
            diagnosisError?.message ??
            packagesError?.message ??
            providerError?.message ??
            'Error occured while loading claims form'
          }
          lowContrast
        />
      </Layer>
    );
  }

  return (
    <FormProvider {...form}>
      <Form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
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
          <Column>
            <Layer className={styles.input}>
              <Controller
                control={form.control}
                name="package"
                render={({ field }) => (
                  <>
                    {packagesError ? (
                      <InlineNotification
                        kind="error"
                        subtitle={t('errorFetchingPackages', 'Error fetching packeges')}
                        lowContrast
                      />
                    ) : (
                      <Dropdown
                        ref={field.ref}
                        invalid={form.formState.errors[field.name]?.message}
                        invalidText={form.formState.errors[field.name]?.message}
                        id="package"
                        titleText={t('package', 'Package')}
                        onChange={(e) => {
                          field.onChange(e.selectedItem);
                        }}
                        initialSelectedItem={field.value}
                        label="Choose package"
                        items={packages.map((r) => r.uuid)}
                        itemToString={(item) => packages.find((r) => r.uuid === item)?.packageName ?? ''}
                      />
                    )}
                  </>
                )}
              />
            </Layer>
          </Column>
          {selectedPackageObservable && (
            <Column>
              <Layer className={styles.input}>
                <PackageIntervensions
                  category={packages.find((package_) => package_.uuid === selectedPackageObservable)?.packageCode ?? ''}
                />
              </Layer>
            </Column>
          )}

          <Column>
            <Layer className={styles.input}>
              <Controller
                control={form.control}
                name="diagnoses"
                render={({ field }) => (
                  <MultiSelect
                    ref={field.ref}
                    invalid={form.formState.errors[field.name]?.message}
                    invalidText={form.formState.errors[field.name]?.message}
                    id="diagnoses"
                    titleText={t('diagnosis', 'Diagnosis')}
                    selectedItems={field.value}
                    label="Choose option"
                    items={diagnoses.map((r) => r.id)}
                    itemToString={(item) => diagnoses.find((r) => r.id === item)?.text ?? ''}
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
                    <Dropdown
                      ref={field.ref}
                      invalid={form.formState.errors[field.name]?.message}
                      invalidText={form.formState.errors[field.name]?.message}
                      id="provider"
                      titleText={t('provider', 'Provider')}
                      onChange={(e) => {
                        field.onChange(e.selectedItem);
                      }}
                      initialSelectedItem={field.value}
                      label="Choose option"
                      items={[provider].map((r) => r.uuid)}
                      itemToString={(item) =>
                        [provider]
                          .find((r) => r.uuid === item)
                          ?.display.split('-')
                          .at(-1)
                          .trim() ?? ''
                      }
                    />
                  )}
                />
              </Layer>
            </Column>
          </Row>
          <Column>
            <Layer className={styles.input}>
              <Controller
                control={control}
                name="claimExplanation"
                render={({ field }) => (
                  <TextArea
                    {...field}
                    labelText={t('claimExplanation', 'Claim Explanation')}
                    rows={3}
                    placeholder="Claim Explanation"
                    id="claimExplanation"
                    invalid={!!errors.claimExplanation}
                    invalidText={errors.claimExplanation?.message}
                  />
                )}
              />
            </Layer>
          </Column>
          <Column>
            <Layer className={styles.input}>
              <Controller
                control={control}
                name="claimJustification"
                render={({ field }) => (
                  <TextArea
                    {...field}
                    labelText={t('claimJustification', 'Claim Justification')}
                    rows={3}
                    placeholder="Claim Justification"
                    id="claimJustification"
                    invalid={!!errors.claimJustification}
                    invalidText={errors.claimJustification?.message}
                  />
                )}
              />
            </Layer>
          </Column>
          <ButtonSet className={styles.buttonSet}>
            <Button className={styles.button} kind="secondary" onClick={handleNavigateToBillingOptions}>
              {t('discardClaim', 'Discard Claim')}
            </Button>
            <Button className={styles.button} kind="primary" type="submit" disabled={!isValid || loading}>
              {loading ? (
                <InlineLoading description={t('processing', 'Processing...')} />
              ) : (
                t('processClaim', 'Process Claim')
              )}
            </Button>
          </ButtonSet>
        </Stack>
      </Form>
    </FormProvider>
  );
};

export default ClaimsForm;
