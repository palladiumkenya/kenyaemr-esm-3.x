import { Column, InlineLoading, InlineNotification, Layer, TextArea } from '@carbon/react';
import { usePatient } from '@openmrs/esm-framework';
import React, { useEffect, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { InterventionsFilter, useInterventions } from '../../../hooks/useInterventions';
import usePackages from '../../../hooks/usePackages';
import styles from './claims-form.scss';

type ClaimExplanationAndJusificationInputProps = {
  patientUuid: string;
};
const ClaimExplanationAndJusificationInput: React.FC<ClaimExplanationAndJusificationInputProps> = ({ patientUuid }) => {
  const { error: patientError, isLoading: isPatientLoading, patient } = usePatient(patientUuid);

  const form = useFormContext<{
    claimExplanation: string;
    claimJustification: string;
    packages: Array<string>;
    interventions: Array<string>;
  }>();
  const { t } = useTranslation();
  const { isLoading: packagesLoading, error: packageError, packages: shaPackages } = usePackages();
  const { setValue } = form;
  const packagesObservable = form.watch('packages');
  const interventionsObservable = form.watch('interventions');
  const filters = useMemo<InterventionsFilter>(
    () => ({
      package_code: packagesObservable.join(','),
      applicable_gender: patient?.gender === 'male' ? 'MALE' : 'FEMALE',
    }),
    [packagesObservable, patient],
  );
  const { error: interventionsError, isLoading: isLoadingInterventions, allInterventions } = useInterventions(filters);
  const packagesSelected = useMemo(
    () =>
      packagesObservable
        .map((packageCode) => shaPackages.find((pkg) => pkg.uuid === packageCode))
        ?.map((p) => p?.packageName ?? '')
        .filter(Boolean) ?? [],
    [packagesObservable, shaPackages],
  );
  const interventionSelected = useMemo(
    () =>
      interventionsObservable.map(
        (interventionCode) =>
          allInterventions.find((intervention) => intervention.interventionCode === interventionCode)?.interventionName,
      ) ?? [],
    [interventionsObservable, allInterventions],
  );

  useEffect(() => {
    setValue('claimExplanation', packagesSelected.join(', '));
    setValue('claimJustification', interventionSelected.join(', '));
  }, [packagesSelected, setValue, interventionSelected]);

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
        subtitle={packageError?.message ?? packageError?.message ?? interventionsError?.message}
      />
    );
  }

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
                invalid={!!error?.message}
                invalidText={error?.message}
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
                invalid={!!error?.message}
                invalidText={error?.message}
              />
            )}
          />
        </Layer>
      </Column>
    </>
  );
};

export default ClaimExplanationAndJusificationInput;
