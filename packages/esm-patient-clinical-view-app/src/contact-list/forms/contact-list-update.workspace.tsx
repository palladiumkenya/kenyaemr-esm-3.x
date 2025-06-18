import {
  Button,
  ButtonSet,
  Column,
  DatePicker,
  DatePickerInput,
  Dropdown,
  Form,
  InlineLoading,
  Stack,
  Tile,
} from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { DefaultWorkspaceProps, parseDate, restBaseUrl, showSnackbar, useConfig } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useRef } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { mutate } from 'swr';
import { z } from 'zod';
import PatientInfo from '../../case-management/workspace/patient-info.component';
import { ConfigObject } from '../../config-schema';
import { updateContactAttributes } from '../../contact-list/contact-list.resource';
import usePersonAttributes from '../../hooks/usePersonAttributes';
import useRelationship from '../../hooks/useRelationship';
import useRelationshipTypes from '../../hooks/useRelationshipTypes';
import RelationshipBaselineInfoFormSection from '../../relationships/forms/baseline-info-form-section.component';
import {
  relationshipFormSchema,
  relationshipUpdateFormSchema,
  updateRelationship,
  usePatientBirthdate,
} from '../../relationships/relationship.resources';
import { type Contact } from '../../types';
import styles from './contact-list-update.scss';

interface ContactListUpdateFormProps extends DefaultWorkspaceProps {
  relation: Contact;
  closeWorkspace: () => void;
  patientUuid: string;
}

type ContactListUpdateFormType = z.infer<typeof relationshipFormSchema>;

