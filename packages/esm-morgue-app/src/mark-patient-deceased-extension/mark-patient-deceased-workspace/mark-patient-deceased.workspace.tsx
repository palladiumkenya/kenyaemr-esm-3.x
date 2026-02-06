import React, { useCallback, useMemo } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import {
  Button,
  ButtonSet,
  Form,
  InlineLoading,
  Row,
  RadioButtonGroup,
  RadioButton,
  TextInput,
  Layer,
} from '@carbon/react';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { WarningFilled } from '@carbon/react/icons';
import { type DefaultPatientWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import {
  ExtensionSlot,
  useLayoutType,
  showSnackbar,
  ResponsiveWrapper,
  OpenmrsDatePicker,
  useConfig,
  useSession,
} from '@openmrs/esm-framework';
import styles from './mark-patient-deceased-form.scss';
import { markPatientDeceased } from './mark-patient-deceased.resource';
import ICD11DiagnosisSearch from '../icd11-diagnosis-search/icd11-diagnosis-search.component';
import { ConfigObject } from '../../config-schema';
import { DiagnosisOption } from '../type';

const MarkPatientDeceasedForm: React.FC<DefaultPatientWorkspaceProps> = ({ closeWorkspace, patientUuid }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const memoizedPatientUuid = useMemo(() => ({ patientUuid }), [patientUuid]);
  const config = useConfig<ConfigObject>();
  const session = useSession();

  const sessionLocation = session?.sessionLocation?.uuid;
  const currentProvider = session?.currentProvider?.uuid;

  const schema = z.object({
    deathDate: z.date().refine((date) => !!date, {
      message: t('deathDateRequired', 'Please select the date of death'),
    }),
    immediateCause: z
      .object({
        uuid: z.string(),
        display: z.string(),
      })
      .refine((val) => !!val.uuid, {
        message: t('immediateCauseRequired', 'Please select the immediate cause of death'),
      }),
    antecedentCause: z
      .object({
        uuid: z.string(),
        display: z.string(),
      })
      .nullable(),
    underlyingCondition: z
      .object({
        uuid: z.string(),
        display: z.string(),
      })
      .nullable(),
    transferTo: z.string().refine((val) => !!val, {
      message: t('transferToRequired', 'Please select where to transfer the body'),
    }),
    receivingMortuaryName: z.string().optional(),
    serialNumber: z.string().optional(),
  });

  type MarkPatientDeceasedFormSchema = z.infer<typeof schema>;

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    setValue,
    watch,
  } = useForm<MarkPatientDeceasedFormSchema>({
    mode: 'onSubmit',
    resolver: zodResolver(schema),
    defaultValues: {
      deathDate: new Date(),
      immediateCause: { uuid: '', display: '' },
      antecedentCause: null,
      underlyingCondition: null,
      transferTo: config.currentMortuaryUuid,
      receivingMortuaryName: '',
      serialNumber: '',
    },
  });

  const watchTransferTo = watch('transferTo');
  const showOtherFacilityFields = watchTransferTo === config?.otherFacilityMortuaryUuid;

  const onSubmit: SubmitHandler<MarkPatientDeceasedFormSchema> = useCallback(
    async (data) => {
      const {
        deathDate,
        immediateCause,
        antecedentCause,
        underlyingCondition,
        transferTo,
        receivingMortuaryName,
        serialNumber,
      } = data;

      try {
        await markPatientDeceased(
          deathDate,
          patientUuid,
          immediateCause.uuid,
          antecedentCause?.uuid,
          underlyingCondition?.uuid,
          transferTo,
          receivingMortuaryName,
          serialNumber,
          sessionLocation,
          currentProvider,
          config,
        );

        const successMessage =
          transferTo === config.currentMortuaryUuid
            ? t('patientMarkedDeceasedAndQueued', 'Patient successfully marked as deceased and added to mortuary queue')
            : t(
                'patientMarkedDeceasedForTransfer',
                'Patient successfully marked as deceased and prepared for transfer',
              );

        showSnackbar({
          kind: 'success',
          isLowContrast: true,
          subtitle: successMessage,
          title: t('patientMarkedDeceased', 'Patient marked as deceased'),
        });

        closeWorkspace();
      } catch (error) {
        showSnackbar({
          kind: 'error',
          isLowContrast: false,
          subtitle: error?.message || t('unexpectedError', 'An unexpected error occurred'),
          title: t('errorMarkingPatientDeceased', 'Error marking patient deceased'),
        });
      }
    },
    [closeWorkspace, config, currentProvider, patientUuid, sessionLocation, t],
  );

  return (
    <Form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <div>
        {isTablet && (
          <Row className={styles.headerGridRow}>
            <ExtensionSlot className={styles.dataGridRow} name="visit-form-header-slot" state={memoizedPatientUuid} />
          </Row>
        )}
        <div className={styles.container}>
          <span className={styles.warningContainer}>
            <WarningFilled aria-label={t('warning', 'Warning')} className={styles.warningIcon} size={20} />
            <span className={styles.warningText}>
              {t('markDeceasedWarning', 'Marking the patient as deceased will end any active visits for this patient')}
            </span>
          </span>

          {/* Date of Death */}
          <section className={styles.section}>
            <div className={styles.sectionTitle}>{t('dateOfDeath', 'Date of death')}</div>
            <ResponsiveWrapper>
              <Controller
                name="deathDate"
                control={control}
                render={({ field, fieldState }) => (
                  <OpenmrsDatePicker
                    {...field}
                    className={styles.datePicker}
                    id="deceasedDate"
                    data-testid="deceasedDate"
                    labelText={t('date', 'Date')}
                    maxDate={new Date()}
                    invalid={Boolean(fieldState?.error?.message)}
                    invalidText={fieldState?.error?.message}
                  />
                )}
              />
            </ResponsiveWrapper>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionTitle}>{t('causeOfDeathICD11', 'Cause of Death (ICD 11)')}</div>
            <Controller
              name="immediateCause"
              control={control}
              render={({ field, fieldState }) => (
                <ICD11DiagnosisSearch
                  id="immediateCause"
                  labelText={t('immediateCause', 'Immediate cause')}
                  value={(field.value?.uuid ? field.value : null) as DiagnosisOption | null}
                  onChange={(diagnosis) => {
                    setValue('immediateCause', diagnosis || { uuid: '', display: '' });
                  }}
                  required
                  invalid={Boolean(fieldState?.error?.message)}
                  invalidText={fieldState?.error?.message}
                />
              )}
            />
          </section>

          <section className={styles.section}>
            <Controller
              name="antecedentCause"
              control={control}
              render={({ field }) => (
                <ICD11DiagnosisSearch
                  id="antecedentCause"
                  labelText={t('antecedentCause', 'Antecedent cause')}
                  value={field.value as DiagnosisOption | null}
                  onChange={(diagnosis) => {
                    setValue('antecedentCause', diagnosis);
                  }}
                />
              )}
            />
          </section>

          <section className={styles.section}>
            <Controller
              name="underlyingCondition"
              control={control}
              render={({ field }) => (
                <ICD11DiagnosisSearch
                  id="underlyingCondition"
                  labelText={t('underlyingCondition', 'Underlying condition')}
                  value={field.value as DiagnosisOption | null}
                  onChange={(diagnosis) => {
                    setValue('underlyingCondition', diagnosis);
                  }}
                />
              )}
            />
          </section>

          <section className={styles.section}>
            <div className={styles.sectionTitle}>
              {t('transferTo', 'Transfer to')} <span className={styles.required}>*</span>
            </div>
            <Layer>
              <Controller
                name="transferTo"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <RadioButtonGroup
                      legendText=""
                      name="transferTo"
                      valueSelected={field.value}
                      onChange={(value) => {
                        setValue('transferTo', value as string);
                        if (value === config.currentMortuaryUuid) {
                          setValue('receivingMortuaryName', '');
                          setValue('serialNumber', '');
                        }
                      }}
                      orientation="vertical">
                      <RadioButton
                        id="thisFacilityMortuary"
                        labelText={t('thisFacilityMortuary', 'This facility mortuary')}
                        value={config.currentMortuaryUuid}
                        className={styles.radioGroup}
                      />
                      <RadioButton
                        id="otherFacilityMortuary"
                        labelText={t('otherFacilityMortuary', 'Other facility mortuary')}
                        value={config.otherFacilityMortuaryUuid}
                        className={styles.radioGroup}
                      />
                    </RadioButtonGroup>
                    {fieldState?.error?.message && (
                      <div className={styles.errorMessage}>{fieldState.error.message}</div>
                    )}
                  </>
                )}
              />
            </Layer>
          </section>

          {showOtherFacilityFields && (
            <>
              <section className={styles.section}>
                <Controller
                  name="receivingMortuaryName"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextInput
                      {...field}
                      id="receivingMortuaryName"
                      labelText={t('receivingMortuaryName', 'Name of Receiving Mortuary')}
                      placeholder={t('enterMortuaryName', 'Enter mortuary name')}
                      invalid={Boolean(fieldState?.error?.message)}
                      invalidText={fieldState?.error?.message}
                    />
                  )}
                />
              </section>

              <section className={styles.section}>
                <Controller
                  name="serialNumber"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextInput
                      {...field}
                      id="serialNumber"
                      labelText={t('serialNumber', 'Serial Number')}
                      placeholder={t('enterSerialNumber', 'Enter serial number')}
                      invalid={Boolean(fieldState?.error?.message)}
                      invalidText={fieldState?.error?.message}
                    />
                  )}
                />
              </section>
            </>
          )}
        </div>
      </div>

      <ButtonSet className={classNames({ [styles.tablet]: isTablet, [styles.desktop]: !isTablet })}>
        <Button className={styles.button} kind="secondary" onClick={() => closeWorkspace()}>
          {t('discard', 'Discard')}
        </Button>
        <Button className={styles.button} disabled={isSubmitting} kind="primary" type="submit">
          {isSubmitting ? (
            <InlineLoading description={t('saving', 'Saving') + '...'} role="progressbar" />
          ) : (
            t('saveAndClose', 'Save and close')
          )}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default MarkPatientDeceasedForm;
