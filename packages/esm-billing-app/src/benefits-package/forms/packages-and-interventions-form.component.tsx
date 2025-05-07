import { Column, InlineLoading, InlineNotification, MultiSelect } from '@carbon/react';
import React, { useEffect, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import usePackages from '../../hooks/usePackages';
import PackageInterventions from './interventions-form.component';
import { useConfig, usePatient } from '@openmrs/esm-framework';
import { BillingConfig } from '../../config-schema';

type Props = {
  patientUuid: string;
};

const SHABenefitPackangesAndInterventions: React.FC<Props> = ({ patientUuid }) => {
  const form = useFormContext<{ packages: Array<string>; interventions: Array<string>; policyNumber: string }>();
  const { shaIdentificationNumberUUID } = useConfig<BillingConfig>();
  const { isLoading: packagesLoading, error: packageError, packages } = usePackages();
  const { t } = useTranslation();
  const { error, isLoading, patient } = usePatient(patientUuid);
  const selectedPackageObservable = form.watch('packages');
  const shaNumber = useMemo(
    () => patient?.identifier?.find((id) => id?.type?.coding[0]?.code === shaIdentificationNumberUUID)?.value,
    [patient, shaIdentificationNumberUUID],
  );
  const { setValue } = form;
  useEffect(() => {
    if (shaNumber) {
      setValue('policyNumber', shaNumber);
    }
  }, [shaNumber, setValue]);

  if (packagesLoading) {
    return (
      <InlineLoading description={t('loading', 'Loading')} iconDescription={t('loading', 'Loading data') + '...'} />
    );
  }

  if (packageError) {
    return (
      <InlineNotification
        aria-label="closes notification"
        kind="error"
        lowContrast={true}
        statusIconDescription="notification"
        title={t('errorLoadingpackages', 'Error loading packages')}
        subtitle={packageError?.message}
      />
    );
  }

  return (
    <>
      <Column>
        <Controller
          control={form.control}
          name="packages"
          render={({ field }) => (
            <>
              {packageError ? (
                <InlineNotification
                  kind="error"
                  subtitle={t('errorFetchingPackages', 'Error fetching packeges')}
                  lowContrast
                />
              ) : (
                <MultiSelect
                  ref={field.ref}
                  invalid={form.formState.errors[field.name]?.message}
                  invalidText={form.formState.errors[field.name]?.message}
                  id="packages"
                  titleText={t('package', 'Packages')}
                  onChange={(e) => {
                    field.onChange(e.selectedItems);
                  }}
                  selectedItems={field.value}
                  label={t('choosePackage', 'Choose package')}
                  items={packages.map((r) => r.uuid)}
                  itemToString={(item) => {
                    const _package = packages.find((r) => r.uuid === item);
                    if (!_package) {
                      return '';
                    }
                    return `${_package.packageCode}-${_package.packageName}`;
                  }}
                />
              )}
            </>
          )}
        />
      </Column>
      <Column>
        <PackageInterventions
          categories={
            packages
              .filter((packages_) => selectedPackageObservable.includes(packages_.uuid))
              ?.map((p) => p.packageCode) ?? []
          }
          patientUuid={patientUuid}
        />
      </Column>
    </>
  );
};

export default SHABenefitPackangesAndInterventions;
