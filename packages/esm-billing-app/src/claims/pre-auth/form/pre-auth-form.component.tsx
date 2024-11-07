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
  Button,
  ButtonSet,
  MultiSelect,
  Tag,
  InlineLoading,
} from '@carbon/react';
import { navigate, showSnackbar } from '@openmrs/esm-framework';
import { useSystemSetting } from '../../../hooks/getMflCode';
import { useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useVisit } from '../../dashboard/form/claims-form.resource';
import styles from './pre-auth-form.scss';
import { LineItem, MappedBill } from '../../../types';
import { useInterventions, usePackages } from './pre-auth-form.resource';
import { Service } from '../../../../../esm-lab-manifest-app/src/metrics/lab-manifest-metrics.component';

type PreAuthFormProps = {
  bill: MappedBill;
  selectedLineItems: LineItem[];
};

const PreAuthFormSchema = z.object({
  claimCode: z.string().nonempty({ message: 'Claim code is required' }),
  guaranteeId: z.string().nonempty({ message: 'Guarantee Id is required' }),
  preAuthJustification: z.string().nonempty({ message: 'Claim justification is required' }),
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
  packages: z.array(z.string()).nonempty({ message: 'At least one package is required' }),
  interventions: z.array(z.string()).nonempty({ message: 'At least one intervention is required' }),
});

const PreAuthForm: React.FC<PreAuthFormProps> = ({ bill, selectedLineItems }) => {
  const { t } = useTranslation();
  const { mflCodeValue } = useSystemSetting('facility.mflcode');
  const { patientUuid, billUuid } = useParams();
  const { visits: recentVisit } = useVisit(patientUuid);
  const { interventions } = useInterventions();
  const { packages } = usePackages();

  const [loading, setLoading] = useState(false);

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
    resolver: zodResolver(PreAuthFormSchema),
    defaultValues: {
      claimCode: '',
      guaranteeId: '',
      preAuthJustification: '',
      diagnoses: [],
      visitType: '',
      facility: '',
      packages: [],
      interventions: [],
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      showSnackbar({
        kind: 'success',
        title: t('requestPreAuth', 'Pre Authorization'),
        subtitle: t('sendClaim', 'Pre authorization request sent successfully'),
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
        title: t('requestPreAuthError', 'Pre Authorization Error'),
        subtitle: t('sendClaimError', 'Pre authorization request failed, please try later'),
        timeoutInMs: 2500,
        isLowContrast: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reset({
      diagnoses: confirmedDiagnoses,
      visitType: recentVisit?.visitType?.display || '',
      facility: `${recentVisit?.location?.display || ''} - ${mflCodeValue || ''}`,
      claimCode: '',
      guaranteeId: '',
      preAuthJustification: '',
      packages: [],
      interventions: [],
    });
  }, [confirmedDiagnoses, recentVisit, mflCodeValue, reset]);

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
                  placeholder="Claim Justification"
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
                    placeholder="Guarantee Id"
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
              name="packages"
              render={({ field }) => (
                <>
                  <>
                    <div>
                      {field.value.map((item, index) => (
                        <Tag key={index} type="high-contrast">
                          {item}
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

        <ButtonSet className={styles.buttonSet}>
          <Button className={styles.button} kind="secondary" onClick={handleNavigateToBillingOptions}>
            {t('discard', 'Discard')}
          </Button>
          <Button className={styles.button} kind="primary" type="submit" disabled={!isValid || loading}>
            {loading ? (
              <InlineLoading description={t('processing', 'Processing...')} />
            ) : (
              t('preAuthRequest', 'Pre-Auth Request')
            )}
          </Button>
        </ButtonSet>
      </Stack>
    </Form>
  );
};

export default PreAuthForm;
