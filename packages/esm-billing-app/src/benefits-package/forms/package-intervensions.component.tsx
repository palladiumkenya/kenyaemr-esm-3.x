import { InlineLoading, InlineNotification, MultiSelect } from '@carbon/react';
import React, { useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useInterventions } from '../../hooks/useInterventions';
import { eligibilityRequestShema } from '../benefits-package.resources';

type EligibilityRequest = z.infer<typeof eligibilityRequestShema>;

type PackageIntervensionsProps = {
  category: string;
};
const PackageIntervensions: React.FC<PackageIntervensionsProps> = ({ category }) => {
  const { error, interventions, isLoading } = useInterventions(category);
  const form = useFormContext<EligibilityRequest>();
  const { t } = useTranslation();

  useEffect(() => {
    form.setValue('interventions', []);
  }, [category]);

  if (isLoading) {
    return <InlineLoading status="active" iconDescription="Loading" description="Loading intervensions..." />;
  }

  if (error) {
    return (
      <InlineNotification
        aria-label="closes notification"
        kind="error"
        lowContrast={true}
        statusIconDescription="notification"
        title={t('failure', 'Error loading intervensions')}
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
          initialSelectedItems={field.value}
          label="Choose option"
          items={interventions.map((r) => r.interventionCode)}
          itemToString={(item) => interventions.find((r) => r.interventionCode === item)?.interventionName ?? ''}
        />
      )}
    />
  );
};

export default PackageIntervensions;
