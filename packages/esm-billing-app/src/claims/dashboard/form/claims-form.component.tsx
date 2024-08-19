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
  MultiSelect,
  InlineLoading,
  Tag,
} from '@carbon/react';
import styles from './claims-form.scss';
import { MappedBill, LineItem } from '../../../types';
import { navigate, showSnackbar, useSession } from '@openmrs/esm-framework';
import { useSystemSetting } from '../../../hooks/getMflCode';
import { useParams } from 'react-router-dom';
import { processClaims, useInterventions, usePackages, useVisit } from './claims-form.resource';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { formatDate } from '../../../helpers/functions';

type ClaimsFormProps = {
  bill: MappedBill;
  selectedLineItems: LineItem[];
};

const ClaimsFormSchema = z.object({
  claimExplanation: z.string().nonempty({ message: 'Claim explanation is required' }),
  claimJustification: z.string().nonempty({ message: 'Claim justification is required' }),
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
  packages: z.array(z.string()).nonempty({ message: 'At least one package is required' }),
  interventions: z.array(z.string()).nonempty({ message: 'At least one intervention is required' }),
  cashier: z.string().nonempty({ message: 'Cashier is required' }),
});

const ClaimsForm: React.FC<ClaimsFormProps> = ({ bill, selectedLineItems }) => {
  const { t } = useTranslation();
  const { mflCodeValue } = useSystemSetting('facility.mflcode');
  const { patientUuid, billUuid } = useParams();
  const { visits: recentVisit } = useVisit(patientUuid);
  const visitUuid = recentVisit?.visitType.uuid;
  const { interventions } = useInterventions();
  const { packages } = usePackages();

  const [loading, setLoading] = useState(false);
  const { user } = useSession();

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
      claimExplanation: '',
      claimJustification: '',
      diagnoses: [],
      visitType: recentVisit?.visitType?.display || '',
      facility: `${recentVisit?.location?.display || ''} - ${mflCodeValue || ''}`,
      treatmentStart: recentVisit?.startDatetime ? formatDate(recentVisit.startDatetime) : '',
      treatmentEnd: recentVisit?.stopDatetime ? formatDate(recentVisit.stopDatetime) : '',
      packages: [],
      interventions: [],
      cashier: user?.display || '',
    },
  });

  const onSubmit = async (data) => {
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
      diagnoses: data.diagnoses.map((diagnosis) => diagnosis.id),
      paidInFacility: true,
      patient: patientUuid,
      visitType: visitUuid,
      guaranteeId: 'G-001',
      claimCode: 'C-001',
      cashier: user.uuid,
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

  useEffect(() => {
    setValue('diagnoses', confirmedDiagnoses);
    setValue('visitType', recentVisit?.visitType?.display || '');
    setValue('facility', `${recentVisit?.location?.display || ''} - ${mflCodeValue || ''}`);
    setValue('treatmentStart', recentVisit?.startDatetime ? formatDate(recentVisit.startDatetime) : '');
    setValue('treatmentEnd', recentVisit?.stopDatetime ? formatDate(recentVisit.stopDatetime) : '');
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
              name="packages"
              render={({ field }) => (
                <>
                  <>
                    <div>
                      {field.value.map((item, index) => (
                        <Tag key={index} type="high-contrast">
                          {packages.find((pkg) => pkg.shaPackageCode === item)?.shaPackageName || ''}
                        </Tag>
                      ))}
                    </div>
                  </>
                  <MultiSelect
                    {...field}
                    items={packages}
                    titleText={t('packages', 'Packages')}
                    itemToString={(item) => (item ? item.shaPackageName : '')}
                    label={field.value.length === 0 ? t('packagesOptions', 'Choose packages') : ''}
                    id="packages"
                    invalid={!!errors.packages}
                    invalidText={errors.packages?.message}
                    placeholder="Select Packages"
                    onChange={({ selectedItems }) => {
                      field.onChange(selectedItems.map((item) => item.shaPackageCode));
                    }}
                  />
                </>
              )}
            />
          </Layer>
        </Column>
        <Column>
          <Layer className={styles.input}>
            <Controller
              control={control}
              name="interventions"
              render={({ field }) => (
                <>
                  <div>
                    {field.value.map((item, index) => {
                      const intervention = interventions.find((interv) => interv.shaInterventionCode === item);
                      return (
                        <Tag key={index} type="high-contrast">
                          {intervention ? intervention.shaInterventionName : ''}
                        </Tag>
                      );
                    })}
                  </div>
                  <MultiSelect
                    {...field}
                    items={interventions}
                    titleText={t('interventions', 'Interventions')}
                    itemToString={(item) => (item ? item.shaInterventionName : '')}
                    label={field.value.length === 0 ? t('interventionsOption', 'Choose interventions') : ''}
                    id="interventions"
                    invalid={!!errors.interventions}
                    invalidText={errors.interventions?.message}
                    placeholder="Select Interventions"
                    onChange={({ selectedItems }) => {
                      field.onChange(selectedItems.map((item) => item.shaInterventionCode));
                    }}
                  />
                </>
              )}
            />
          </Layer>
        </Column>
        <Column>
          <Layer className={styles.input}>
            <Controller
              control={control}
              name="diagnoses"
              render={({ field }) => (
                <>
                  <div>
                    {field.value.map((item, index) => (
                      <Tag key={index} type="high-contrast">
                        {item.text}
                      </Tag>
                    ))}
                  </div>
                  <MultiSelect
                    {...field}
                    id="diagnoses"
                    titleText={t('diagnoses', 'Diagnoses')}
                    items={diagnoses}
                    itemToString={(item) => (item ? item.text : '')}
                    selectionFeedback="top-after-reopen"
                    label={field.value.length === 0 ? t('chooseDiagnosis', 'Choose diagnosis') : ''}
                    selectedItems={field.value}
                    onChange={({ selectedItems }) => field.onChange(selectedItems)}
                  />
                </>
              )}
            />
          </Layer>
        </Column>
        <Row className={styles.formClaimRow}>
          <Column className={styles.formClaimColumn}>
            <Layer className={styles.input}>
              <Controller
                control={control}
                name="cashier"
                render={({ field }) => (
                  <TextInput
                    {...field}
                    id="cashier"
                    labelText={t('cashierName', 'Cashier Name')}
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