const ContactListUpdateForm: React.FC<ContactListUpdateFormProps> = ({ closeWorkspace, relation, patientUuid }) => {
  const { error, isLoading, relationship } = useRelationship(relation?.uuid);
  const { isLoading: typesLoading, error: typesError, relationshipTypes } = useRelationshipTypes();
  const personUuid = relationship?.personB?.uuid;
  const { attributes } = usePersonAttributes(personUuid);
  const config = useConfig<ConfigObject>();
  const { t } = useTranslation();
  const form = useForm<z.infer<typeof relationshipUpdateFormSchema>>({
    resolver: zodResolver(relationshipUpdateFormSchema),
    mode: 'all',
  });
  const { setValue } = form;
  const { isLoading: isPatientLoading, birthdate } = usePatientBirthdate(relationship?.personB?.uuid);

  // Use ref to track if initial values have been set
  const initialValuesSet = useRef(false);

  const patientAgeMonths = useMemo(() => {
    let birthDate = birthdate ? parseDate(birthdate) : null;
    if (birthDate) {
      return dayjs().diff(birthDate, 'month');
    }
    return null;
  }, [birthdate]);

  useEffect(() => {
    // Only set initial values once when data is available and not already set
    if (relationshipTypes.length > 0 && !initialValuesSet.current && relationship) {
      if (relationship.startDate) {
        try {
          const startDate = parseDate(relationship.startDate);
          setValue('startDate', startDate);
        } catch (e) {
          console.warn('Invalid start date format:', relationship.startDate);
        }
      }

      if (relationship.endDate) {
        try {
          const endDate = parseDate(relationship.endDate);
          setValue('endDate', endDate);
        } catch (e) {
          console.warn('Invalid end date format:', relationship.endDate);
        }
      }

      if (relationship.relationshipType?.uuid) {
        setValue('relationshipType', relationship.relationshipType.uuid);
      }

      // Mark that initial values have been set
      initialValuesSet.current = true;
    }
  }, [relationshipTypes, setValue, relationship]);

  const onSubmit = async (values: ContactListUpdateFormType) => {
    try {
      await updateRelationship(relationship.uuid, values);
      await updateContactAttributes(
        personUuid,
        {
          baselineStatus: values?.baselineStatus,
          preferedPNSAproach: values?.preferedPNSAproach,
          livingWithClient: values?.livingWithClient,
          ipvOutCome: values?.ipvOutCome,
        },
        config,
        attributes,
      );

      showSnackbar({
        title: 'Success',
        kind: 'success',
        subtitle: t('relationshipUpdated', 'Relationship updated successfully'),
      });

      mutate((key) => {
        return typeof key === 'string' && key.startsWith(`${restBaseUrl}/relationship`);
      });

      closeWorkspace();
    } catch (error) {
      showSnackbar({
        title: 'Error',
        subtitle: 'Failure updating relationship! ' + (error?.message || JSON.stringify(error)),
        kind: 'error',
      });
    }
  };

  if (isLoading || typesLoading || isPatientLoading) {
    return (
      <div className={styles.loading}>
        <InlineLoading status="active" iconDescription="Loading" description="Loading form..." />
      </div>
    );
  }

  if (error || typesError) {
    return (
      <div className={styles.error}>
        <Tile id="error">
          <strong>Error:</strong>
          <p>{error?.message ?? typesError?.message ?? t('errorLoadingForm', 'Failed to load form')}</p>
        </Tile>
      </div>
    );
  }

  if (!relationship) {
    return (
      <div className={styles.error}>
        <Tile id="no-relationship">
          <strong>Error:</strong>
          <p>{t('noRelationshipFound', 'No relationship data found')}</p>
        </Tile>
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <Form onSubmit={form.handleSubmit(onSubmit)}>
        <Stack gap={4} className={styles.grid}>
          <Column>
            <PatientInfo patientUuid={relationship?.personB?.uuid || relation?.relativeUuid} />
          </Column>
          <span className={styles.sectionHeader}>{t('relationship', 'Relationship')}</span>
          <Column>
            <Controller
              control={form.control}
              name="startDate"
              render={({ field, fieldState: { error } }) => (
                <DatePicker
                  className={styles.datePickerInput}
                  dateFormat="d/m/Y"
                  id="startDate"
                  datePickerType="single"
                  value={field.value}
                  onChange={(v) => field.onChange(v[0])}
                  ref={undefined}
                  invalid={!!error?.message}
                  invalidText={error?.message}>
                  <DatePickerInput
                    id={`startdate-input`}
                    name="startdate-input"
                    invalid={!!error?.message}
                    invalidText={error?.message}
                    placeholder="mm/dd/yyyy"
                    labelText={t('startDate', 'Start Date')}
                    size="xl"
                  />
                </DatePicker>
              )}
            />
          </Column>

          <Column>
            <Controller
              control={form.control}
              name="endDate"
              render={({ field, fieldState: { error } }) => (
                <DatePicker
                  className={styles.datePickerInput}
                  dateFormat="d/m/Y"
                  id="endDate"
                  datePickerType="single"
                  value={field.value}
                  onChange={(dates) => field.onChange(dates[0])}
                  invalid={!!error?.message}
                  invalidText={error?.message}>
                  <DatePickerInput
                    id="enddate-input"
                    name="enddate-input"
                    invalid={!!error?.message}
                    invalidText={error?.message}
                    placeholder="dd/mm/yyyy"
                    labelText={t('endDate', 'End Date')}
                    size="xl"
                  />
                </DatePicker>
              )}
            />
          </Column>

          <Column>
            <Controller
              control={form.control}
              name="relationshipType"
              render={({ field, fieldState: { error } }) => (
                <Dropdown
                  ref={field.ref}
                  invalid={!!error?.message}
                  invalidText={error?.message}
                  id="relationshipToPatient"
                  titleText={t('relationToPatient', 'Relation to patient')}
                  onChange={(e) => {
                    field.onChange(e.selectedItem);
                  }}
                  selectedItem={field.value}
                  label="Select Relationship"
                  items={relationshipTypes.map((r) => r.uuid)}
                  itemToString={(item) => relationshipTypes.find((r) => r.uuid === item)?.displayBIsToA ?? ''}
                />
              )}
            />
          </Column>

          <RelationshipBaselineInfoFormSection patientAgeMonths={patientAgeMonths} patientUuid={personUuid} />
        </Stack>

        <ButtonSet className={styles.buttonSet}>
          <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
            {t('discard', 'Discard')}
          </Button>
          <Button className={styles.button} kind="primary" type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? t('submitting', 'Submitting...') : t('submit', 'Submit')}
          </Button>
        </ButtonSet>
      </Form>
    </FormProvider>
  );
};

export default ContactListUpdateForm;
