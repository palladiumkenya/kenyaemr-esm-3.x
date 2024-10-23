import {
  Button,
  Checkbox,
  Column,
  Dropdown,
  DropdownSkeleton,
  Form,
  InlineNotification,
  Layer,
  Loading,
  MultiSelect,
  Stack,
  Tile,
} from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { DefaultWorkspaceProps, showSnackbar, useSession } from '@openmrs/esm-framework';
import React, { useEffect } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useVisit } from '../../claims/dashboard/form/claims-form.resource';
import usePackages from '../../hooks/usePackages';
import usePatientDiagnosis from '../../hooks/usePatientDiagnosis';
import useProvider from '../../hooks/useProvider';
import { PatientBenefit } from '../../types';
import { eligibilityRequestShema, requestEligibility } from '../benefits-package.resources';
import styles from './benefits-eligibility-request-form.scss';
import PackageIntervensions from './package-intervensions.component';

interface BenefitsEligibilyRequestFormProps extends DefaultWorkspaceProps {
  patientUuid: string;
  onSuccess: (elibibleBenefits: Array<PatientBenefit>) => {};
}

type EligibilityRequest = z.infer<typeof eligibilityRequestShema>;

const BenefitsEligibilyRequestForm: React.FC<BenefitsEligibilyRequestFormProps> = ({
  closeWorkspace,
  patientUuid,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { visits: recentVisist, isLoading } = useVisit(patientUuid);
  const { isLoading: diagnosesLoading, diagnoses } = usePatientDiagnosis(patientUuid);

  const {
    currentProvider: { uuid: providerUuid },
    sessionLocation: { uuid: facilityUuid, display: facilityName },
  } = useSession();
  const { providerLoading: providerLoading, provider } = useProvider(providerUuid);
  const { isLoading: packagesLoading, error: packageError, packages } = usePackages();
  const form = useForm<EligibilityRequest>({
    defaultValues: {
      providerUuid,
      patientUuid,
      facilityUuid,
      diagnosisUuids: [],
      isRefered: false,
      interventions: [],
    },
    resolver: zodResolver(eligibilityRequestShema),
  });

  const onSubmit = async (values: EligibilityRequest) => {
    try {
      const response = await requestEligibility(values);
      showSnackbar({ title: 'Success', kind: 'success', subtitle: 'Eligibility requested succesfully' });
      closeWorkspace();
      onSuccess(response);
    } catch (error) {
      showSnackbar({ title: 'Failure', kind: 'error', subtitle: 'Error requesting Eligibility' });
    }
  };

  useEffect(() => {
    if (Array.isArray(diagnoses)) {
      form.setValue(
        'diagnosisUuids',
        diagnoses?.map((d) => d.id),
      );
    }
  }, [diagnoses]);

  if (packagesLoading || diagnosesLoading || isLoading) {
    return (
      <Layer className={styles.loading}>
        <Loading withOverlay={false} small />
      </Layer>
    );
  }

  if (packageError) {
    return (
      <Layer className={styles.error}>
        <Tile>{packageError?.message}</Tile>
      </Layer>
    );
  }

  const selectedPackageObservable = form.watch('packageUUid');

  return (
    <FormProvider {...form}>
      <Form onSubmit={form.handleSubmit(onSubmit)}>
        <Stack gap={4} className={styles.grid}>
          <Column>
            <Controller
              control={form.control}
              name="patientUuid"
              render={({ field }) => (
                <Dropdown
                  ref={field.ref}
                  invalid={form.formState.errors[field.name]?.message}
                  invalidText={form.formState.errors[field.name]?.message}
                  id="patient"
                  titleText={t('patient', 'Patient')}
                  onChange={(e) => {
                    field.onChange(e.selectedItem);
                  }}
                  initialSelectedItem={field.value}
                  label="Choose option"
                  items={[recentVisist.patient].map((r) => r.uuid)}
                  itemToString={(item) => [recentVisist.patient].find((r) => r.uuid === item)?.display ?? ''}
                />
              )}
            />
          </Column>
          <Column>
            <Controller
              control={form.control}
              name="providerUuid"
              render={({ field }) => (
                <>
                  {provider && (
                    <Dropdown
                      ref={field.ref}
                      invalid={form.formState.errors[field.name]?.message}
                      invalidText={form.formState.errors[field.name]?.message}
                      id="provider"
                      titleText={t('provider', 'Provider')}
                      onChange={(e) => {
                        field.onChange(e.selectedItem);
                      }}
                      initialSelectedItem={field.value}
                      label="Choose option"
                      items={[provider].map((r) => r.uuid)}
                      itemToString={(item) =>
                        [provider]
                          .find((r) => r.uuid === item)
                          ?.display.split('-')
                          .at(-1)
                          .trim() ?? ''
                      }
                    />
                  )}
                  {providerLoading && <DropdownSkeleton />}
                </>
              )}
            />
          </Column>

          <Column>
            <Controller
              control={form.control}
              name="facilityUuid"
              render={({ field }) => (
                <Dropdown
                  ref={field.ref}
                  invalid={form.formState.errors[field.name]?.message}
                  invalidText={form.formState.errors[field.name]?.message}
                  id="facility"
                  titleText={t('facility', 'Facility')}
                  onChange={(e) => {
                    field.onChange(e.selectedItem);
                  }}
                  initialSelectedItem={field.value}
                  label="Choose option"
                  items={[{ uuid: facilityUuid, display: facilityName }].map((r) => r.uuid)}
                  itemToString={(item) =>
                    [{ uuid: facilityUuid, display: facilityName }].find((r) => r.uuid === item)?.display ?? ''
                  }
                />
              )}
            />
          </Column>
          <Column>
            <Controller
              control={form.control}
              name="packageUUid"
              render={({ field }) => (
                <>
                  {packageError ? (
                    <InlineNotification
                      kind="error"
                      subtitle={t('errorFetchingPackages', 'Error fetching packeges')}
                      lowContrast
                    />
                  ) : (
                    <Dropdown
                      ref={field.ref}
                      invalid={form.formState.errors[field.name]?.message}
                      invalidText={form.formState.errors[field.name]?.message}
                      id="package"
                      titleText={t('package', 'Package')}
                      onChange={(e) => {
                        field.onChange(e.selectedItem);
                      }}
                      initialSelectedItem={field.value}
                      label="Choose package"
                      items={packages.map((r) => r.uuid)}
                      itemToString={(item) => packages.find((r) => r.uuid === item)?.packageName ?? ''}
                    />
                  )}
                </>
              )}
            />
          </Column>
          {selectedPackageObservable && (
            <Column>
              <PackageIntervensions
                category={packages.find((package_) => package_.uuid === selectedPackageObservable)?.packageName ?? ''}
              />
            </Column>
          )}
          <Column>
            <Controller
              control={form.control}
              name="diagnosisUuids"
              render={({ field }) => (
                <MultiSelect
                  ref={field.ref}
                  invalid={form.formState.errors[field.name]?.message}
                  invalidText={form.formState.errors[field.name]?.message}
                  id="diagnoses"
                  titleText={t('diagnosis', 'Diagnosis')}
                  selectedItems={field.value}
                  label="Choose option"
                  items={diagnoses.map((r) => r.id)}
                  itemToString={(item) => diagnoses.find((r) => r.id === item)?.text ?? ''}
                />
              )}
            />
          </Column>

          <Column>
            <Controller
              control={form.control}
              name="isRefered"
              render={({ field }) => (
                <Checkbox
                  id="isRefred"
                  labelText="Is Referred"
                  checked={field.value}
                  onChange={(_, { checked }) => field.onChange(checked)}
                />
              )}
            />
          </Column>
        </Stack>

        <div className={styles.btnSet}>
          <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
            {t('discard', 'Discard')}
          </Button>
          <Button className={styles.button} kind="primary" disabled={form.formState.isSubmitting} type="submit">
            {t('submit', 'Submit')}
          </Button>
        </div>
      </Form>
    </FormProvider>
  );
};

export default BenefitsEligibilyRequestForm;
