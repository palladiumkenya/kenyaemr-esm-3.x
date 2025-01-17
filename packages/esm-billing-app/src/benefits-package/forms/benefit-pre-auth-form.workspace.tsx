import {
  Button,
  Column,
  Dropdown,
  DropdownSkeleton,
  Form,
  FormLabel,
  InlineNotification,
  Layer,
  Loading,
  MultiSelect,
  Stack,
  Tile,
} from '@carbon/react';
import { DocumentAttachment } from '@carbon/react/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { DefaultWorkspaceProps, showSnackbar, useSession } from '@openmrs/esm-framework';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useVisit } from '../../claims/dashboard/form/claims-form.resource';
import { MAX_ALLOWED_FILE_SIZE } from '../../constants';
import { useSystemSetting } from '../../hooks/getMflCode';
import usePackages from '../../hooks/usePackages';
import usePatientDiagnosis from '../../hooks/usePatientDiagnosis';
import useProvider from '../../hooks/useProvider';
import { PatientBenefit } from '../../types';
import { preAuthenticateBenefit, preauthSchema } from '../benefits-package.resources';
import styles from './benefits-pre-auth-form.scss';
import PackageInterventions from './package-interventions.component';
import { ErrorState } from '@openmrs/esm-patient-common-lib';

type BenefitsPreAuth = z.infer<typeof preauthSchema>;

interface BenefitPreAuthFormProps extends DefaultWorkspaceProps {
  patientUuid: string;
  benefit: PatientBenefit;
  onSuccess: (benefits: Array<PatientBenefit>) => void;
}

const BenefitPreAuthForm: React.FC<BenefitPreAuthFormProps> = ({ closeWorkspace, patientUuid }) => {
  const { t } = useTranslation();
  const { visits: recentVisit, isLoading } = useVisit(patientUuid);
  const { isLoading: diagnosesLoading, diagnoses } = usePatientDiagnosis(patientUuid);
  const inputFileRef = useRef<HTMLInputElement>();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mflCodeValue } = useSystemSetting('facility.mflcode');

  const {
    currentProvider: { uuid: providerUuid },
    sessionLocation: { uuid: facilityUuid, display: facilityName },
  } = useSession();
  const { providerLoading: providerLoading, provider } = useProvider(providerUuid);
  const { isLoading: packagesLoading, error: packageError, packages } = usePackages();

  const form = useForm<BenefitsPreAuth>({
    defaultValues: {
      providerUuid,
      patientUuid,
      facilityUuid,
      diagnosisUuids: [],
      interventions: [],
    },
    resolver: zodResolver(preauthSchema),
  });

  const attachFiles = () => {
    inputFileRef.current.click();
  };

  const handleFileChange = () => {
    if (inputFileRef.current && inputFileRef.current.files) {
      const file = inputFileRef.current.files[0];
      if (file.size > MAX_ALLOWED_FILE_SIZE) {
        showSnackbar({
          title: t('fileTooBig', 'fileTooBig'),
          kind: 'error',
        });

        return;
      }
      setUploadedFile(file);
    }
  };

  useEffect(() => {
    if (Array.isArray(diagnoses)) {
      form.setValue('diagnosisUuids', diagnoses!.map((d) => d.id) as any);
    }
  }, [diagnoses, form]);

  const onSubmit = async (values: BenefitsPreAuth) => {
    setIsSubmitting(true);
    try {
      await preAuthenticateBenefit(values, recentVisit, mflCodeValue);
      showSnackbar({ title: 'Success', kind: 'success', subtitle: 'Preauth Approved succesfully' });
      closeWorkspace();
    } catch (error) {
      showSnackbar({ title: 'Failure', kind: 'error', subtitle: 'Error requesting Eligibility' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPackageObservable = form.watch('packageUUid');

  if (packagesLoading || diagnosesLoading || isLoading || providerLoading) {
    return (
      <Layer className={styles.loading}>
        <Loading withOverlay={false} small />
      </Layer>
    );
  }

  if (packageError) {
    return (
      <Layer className={styles.error}>
        <ErrorState error={packageError} headerTitle={t('errorMessage', 'Error')} />
      </Layer>
    );
  }

  return (
    <FormProvider {...form}>
      <Form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
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
                  items={[recentVisit.patient].map((r) => r.uuid)}
                  itemToString={(item) => [recentVisit.patient].find((r) => r.uuid === item)?.display ?? ''}
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
              <PackageInterventions
                category={packages.find((package_) => package_.uuid === selectedPackageObservable)?.packageCode ?? ''}
                patientUuid={patientUuid}
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
                  titleText={t('finalDiagnosis', 'Final Diagnosis')}
                  selectedItems={field.value}
                  label="Choose option"
                  items={diagnoses.map((r) => r.id)}
                  itemToString={(item) => diagnoses.find((r) => r.id === item)?.text ?? ''}
                />
              )}
            />
          </Column>
          <Column>
            <FormLabel className={styles.attachFileLabel}>Attach file</FormLabel>
            <div className={styles.uploadButtonWrapper}>
              <input type="file" ref={inputFileRef} hidden onChange={handleFileChange} accept="image/*, .pdf" />
              {uploadedFile ? <p className={styles.selectedFile}>{uploadedFile.name}</p> : 'No file selected'}
              <Button onClick={attachFiles}>
                Attach File <DocumentAttachment className={styles.iconMarginLeft} />
              </Button>
            </div>
          </Column>
        </Stack>
        <div className={styles.btnSet}>
          <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
            {t('discard', 'Discard')}
          </Button>
          <Button className={styles.button} kind="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loading className={styles.button_spinner} withOverlay={false} small /> {t('submitting', 'Submitting')}
              </>
            ) : (
              t('submit', 'Submit')
            )}
          </Button>
        </div>
      </Form>
    </FormProvider>
  );
};

export default BenefitPreAuthForm;
