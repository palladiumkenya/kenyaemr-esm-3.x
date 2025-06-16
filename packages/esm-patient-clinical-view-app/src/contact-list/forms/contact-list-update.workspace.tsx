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
import React, { useEffect, useMemo } from 'react';
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
  const persionUuid = relationship?.personB?.uuid;
  const { attributes } = usePersonAttributes(relationship?.personB?.uuid);
  const config = useConfig<ConfigObject>();

  const { t } = useTranslation();

  const form = useForm<ContactListUpdateFormType>({
    defaultValues: {},
    resolver: zodResolver(relationshipUpdateFormSchema),
  });

  const { isLoading: isPatientloading, birthdate } = usePatientBirthdate(relationship?.personB?.uuid);

  const patientAgeMonths = useMemo(() => {
    let birthDate = birthdate ? parseDate(birthdate) : null;
    if (birthDate) {
      return dayjs().diff(birthDate, 'month');
    }
    return null;
  }, [birthdate]);

  useEffect(() => {
    if (relationship && relationshipTypes.length > 0) {
      if (relationship.endDate) {
        form.setValue('endDate', new Date(relationship.endDate));
      }
      if (relationship.startDate) {
        form.setValue('startDate', new Date(relationship.startDate));
      }
      if (relationship.relationshipType) {
        form.setValue('relationshipType', relationship.relationshipType.uuid);
      }
    }
  }, [relationship, relationshipTypes, form]);

  useEffect(() => {
    if (relation) {
      if (relation.startDate) {
        try {
          const startDate = new Date(relation.startDate);
          form.setValue('startDate', startDate);
        } catch (e) {
          console.warn('Invalid start date format:', relation.startDate);
        }
      }

      if (relation.endDate) {
        try {
          const endDate = new Date(relation.endDate);
          form.setValue('endDate', endDate);
        } catch (e) {
          console.warn('Invalid end date format:', relation.endDate);
        }
      }

      if (relation.relationshipType && relationshipTypes.length > 0) {
        const relType = relationshipTypes.find(
          (type) =>
            type.displayBIsToA === relation.relationshipType || type.displayAIsToB === relation.relationshipType,
        );
        if (relType) {
          form.setValue('relationshipType', relType.uuid);
        }
      }
    }
  }, [relation, relationshipTypes, form]);

  const onSubmit = async (values: ContactListUpdateFormType) => {
    try {
      await updateRelationship(relationship.uuid, values);
      await updateContactAttributes(
        persionUuid,
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
        subtitle: t('relationshipUpdated', ' Relationship updated successfully'),
      });

      mutate((key) => {
        return typeof key === 'string' && key.startsWith(`${restBaseUrl}/relationship`);
      });

      closeWorkspace();
    } catch (error) {
      showSnackbar({
        title: 'Error',
        subtitle: 'Failure updating relationship! ' + JSON.stringify(error),
        kind: 'error',
      });
    }
  };

  if (isLoading || typesLoading) {
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
                  {...field}
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
                  {...field}
                  ref={undefined}
                  invalid={!!error?.message}
                  invalidText={error?.message}>
                  <DatePickerInput
                    id="enddate-input"
                    name="enddate-input"
                    invalid={!!error?.message}
                    invalidText={error?.message}
                    placeholder="mm/dd/yyyy"
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

          <RelationshipBaselineInfoFormSection
            patientAgeMonths={patientAgeMonths}
            patientUuid={relationship?.personB?.uuid}
          />
        </Stack>

        <ButtonSet className={styles.buttonSet}>
          <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
            {t('discard', 'Discard')}
          </Button>
          <Button className={styles.button} kind="primary" type="submit" disabled={form.formState.isSubmitting}>
            {t('submit', 'Submit')}
          </Button>
        </ButtonSet>
      </Form>
    </FormProvider>
  );
};

export default ContactListUpdateForm;
