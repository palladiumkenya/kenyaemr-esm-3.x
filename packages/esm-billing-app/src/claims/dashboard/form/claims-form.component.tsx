import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Column,
  TextArea,
  Form,
  Layer,
  Stack,
  TextInput,
  Row,
  ButtonSet,
  Button,
  FilterableMultiSelect,
  MultiSelect,
} from '@carbon/react';
import styles from './claims-form.scss';
import { MappedBill } from '../../../types';
import { formatDate, navigate, showSnackbar } from '@openmrs/esm-framework';
import { useSystemSetting } from '../../../hooks/getMflCode';
import { useParams } from 'react-router-dom';
import { useVisit } from './claims-form.resource';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

type ClaimsFormProps = {
  bill: MappedBill;
};

const ClaimsFormSchema = z.object({
  claimCode: z.string().nonempty({ message: 'Claim code is required' }),
  guaranteeId: z.string().nonempty({ message: 'Claim code is required' }),
  claimExplanation: z.string().nonempty({ message: 'Claim explanation is required' }),
  claimJustification: z.string().nonempty({ message: 'Claim explanation is required' }),
  providerName: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
      }),
    )
    .nonempty({ message: 'At least one provider is required' }),
  diagnoses: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
      }),
    )
    .nonempty({ message: 'At least one diagnosis is required' }),
  visitType: z.string().nonempty({ message: 'Visit type is required' }),
  facility: z.string().nonempty({ message: 'Facility is required' }),
  treatmentStart: z.string().nonempty({ message: 'Treatment start date is required' }),
  treatmentEnd: z.string().nonempty({ message: 'Treatment end date is required' }),
});

const ClaimsForm: React.FC<ClaimsFormProps> = ({ bill }) => {
  const { t } = useTranslation();
  const { mflCodeValue } = useSystemSetting('facility.mflcode');
  const { patientUuid, billUuid } = useParams();
  const { visits: recentVisit } = useVisit(patientUuid);

  const handleNavigateToBillingOptions = () =>
    navigate({
      to: window.getOpenmrsSpaBase() + `home/billing/patient/${patientUuid}/${billUuid}`,
    });

  const encounterProviders =
    recentVisit?.encounters.flatMap((encounter) =>
      encounter.encounterProviders.map((provider) => ({
        id: provider.uuid,
        text: provider.display,
      })),
    ) || [];

  const diagnoses = useMemo(
    () =>
      recentVisit?.encounters.flatMap(
        (encounter) =>
          encounter.diagnoses.map((diagnosis) => ({
            id: diagnosis.diagnosis.coded.uuid,
            text: diagnosis.display,
            certainty: diagnosis.certainty,
          })) || [],
      ) || [],
    [recentVisit],
  );

  const confirmedDiagnoses = useMemo(
    () => diagnoses.filter((diagnosis) => diagnosis.certainty === 'CONFIRMED'),
    [diagnoses],
  );
  const patientName = bill.patientName;

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
  } = useForm({
    mode: 'all',
    resolver: zodResolver(ClaimsFormSchema),
    defaultValues: {
      claimCode: '',
      guaranteeId: '',
      claimExplanation: '',
      claimJustification: '',

      providerName: [],
      diagnoses: [],
      visitType: recentVisit?.visitType.display || '',
      facility: `${recentVisit?.location.display || ''} - ${mflCodeValue || ''}`,
      treatmentStart: recentVisit?.startDatetime
        ? formatDate(new Date(recentVisit.startDatetime), { mode: 'standard' })
        : '',
      treatmentEnd: recentVisit?.stopDatetime
        ? formatDate(new Date(recentVisit.stopDatetime), { mode: 'standard' })
        : '',
    },
  });

  const onSubmit = (data) => {
    const lineItemUuids = bill.lineItems.map((item) => item.uuid);
    const payload = {
      providedItems: {
        [billUuid]: {
          items: lineItemUuids,
          explanation: data.claimExplanation,
          justification: data.claimJustification,
        },
      },
      claimExplanation: data.claimExplanation,
      claimJustification: data.claimJustification,
      startDate: data.treatmentStart,
      endDate: data.treatmentEnd,
      location: mflCodeValue,
      diagnoses: data.diagnoses.map((diagnosis) => diagnosis.id),
      paidInFacility: true,
      patient: patientName,
      visitType: data.visitType,
      guaranteeId: data.guaranteeId,
      provider: data.providerName.map((provider) => provider.text),
      claimCode: data.claimCode,
      billNumber: bill.receiptNumber,
      use: 'claim',
      insurer: 'SHA',
    };
    showSnackbar({
      title: t('processClaim', 'Process Claim'),
      subtitle: t('sendClaim', 'Claim send successfully'),
      kind: 'success',
      timeoutInMs: 3500,
      isLowContrast: true,
    });
  };

  useEffect(() => {
    setValue('diagnoses', confirmedDiagnoses);
    setValue('visitType', recentVisit?.visitType.display || '');
    setValue('facility', `${recentVisit?.location.display || ''} - ${mflCodeValue || ''}`);
    setValue(
      'treatmentStart',
      recentVisit?.startDatetime ? formatDate(new Date(recentVisit.startDatetime), { mode: 'standard' }) : '',
    );
    setValue(
      'treatmentEnd',
      recentVisit?.stopDatetime ? formatDate(new Date(recentVisit.stopDatetime), { mode: 'standard' }) : '',
    );
  }, [confirmedDiagnoses, recentVisit, mflCodeValue, setValue]);

  return (
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
                    id="visitType"
                    labelText={t('visitType', 'Visit Type')}
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
              control={control}
              name="diagnoses"
              render={({ field }) => (
                <MultiSelect
                  {...field}
                  id="diagnoses"
                  titleText={t('diagnoses', 'Diagnoses')}
                  items={diagnoses}
                  itemToString={(item) => (item ? item.text : '')}
                  selectionFeedback="top-after-reopen"
                  selectedItems={field.value}
                  onChange={({ selectedItems }) => field.onChange(selectedItems)}
                />
              )}
            />
          </Layer>
        </Column>
        <Column>
          <Layer className={styles.input}>
            <Controller
              control={control}
              name="providerName"
              render={({ field }) => (
                <FilterableMultiSelect
                  {...field}
                  id="provider_name"
                  titleText={t('provider_name', 'Provider Name')}
                  items={encounterProviders}
                  itemToString={(item) => (item ? item.text : '')}
                  selectionFeedback="top-after-reopen"
                  selectedItems={field.value}
                  onChange={({ selectedItems }) => field.onChange(selectedItems)}
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
                name="guaranteeId"
                render={({ field }) => (
                  <TextInput
                    {...field}
                    id="guaranteeId"
                    placeholder="Guarantee Id"
                    labelText={t('guaranteeId', 'Guarantee Id')}
                    invalid={!!errors.guaranteeId}
                    invalidText={errors.guaranteeId?.message}
                  />
                )}
              />
            </Layer>
          </Column>
          <Column className={styles.formClaimColumn}>
            <Layer className={styles.input}>
              <Controller
                control={control}
                name="claimCode"
                render={({ field }) => (
                  <TextInput
                    {...field}
                    id="claimcode"
                    placeholder="Claim Code"
                    labelText={t('claimcode', 'Claim Code')}
                    invalid={!!errors.claimCode}
                    invalidText={errors.claimCode?.message}
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
          <Button className={styles.button} kind="primary" type="submit" disabled={!isValid}>
            {t('processClaim', 'Process Claim')}
          </Button>
        </ButtonSet>
      </Stack>
    </Form>
  );
};

export default ClaimsForm;
