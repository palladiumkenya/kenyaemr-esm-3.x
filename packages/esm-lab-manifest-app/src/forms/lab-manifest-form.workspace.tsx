import {
  Button,
  ButtonSet,
  Column,
  DatePicker,
  DatePickerInput,
  Dropdown,
  Form,
  Stack,
  TextInput,
} from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { DefaultWorkspaceProps, parseDate, showSnackbar, useConfig, useLayoutType } from '@openmrs/esm-framework';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { LabManifestConfig } from '../config-schema';
import {
  editableManifestStatus,
  LabManifestFilters,
  labManifestFormSchema,
  mutateManifestLinks,
  saveLabManifest,
} from '../lab-manifest.resources';
import { County, MappedLabManifest } from '../types';
import styles from './lab-manifest-form.scss';
interface LabManifestFormProps extends DefaultWorkspaceProps {
  patientUuid: string;
  manifest?: MappedLabManifest;
}

type LabManifestFormType = z.infer<typeof labManifestFormSchema>;

const LabManifestForm: React.FC<LabManifestFormProps> = ({ closeWorkspace, manifest }) => {
  const { labmanifestTypes } = useConfig<LabManifestConfig>();
  const counties = require('../counties.json') as County[];

  const form = useForm<LabManifestFormType>({
    defaultValues: {
      ...manifest,
      manifestType: manifest?.manifestType ? Number(manifest.manifestType) : undefined,
      dispatchDate: manifest?.dispatchDate ? parseDate(manifest.dispatchDate) : undefined,
      startDate: manifest?.startDate ? parseDate(manifest.startDate) : undefined,
      endDate: manifest?.endDate ? parseDate(manifest.endDate) : undefined,
    },
    resolver: zodResolver(labManifestFormSchema),
  });
  const { t } = useTranslation();
  const observableSelectedCounty = form.watch('county');
  const layout = useLayoutType();
  const controlSize = layout === 'tablet' ? 'xl' : 'sm';
  const onSubmit = async (values: LabManifestFormType) => {
    try {
      await saveLabManifest(values, manifest?.uuid);
      mutateManifestLinks(manifest?.uuid, values?.manifestStatus, manifest?.manifestStatus);
      closeWorkspace();
      showSnackbar({ title: 'Success', kind: 'success', subtitle: 'Lab manifest created successfully!' });
    } catch (error) {
      showSnackbar({ title: 'Failure', kind: 'error', subtitle: 'Error creating lab manifest' });
    }
  };
  return (
    <Form onSubmit={form.handleSubmit(onSubmit)}>
      <Stack gap={4} className={styles.grid}>
        <span className={styles.sectionHeader}>{t('manifestDateRange', 'Manifest Date range')}</span>

        <Column>
          <Controller
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                dateFormat="d/m/Y"
                id="startDate"
                datePickerType="single"
                className={styles.datePickerInput}
                invalid={form.formState.errors[field.name]?.message}
                invalidText={form.formState.errors[field.name]?.message}>
                <DatePickerInput
                  invalid={form.formState.errors[field.name]?.message}
                  invalidText={form.formState.errors[field.name]?.message}
                  placeholder="mm/dd/yyyy"
                  labelText={t('startDate', 'Start Date')}
                  size={controlSize}
                />
              </DatePicker>
            )}
          />
        </Column>
        <Column>
          <Controller
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                className={styles.datePickerInput}
                dateFormat="d/m/Y"
                id="endDate"
                datePickerType="single"
                invalid={form.formState.errors[field.name]?.message}
                invalidText={form.formState.errors[field.name]?.message}>
                <DatePickerInput
                  invalid={form.formState.errors[field.name]?.message}
                  invalidText={form.formState.errors[field.name]?.message}
                  placeholder="mm/dd/yyyy"
                  labelText={t('endDate', 'End Date')}
                  size="xl"
                />
              </DatePicker>
            )}
          />
        </Column>
        <span className={styles.sectionHeader}>{t('manifestType', 'Manifest type')}</span>
        <Column>
          <Controller
            control={form.control}
            name="manifestType"
            render={({ field }) => (
              <Dropdown
                ref={field.ref}
                invalid={form.formState.errors[field.name]?.message}
                invalidText={form.formState.errors[field.name]?.message}
                id="manifestType"
                titleText={t('manifestType', 'Manifest Type')}
                onChange={(e) => {
                  field.onChange(e.selectedItem);
                }}
                initialSelectedItem={field.value}
                label="Choose option"
                items={labmanifestTypes.map((r) => r.id)}
                itemToString={(item) => labmanifestTypes.find((r) => r.id === item)?.type ?? ''}
              />
            )}
          />
        </Column>
        <span className={styles.sectionHeader}>{t('dispatchDetails', 'Dispatch Details')}</span>
        <Column>
          <Controller
            control={form.control}
            name="dispatchDate"
            render={({ field }) => (
              <DatePicker
                dateFormat="d/m/Y"
                id="dispatchDate"
                datePickerType="single"
                className={styles.datePickerInput}
                {...field}
                invalid={form.formState.errors[field.name]?.message}
                invalidText={form.formState.errors[field.name]?.message}>
                <DatePickerInput
                  invalid={form.formState.errors[field.name]?.message}
                  invalidText={form.formState.errors[field.name]?.message}
                  placeholder="mm/dd/yyyy"
                  labelText={t('dispatchDate', 'Dispatch Date')}
                  size="xl"
                />
              </DatePicker>
            )}
          />
        </Column>
        <Column>
          <Controller
            control={form.control}
            name="courierName"
            render={({ field }) => (
              <TextInput
                invalid={form.formState.errors[field.name]?.message}
                invalidText={form.formState.errors[field.name]?.message}
                {...field}
                placeholder="Courier name"
                labelText={t('courierName', 'Courier name')}
              />
            )}
          />
        </Column>
        <Column>
          <Controller
            control={form.control}
            name="personHandedTo"
            render={({ field }) => (
              <TextInput
                invalid={form.formState.errors[field.name]?.message}
                invalidText={form.formState.errors[field.name]?.message}
                {...field}
                placeholder="Person name"
                labelText={t('personHandedTo', 'Person handed to')}
              />
            )}
          />
        </Column>
        <span className={styles.sectionHeader}>{t('address', 'Address')}</span>
        <Column>
          <Controller
            control={form.control}
            name="county"
            render={({ field }) => (
              <Dropdown
                ref={field.ref}
                invalid={form.formState.errors[field.name]?.message}
                invalidText={form.formState.errors[field.name]?.message}
                id="county"
                titleText={t('county', 'County')}
                onChange={(e) => {
                  field.onChange(e.selectedItem);
                  form.setValue('subCounty', undefined);
                }}
                initialSelectedItem={field.value}
                label="Select county"
                items={counties.map((r) => r.name)}
                itemToString={(item) => item ?? ''}
              />
            )}
          />
        </Column>
        <Column>
          <Controller
            control={form.control}
            name="subCounty"
            render={({ field }) => (
              <Dropdown
                ref={field.ref}
                invalid={form.formState.errors[field.name]?.message}
                invalidText={form.formState.errors[field.name]?.message}
                id="subCounty"
                titleText={t('subCounty', 'Sub county')}
                initialSelectedItem={field.value}
                onChange={(e) => {
                  field.onChange(e.selectedItem);
                }}
                label="Select subcounty"
                items={(counties.find((c) => c.name == observableSelectedCounty)?.constituencies ?? []).map(
                  (r) => r.name,
                )}
                itemToString={(item) =>
                  (counties.find((c) => c.name == observableSelectedCounty)?.constituencies ?? []).find(
                    (c) => c.name === item,
                  )?.name ?? 'Select subcounty'
                }
              />
            )}
          />
        </Column>
        <Column>
          <Controller
            control={form.control}
            name="facilityEmail"
            render={({ field }) => (
              <TextInput
                invalid={form.formState.errors[field.name]?.message}
                invalidText={form.formState.errors[field.name]?.message}
                {...field}
                placeholder="Facility Email"
                labelText={t('facilityEmail', 'Facility email')}
              />
            )}
          />
        </Column>
        <Column>
          <Controller
            control={form.control}
            name="facilityPhoneContact"
            render={({ field }) => (
              <TextInput
                {...field}
                invalid={form.formState.errors[field.name]?.message}
                invalidText={form.formState.errors[field.name]?.message}
                placeholder="Phone number"
                labelText={t('facilityPhoneContact', 'Facility phone contact')}
              />
            )}
          />
        </Column>
        <Column>
          <Controller
            control={form.control}
            name="clinicianName"
            render={({ field }) => (
              <TextInput
                invalid={form.formState.errors[field.name]?.message}
                invalidText={form.formState.errors[field.name]?.message}
                {...field}
                placeholder="Clinician name"
                labelText={t('clinicianName', 'Clinician name')}
              />
            )}
          />
        </Column>
        <Column>
          <Controller
            control={form.control}
            name="clinicianContact"
            render={({ field }) => (
              <TextInput
                {...field}
                invalid={form.formState.errors[field.name]?.message}
                invalidText={form.formState.errors[field.name]?.message}
                placeholder="Clinician contact"
                labelText={t('clinicianContact', 'Clinician phone contact')}
              />
            )}
          />
        </Column>
        <Column>
          <Controller
            control={form.control}
            name="labPersonContact"
            render={({ field }) => (
              <TextInput
                {...field}
                invalid={form.formState.errors[field.name]?.message}
                invalidText={form.formState.errors[field.name]?.message}
                placeholder="Lab person contact"
                labelText={t('labPersonContact', 'Lab person contact')}
              />
            )}
          />
        </Column>
        <span className={styles.sectionHeader}>{t('manifestStatus', 'Manifest status')}</span>
        <Column>
          <Controller
            control={form.control}
            name="manifestStatus"
            render={({ field }) => (
              <Dropdown
                ref={field.ref}
                invalid={form.formState.errors[field.name]?.message}
                invalidText={form.formState.errors[field.name]?.message}
                id="manifestStatus"
                titleText={t('status', 'Status')}
                onChange={(e) => {
                  field.onChange(e.selectedItem);
                }}
                initialSelectedItem={field.value}
                label="Select status"
                items={LabManifestFilters.filter((lm) => editableManifestStatus.includes(lm.value)).map((r) => r.value)}
                itemToString={(item) =>
                  LabManifestFilters.filter((lm) => editableManifestStatus.includes(lm.value)).find(
                    (r) => r.value === item,
                  )?.label ?? ''
                }
              />
            )}
          />
        </Column>
      </Stack>

      <ButtonSet className={styles.buttonSet}>
        <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
          {t('discard', 'Discard')}
        </Button>
        <Button className={styles.button} kind="primary" disabled={form.formState.isSubmitting} type="submit">
          {t('submit', 'Submit')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default LabManifestForm;
