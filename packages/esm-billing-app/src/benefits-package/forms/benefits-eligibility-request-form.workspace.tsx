import {
  Button,
  Checkbox,
  Column,
  Dropdown,
  DropdownSkeleton,
  Form,
  InlineNotification,
  MultiSelect,
  Stack,
} from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { DefaultWorkspaceProps, showSnackbar, useSession, useVisit } from '@openmrs/esm-framework';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import useInterventions from '../../hooks/useInterventions';
import usePackages from '../../hooks/usePackages';
import usePatientDiagnosis from '../../hooks/usePatientDiagnosis';
import useProvider from '../../hooks/useProvider';
import { PatientBenefit } from '../../types';
import { eligibilityRequestShema, requestEligibility } from '../benefits-package.resources';
import styles from './benefits-eligibility-request-form.scss';

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
  const {
    currentVisit: { patient },
    activeVisit,
  } = useVisit(patientUuid);

  const {
    currentProvider: { uuid: providerUuid },
    sessionLocation: { uuid: facilityUuid, display: facilityName },
  } = useSession();
  const { providerLoading: providerLoading, provider } = useProvider(providerUuid);
  const { isLoading: packagesLoading, error, packages } = usePackages();
  const { isLoading: intervensionsLoading, interventions } = useInterventions();
  const { isLoading: diagnosesLoading, diagnoses } = usePatientDiagnosis(patientUuid);
  const form = useForm<EligibilityRequest>({
    defaultValues: {
      providerUuid,
      patientUuid,
      facilityUuid,
      diagnosisUuids: [],
      isRefered: false,
      intervensions: [],
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

  return (
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
                items={[patient].map((r) => r.uuid)}
                itemToString={(item) => [patient].find((r) => r.uuid === item)?.display ?? ''}
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
                {error ? (
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
                    items={packages.map((r) => r.shaPackageCode)}
                    itemToString={(item) => packages.find((r) => r.shaPackageCode === item)?.shaPackageName ?? ''}
                  />
                )}
              </>
            )}
          />
        </Column>
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
                onChange={(e) => {
                  field.onChange(e.selectedItems);
                }}
                initialSelectedItems={field.value}
                label="Choose option"
                items={diagnoses.map((r) => r.uuid)}
                itemToString={(item) => diagnoses.find((r) => r.uuid === item)?.value ?? ''}
              />
            )}
          />
        </Column>
        <Column>
          <Controller
            control={form.control}
            name="intervensions"
            render={({ field }) => (
              <MultiSelect
                ref={field.ref}
                invalid={form.formState.errors[field.name]?.message}
                invalidText={form.formState.errors[field.name]?.message}
                id="intervensions"
                titleText={t('intervensions', 'Intervensions')}
                onChange={(e) => {
                  field.onChange(e.selectedItems);
                }}
                initialSelectedItems={field.value}
                label="Choose option"
                items={interventions.map((r) => r.shaInterventionCode)}
                itemToString={(item) =>
                  interventions.find((r) => r.shaInterventionCode === item)?.shaInterventionName ?? ''
                }
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
  );
};

export default BenefitsEligibilyRequestForm;
