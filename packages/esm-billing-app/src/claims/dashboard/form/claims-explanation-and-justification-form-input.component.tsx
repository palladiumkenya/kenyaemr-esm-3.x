import { Column, InlineLoading, InlineNotification, Layer, TextArea } from '@carbon/react';
import { usePatient } from '@openmrs/esm-framework';
import React, { useEffect, useMemo, useCallback } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { InterventionsFilter, useInterventions } from '../../../hooks/useInterventions';
import usePackages from '../../../hooks/usePackages';
import styles from './claims-form.scss';

type ClaimExplanationAndJusificationInputProps = {
  patientUuid: string;
  disabled?: boolean;
  validationEnabled?: boolean;
  onInteraction?: () => void;
};

const ClaimExplanationAndJusificationInput: React.FC<ClaimExplanationAndJusificationInputProps> = ({
  patientUuid,
  disabled = false,
  validationEnabled = false,
  onInteraction = () => {},
}) => {
  const { error: patientError, isLoading: isPatientLoading, patient } = usePatient(patientUuid);
  const { t } = useTranslation();
  const form = useFormContext();
  const { setValue, watch, trigger } = form;

  const packages = watch('packages');
  const interventions = watch('interventions');
  const currentExplanation = watch('claimExplanation');
  const currentJustification = watch('claimJustification');

  const { isLoading: packagesLoading, error: packageError, packages: shaPackages } = usePackages();

  const filters = useMemo<InterventionsFilter>(
    () => ({
      package_code: packages?.join(','),
      applicable_gender: patient?.gender === 'male' ? 'MALE' : 'FEMALE',
    }),
    [packages, patient?.gender],
  );

  const { error: interventionsError, isLoading: isLoadingInterventions, allInterventions } = useInterventions(filters);

  const packagesSelected = useMemo(
    () =>
      packages
        ?.map((packageCode) => shaPackages.find((pkg) => pkg.uuid === packageCode))
        ?.map((p) => p?.packageName ?? '')
        .filter(Boolean) ?? [],
    [packages, shaPackages],
  );

  const interventionSelected = useMemo(
    () =>
      interventions
        ?.map(
          (interventionCode) =>
            allInterventions.find((intervention) => intervention.interventionCode === interventionCode)
              ?.interventionName,
        )
        .filter(Boolean) ?? [],
    [interventions, allInterventions],
  );

  const hasPackagesAndInterventions = packagesSelected.length > 0 && interventionSelected.length > 0;

  const updateFormFields = useCallback(() => {
    if (!packagesLoading && !isLoadingInterventions && hasPackagesAndInterventions) {
      const newExplanation = packagesSelected.join(', ');
      const newJustification = interventionSelected.join(', ');

      if (newExplanation !== currentExplanation) {
        setValue('claimExplanation', newExplanation, {
          shouldValidate: validationEnabled,
          shouldDirty: true,
          shouldTouch: false,
        });
      }

      if (newJustification !== currentJustification) {
        setValue('claimJustification', newJustification, {
          shouldValidate: validationEnabled,
          shouldDirty: true,
          shouldTouch: false,
        });
      }

      if (validationEnabled) {
        trigger(['claimExplanation', 'claimJustification']);
      }
      onInteraction();
    }
  }, [
    packagesLoading,
    isLoadingInterventions,
    hasPackagesAndInterventions,
    packagesSelected,
    interventionSelected,
    currentExplanation,
    currentJustification,
    setValue,
    validationEnabled,
    trigger,
    onInteraction,
  ]);

  useEffect(() => {
    const timer = setTimeout(updateFormFields, 300);
    return () => clearTimeout(timer);
  }, [updateFormFields]);

  const shouldShowError = (fieldName: string) => {
    return validationEnabled && form.formState.errors[fieldName] && form.formState.touchedFields[fieldName];
  };

  if (packagesLoading || isPatientLoading || isLoadingInterventions) {
    return (
      <InlineLoading description={t('loading', 'Loading')} iconDescription={t('loading', 'Loading data') + '...'} />
    );
  }

  if (packageError || patientError || interventionsError) {
    return (
      <InlineNotification
        aria-label="closes notification"
        kind="error"
        lowContrast={true}
        statusIconDescription="notification"
        title={t('errorLoadingpackages', 'Error loading packages')}
        subtitle={packageError?.message ?? patientError?.message ?? interventionsError?.message}
      />
    );
  }

  const textAreaDisabled = disabled && !hasPackagesAndInterventions;

  return (
    <>
      <Column>
        <Layer className={styles.input}>
          <Controller
            control={form.control}
            name="claimExplanation"
            render={({ field, fieldState: { error } }) => (
              <TextArea
                {...field}
                labelText={t('claimExplanation', 'Claim Explanation')}
                rows={3}
                placeholder="Claim Explanation"
                id="claimExplanation"
                invalid={shouldShowError('claimExplanation')}
                invalidText={error?.message}
                disabled={textAreaDisabled}
                onChange={(e) => {
                  field.onChange(e);
                  onInteraction();
                }}
              />
            )}
          />
        </Layer>
      </Column>
      <Column>
        <Layer className={styles.input}>
          <Controller
            control={form.control}
            name="claimJustification"
            render={({ field, fieldState: { error } }) => (
              <TextArea
                {...field}
                labelText={t('claimJustification', 'Claim Justification')}
                rows={3}
                placeholder="Claim Justification"
                id="claimJustification"
                invalid={shouldShowError('claimJustification')}
                invalidText={error?.message}
                disabled={textAreaDisabled}
                onChange={(e) => {
                  field.onChange(e);
                  onInteraction();
                }}
              />
            )}
          />
        </Layer>
      </Column>
    </>
  );
};

export default React.memo(ClaimExplanationAndJusificationInput);
