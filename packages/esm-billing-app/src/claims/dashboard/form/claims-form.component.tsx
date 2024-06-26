import React, { useEffect, useMemo, useState } from 'react';
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
  InlineLoading,
  InlineNotification,
} from '@carbon/react';
import styles from './claims-form.scss';
import { MappedBill, LineItem } from '../../../types';
import { navigate } from '@openmrs/esm-framework';
import { useSystemSetting } from '../../../hooks/getMflCode';
import { useParams } from 'react-router-dom';
import { processClaims, useProviders, useVisit } from './claims-form.resource';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { extractNameString, formatDate } from '../../../helpers/functions';

type ClaimsFormProps = {
  bill: MappedBill;
  selectedLineItems: LineItem[];
};

const ClaimsFormSchema = z.object({
  claimCode: z.string().nonempty({ message: 'Claim code is required' }),
  guaranteeId: z.string().nonempty({ message: 'Guarantee Id is required' }),
  claimExplanation: z.string().nonempty({ message: 'Claim explanation is required' }),
  claimJustification: z.string().nonempty({ message: 'Claim justification is required' }),
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

const ClaimsForm: React.FC<ClaimsFormProps> = ({ bill, selectedLineItems }) => {
  const { t } = useTranslation();
  const { mflCodeValue } = useSystemSetting('facility.mflcode');
  const { patientUuid, billUuid } = useParams();
  const { visits: recentVisit } = useVisit(patientUuid);
  const visitUuid = recentVisit?.visitType.uuid;

  const { data } = useProviders();
  const [providers, setProviders] = useState([]);
  const [notification, setNotification] = useState({ kind: '', title: '', subtitle: '', timeoutId: null });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data && data.data.results) {
      setProviders(data.data.results.map((provider) => ({ id: provider.uuid, text: provider.display })));
    }
  }, [data]);

  const handleNavigateToBillingOptions = () =>
    navigate({
      to: window.getOpenmrsSpaBase() + `home/billing/patient/${patientUuid}/${billUuid}`,
    });

  const diagnoses = useMemo(() => {
    return (
      recentVisit?.encounters?.flatMap(
        (encounter) =>
          encounter.diagnoses.map((diagnosis) => ({
            id: diagnosis.diagnosis.coded.uuid,
            text: diagnosis.display,
            certainty: diagnosis.certainty,
          })) || [],
      ) || []
    );
  }, [recentVisit]);

  const confirmedDiagnoses = useMemo(() => {
    return diagnoses.filter((diagnosis) => diagnosis.certainty === 'CONFIRMED');
  }, [diagnoses]);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    reset,
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
      visitType: recentVisit?.visitType?.display || '',
      facility: `${recentVisit?.location?.display || ''} - ${mflCodeValue || ''}`,
      treatmentStart: recentVisit?.startDatetime ? formatDate(recentVisit.startDatetime) : '',
      treatmentEnd: recentVisit?.stopDatetime ? formatDate(recentVisit.stopDatetime) : '',
    },
  });

  const clearNotification = () => {
    if (notification.timeoutId) {
      clearTimeout(notification.timeoutId);
    }
    setNotification({ kind: '', title: '', subtitle: '', timeoutId: null });
  };

  const onSubmit = async (data) => {
    setLoading(true);
    const providedItems = selectedLineItems.reduce((acc, item) => {
      acc[item.uuid] = {
        items: [
          {
            uuid: '70116AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            price: item.price,
            quantity: item.quantity,
            item: item.uuid,
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
      diagnoses: data.diagnoses.map((diagnosis) => diagnosis.id),
      paidInFacility: true,
      patient: patientUuid,
      visitType: visitUuid,
      guaranteeId: data.guaranteeId,
      providers: data.providerName.map((provider) => provider.id),
      claimCode: data.claimCode,
      use: 'claim',
      insurer: 'SHA',
      billNumber: billUuid,
    };

    try {
      await processClaims(payload);
      const timeoutId = setTimeout(clearNotification, 5000);
      setNotification({
        kind: 'success',
        title: t('processClaim', 'Process Claim'),
        subtitle: t('sendClaim', 'Claim sent successfully'),
        timeoutId,
      });
      reset();
      setTimeout(() => {
        navigate({
          to: window.getOpenmrsSpaBase() + `home/billing/`,
        });
      }, 2000);
    } catch (err) {
      console.error(err);
      const timeoutId = setTimeout(clearNotification, 3000);
      setNotification({
        kind: 'error',
        title: t('claimError', 'Claim Error'),
        subtitle: t('sendClaimError', 'Request Failed, Please try later........'),
        timeoutId,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setValue('diagnoses', confirmedDiagnoses);
    setValue('visitType', recentVisit?.visitType?.display || '');
    setValue('facility', `${recentVisit?.location?.display || ''} - ${mflCodeValue || ''}`);
    setValue('treatmentStart', recentVisit?.startDatetime ? formatDate(recentVisit.startDatetime) : '');
    setValue('treatmentEnd', recentVisit?.stopDatetime ? formatDate(recentVisit.stopDatetime) : '');
  }, [confirmedDiagnoses, recentVisit, mflCodeValue, setValue]);
  useEffect(() => {
    return () => {
      if (notification.timeoutId) {
        clearTimeout(notification.timeoutId);
      }
    };
  }, [notification.timeoutId]);

  return (
    <Form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <Stack gap={4} className={styles.grid}>
        <span className={styles.claimFormTitle}>{t('formTitle', 'Fill in the form details')}</span>
        {notification.kind && (
          <InlineNotification
            kind={notification.kind}
            title={notification.title}
            subtitle={notification.subtitle}
            lowContrast
            hideCloseButton
          />
        )}
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
                  items={providers}
                  itemToString={(item) => (item ? extractNameString(item.text) : '')}
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
  );
};

export default ClaimsForm;
