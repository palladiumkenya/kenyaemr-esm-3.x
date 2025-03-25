import React, { useEffect, useMemo } from 'react';
import { InlineLoading, InlineNotification, MultiSelect } from '@carbon/react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { InterventionsFilter, useInterventions } from '../../hooks/useInterventions';
import { eligibilityRequestShema } from '../benefits-package.resources';
import { usePatient } from '@openmrs/esm-framework';

type EligibilityRequest = z.infer<typeof eligibilityRequestShema>;

type PackageInterventionsProps = {
  categories: Array<string>;
  patientUuid: string;
};
const PackageInterventions: React.FC<PackageInterventionsProps> = ({ categories, patientUuid }) => {
  const { error: patientError, isLoading: isPatientLoading, patient } = usePatient(patientUuid);
  const filters: InterventionsFilter = {
    package_code: categories.join(','),
    applicable_gender: patient?.gender === 'male' ? 'MALE' : 'FEMALE',
  };
  const { error, interventions, isLoading, allInterventions } = useInterventions(filters);

  const form = useFormContext<{ packages: Array<string>; interventions: Array<string> }>();
  const { t } = useTranslation();
  const selectedInterventionsObservable = form.watch('interventions');

  const interventions_ = useMemo(() => {
    const additionalInterventions = selectedInterventionsObservable.reduce((prev, curr) => {
      const interventionContainedInOptions = interventions.some((i) => i.interventionCode === curr);
      if (!interventionContainedInOptions) {
        const intervention = allInterventions.find((i) => i.interventionCode === curr);
        if (intervention) {
          prev.push(intervention);
        }
      }
      return prev;
    }, [] as typeof allInterventions);

    return [...interventions, ...additionalInterventions];
  }, [allInterventions, interventions, selectedInterventionsObservable]);

  if (isLoading || isPatientLoading) {
    return (
      <InlineLoading
        status="active"
        iconDescription="Loading"
        description={t('loadingInterventions', 'Loading interventions') + '...'}
      />
    );
  }

  if (error || patientError) {
    return (
      <InlineNotification
        aria-label="closes notification"
        kind="error"
        lowContrast={true}
        statusIconDescription="notification"
        title={t('failure', 'Error loading interventions')}
        subtitle={error?.message ?? patientError?.message}
      />
    );
  }

  return (
    <Controller
      control={form.control}
      name="interventions"
      render={({ field }) => (
        <MultiSelect
          ref={field.ref}
          invalid={form.formState.errors[field.name]?.message}
          invalidText={form.formState.errors[field.name]?.message}
          id="interventions"
          titleText={t('interventions', 'Interventions')}
          onChange={(e) => {
            field.onChange(e.selectedItems);
          }}
          selectedItems={field.value}
          label={t('chooseInterventions', 'Choose interventions')}
          items={interventions_.map((r) => r.interventionCode)}
          itemToString={(item) => interventions_.find((r) => r.interventionCode === item)?.interventionName ?? ''}
        />
      )}
    />
  );
};

export default PackageInterventions;
