import { Button, Dropdown, FileUploader, InlineLoading, InlineNotification, Tag } from '@carbon/react';
import { TrashCan } from '@carbon/react/icons';
import { showSnackbar, usePatient } from '@openmrs/esm-framework';
import React, { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import z from 'zod';
import { ClaimsFormSchema, fileToBase64 } from './claims-form.resource';
import styles from './claims-form.scss';
import { InterventionsFilter, useInterventions } from '../../../hooks/useInterventions';
const ClaimsSupportingDocumentsInput: FC<{ patientUuid: string }> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const form = useFormContext<z.infer<typeof ClaimsFormSchema>>();
  const { error: patientError, isLoading: isPatientLoading, patient } = usePatient(patientUuid);
  const categories = form.watch('packages') ?? [];
  const filters: InterventionsFilter = {
    package_code: categories.join(','),
    applicable_gender: patient?.gender === 'male' ? 'MALE' : 'FEMALE',
  };
  const { error, interventions, isLoading } = useInterventions(filters);

  const supportDocs = form.watch('supportingDocuments') ?? [];
  const selectedInterventionsObservable = form.watch('interventions') ?? [];

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
    <div>
      {supportDocs?.map((doc, i) => (
        <div key={i} className={styles.doc}>
          <Button
            hasIconOnly
            renderIcon={TrashCan}
            kind="danger--ghost"
            onClick={() =>
              form.setValue(
                'supportingDocuments',
                supportDocs.filter((_, ind) => ind != i),
              )
            }
          />
          <Controller
            control={form.control}
            name={`supportingDocuments.${i}.base64`}
            render={({ field, fieldState }) => (
              <div className="cds--file__container">
                <FileUploader
                  accept={['.jpg', '.png']}
                  buttonKind="tertiary"
                  buttonLabel={t('select', 'Select')}
                  filenameStatus="edit"
                  labelDescription={t(
                    'supportDocsInstruction',
                    'Max file size is 1 MB. Only .jpg and .png files are supported.',
                  )}
                  labelTitle={t('uploadSupportFiles', 'Upload support files')}
                  name=""
                  onChange={async ({
                    target: {
                      files: [file],
                    },
                  }) => {
                    if (file instanceof File) {
                      const oneMBInBytes = 1024 * 1024; // 1MB = 1024 KB * 1024 B/KB
                      if (file.size > oneMBInBytes) {
                        showSnackbar({
                          title: t('error', 'Error'),
                          kind: 'error',
                          subtitle: t('fileToLargeError', 'File size to large exceeding 1MB'),
                        });
                        return;
                      }
                      const base64 = await fileToBase64(file);
                      field.onChange(base64);
                      form.setValue(`supportingDocuments.${i}.size`, file.size);
                      form.setValue(`supportingDocuments.${i}.name`, file.name);
                      form.setValue(`supportingDocuments.${i}.type`, file.type);
                      form.setValue(`supportingDocuments.${i}.uploadedAt`, new Date());
                    }
                  }}
                  onClick={() => {}}
                  onDelete={() => {
                    form.setValue(
                      'supportingDocuments',
                      supportDocs.filter((_, ind) => ind != i),
                    );
                  }}
                  size="md"
                />
                {doc.size && <Tag>{(doc.size / 1024).toFixed(2)} KB</Tag>}
              </div>
            )}
          />
          <Controller
            control={form.control}
            name={`supportingDocuments.${i}.intervention`}
            render={({ field, fieldState }) => (
              <Dropdown
                {...field}
                invalid={Boolean(fieldState?.error?.message)}
                invalidText={fieldState?.error?.message}
                id={'document-intervention'}
                selectedItem={field.value}
                onChange={({ selectedItem }) => field.onChange(selectedItem)}
                items={selectedInterventionsObservable}
                itemToString={(item) => interventions.find((i) => i.interventionCode === item)?.interventionName ?? ''}
                label={t('intervention', 'Intervention')}
                titleText={t('intervention', 'Intervention')}
              />
            )}
          />
          <Controller
            control={form.control}
            name={`supportingDocuments.${i}.purpose`}
            render={({ field, fieldState }) => (
              <Dropdown
                invalid={Boolean(fieldState?.error?.message)}
                invalidText={fieldState?.error?.message}
                id={'document-purpose'}
                {...field}
                selectedItem={field.value}
                onChange={({ selectedItem }) => field.onChange(selectedItem)}
                items={[
                  'CLAIM_FORM',
                  'PREAUTH_FORM',
                  'DISCHARGE_SUMMARY',
                  'PRESCRIPTION',
                  'LAB_ORDER',
                  'INVOICE',
                  'BIO_DETAILS',
                  'IMAGING_ORDER',
                  'OTHER',
                  'FINAL_BILL',
                  'LAB_RESULTS',
                  'DEATH_NOTICE',
                  'THEATRE_NOTES',
                  'BIRTH_NOTIFICATION',
                ]}
                label={t('purpose', 'Purpose')}
                titleText={t('purpose', 'Purpose')}
                itemToString={(item) => item.toLowerCase().replace('_', ' ')}
              />
            )}
          />
        </div>
      ))}
      <Button
        disabled={supportDocs.length >= 4}
        kind="tertiary"
        onClick={async () => {
          const valid = await form.trigger(`supportingDocuments`);
          if (!supportDocs?.length || valid) {
            form.setValue('supportingDocuments', [...supportDocs, {}]);
          }
        }}>
        {t('addSupportDocs', 'Add support docs')}
      </Button>
    </div>
  );
};

export default ClaimsSupportingDocumentsInput;
