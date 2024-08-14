import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Column, TextArea, Form, Layer, Stack, TextInput, Row, Button, ButtonSet, MultiSelect } from '@carbon/react';
import { navigate, showSnackbar } from '@openmrs/esm-framework';
import { useSystemSetting } from '../../../hooks/getMflCode';
import { useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useVisit } from '../../dashboard/form/claims-form.resource';
import styles from './pre-auth-form.scss';
import { LineItem, MappedBill } from '../../../types';
import { spaBasePath } from '../../../constants';

type PreAuthFormProps = {
  bill: MappedBill;
  selectedLineItems: LineItem[];
};

const PreAuthFormSchema = z.object({
  claimCode: z.string().nonempty('Claim code is required'),
  guaranteeId: z.string().nonempty('Guarantee Id is required'),
  preAuthJustification: z.string().nonempty('Pre-Auth Justification is required'),
  providerName: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
      }),
    )
    .nonempty('At least one provider is required'),
  diagnoses: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
      }),
    )
    .nonempty('At least one diagnosis is required'),
  visitType: z.string().nonempty('Visit type is required'),
  facility: z.string().nonempty('Facility is required'),
});

const PreAuthForm: React.FC<PreAuthFormProps> = ({ bill, selectedLineItems }) => {
  const { t } = useTranslation();
  const { mflCodeValue } = useSystemSetting('facility.mflcode');
  const { patientUuid, billUuid } = useParams();
  const { visits: recentVisit } = useVisit(patientUuid);

  const handleNavigateToBillingOptions = () =>
    navigate({
      to: window.getOpenmrsSpaBase() + `home/billing/patient/${patientUuid}/${billUuid}`,
    });

  const diagnoses = useMemo(
    () =>
      recentVisit?.encounters?.flatMap((encounter) =>
        encounter.diagnoses.map((diagnosis) => ({
          id: diagnosis.diagnosis.coded.uuid,
          text: diagnosis.display,
          certainty: diagnosis.certainty,
        })),
      ) || [],
    [recentVisit],
  );

  const confirmedDiagnoses = useMemo(
    () => diagnoses.filter((diagnosis) => diagnosis.certainty === 'CONFIRMED'),
    [diagnoses],
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    reset,
  } = useForm({
    mode: 'all',
    resolver: zodResolver(PreAuthFormSchema),
    defaultValues: {
      claimCode: '',
      guaranteeId: '',
      preAuthJustification: '',
      diagnoses: [],
      visitType: recentVisit?.visitType?.display || '',
      facility: `${recentVisit?.location?.display || ''} - ${mflCodeValue || ''}`,
    },
  });

  useEffect(() => {
    setValue('diagnoses', confirmedDiagnoses);
    setValue('visitType', recentVisit?.visitType?.display || '');
    setValue('facility', `${recentVisit?.location?.display || ''} - ${mflCodeValue || ''}`);
  }, [confirmedDiagnoses, recentVisit, mflCodeValue, setValue]);

  const onSubmit = async (data: any) => {
    showSnackbar({
      kind: 'success',
      title: t('requestPreAuth', 'Requesting Pre-Auth Information'),
      subtitle: t('sendClaim', 'Pre Auth sent successfully'),
      timeoutInMs: 3000,
      isLowContrast: true,
    });
  };

  return (
    <Form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <Stack gap={4} className={styles.grid}>
        <span className={styles.preAuthFormTitle}>{t('formTitle', 'Fill in the form details')}</span>
        <Column>
          <Layer className={styles.input}>
            <Controller
              control={control}
              name="preAuthJustification"
              render={({ field }) => (
                <TextArea
                  {...field}
                  labelText={t('preAuthJustification', 'Pre-Auth Justification')}
                  rows={3}
                  placeholder={t('preAuthJustification', 'Pre-Auth Justification')}
                  id="preAuthJustification"
                  invalid={!!errors.preAuthJustification}
                  invalidText={errors.preAuthJustification?.message}
                />
              )}
            />
          </Layer>
        </Column>
        <Row className={styles.formPreAuthRow}>
          <Column className={styles.formPreAuthColumn}>
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
          <Column className={styles.formPreAuthColumn}>
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
        <Row className={styles.formPreAuthRow}>
          <Column className={styles.formPreAuthColumn}>
            <Layer className={styles.input}>
              <Controller
                control={control}
                name="guaranteeId"
                render={({ field }) => (
                  <TextInput
                    {...field}
                    id="guaranteeId"
                    placeholder={t('guaranteeId', 'Guarantee Id')}
                    labelText={t('guaranteeId', 'Guarantee Id')}
                    invalid={!!errors.guaranteeId}
                    invalidText={errors.guaranteeId?.message}
                  />
                )}
              />
            </Layer>
          </Column>
          <Column className={styles.formPreAuthColumn}>
            <Layer className={styles.input}>
              <Controller
                control={control}
                name="claimCode"
                render={({ field }) => (
                  <TextInput
                    {...field}
                    id="claimCode"
                    placeholder={t('claimCode', 'Claim Code')}
                    labelText={t('claimCode', 'Claim Code')}
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
        <ButtonSet className={styles.buttonSet}>
          <Button type="button" kind="danger" onClick={handleNavigateToBillingOptions}>
            {t('discard', 'Discard')}
          </Button>
          <Button type="submit" kind="primary">
            {t('submitRequest', 'Pre-Auth Request')}
          </Button>
        </ButtonSet>
      </Stack>
    </Form>
  );
};
export default PreAuthForm;
