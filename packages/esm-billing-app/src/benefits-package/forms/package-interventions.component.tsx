import React from 'react';
import { InlineLoading, InlineNotification, MultiSelect } from '@carbon/react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { InterventionsFilter, useInterventions } from '../../hooks/useInterventions';
import { eligibilityRequestShema } from '../benefits-package.resources';
import { usePatient } from '@openmrs/esm-framework';

type EligibilityRequest = z.infer<typeof eligibilityRequestShema>;

type PackageInterventionsProps = {
  category: string;
  patientUuid: string;
};
const PackageInterventions: React.FC<PackageInterventionsProps> = ({ category, patientUuid }) => {
  const { error: patientError, isLoading: isPatientLoading, patient } = usePatient(patientUuid);
  const filters: InterventionsFilter = {
    package_code: category,
    applicable_gender: patient?.gender === 'male' ? 'MALE' : 'FEMALE',
  };
  const { error, interventions, isLoading } = useInterventions(filters);

  const form = useFormContext<EligibilityRequest>();
  const { t } = useTranslation();

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

  if (interventions.length === 0) {
    return null;
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
          initialSelectedItems={field.value}
          label={t('chooseInterventions', 'Choose interventions')}
          items={interventions.map((r) => r.interventionCode)}
          itemToString={(item) => interventions.find((r) => r.interventionCode === item)?.interventionName ?? ''}
        />
      )}
    />
  );
};

export default PackageInterventions;
