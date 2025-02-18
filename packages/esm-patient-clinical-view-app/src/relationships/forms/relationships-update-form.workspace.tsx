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
import { DefaultWorkspaceProps, showSnackbar } from '@openmrs/esm-framework';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { mutate } from 'swr';
import { z } from 'zod';
import useRelationship from '../../hooks/useRelationship';
import useRelationshipTypes from '../../hooks/useRelationshipTypes';
import { relationshipUpdateFormSchema, updateRelationship } from '../relationship.resources';
import styles from './form.scss';
import PatientInfo from '../../case-management/workspace/patient-info.component';

interface RelationshipUpdateFormProps extends DefaultWorkspaceProps {
  relationShipUuid: string;
}

type RelationshipUpdateFormType = z.infer<typeof relationshipUpdateFormSchema>;

const RelationshipUpdateForm: React.FC<RelationshipUpdateFormProps> = ({ closeWorkspace, relationShipUuid }) => {
  const { error, isLoading, relationship } = useRelationship(relationShipUuid);
  const { isLoading: typesLoading, error: typesError, relationshipTypes } = useRelationshipTypes();
  const { t } = useTranslation();
  const form = useForm<RelationshipUpdateFormType>({
    defaultValues: {
      endDate: relationship?.endDate ? new Date(relationship.endDate) : undefined,
      startDate: relationship?.startDate ? new Date(relationship.startDate) : undefined,
      relationshipType: relationship?.relationshipType?.uuid,
    },
    resolver: zodResolver(relationshipUpdateFormSchema),
  });

  useEffect(() => {
    if (relationship && !form.watch('endDate')) {
      relationship.endDate && form.setValue('endDate', new Date(relationship.endDate));
      relationship.startDate && form.setValue('startDate', new Date(relationship.startDate));
      relationship.relationshipType && form.setValue('relationshipType', relationship.relationshipType.uuid);
    }
  }, [relationship, form]);

  const onSubmit = async (values: RelationshipUpdateFormType) => {
    try {
      await updateRelationship(relationShipUuid, values);
      closeWorkspace();
      showSnackbar({ title: 'Success', subtitle: 'Relationship updated succesfully!', kind: 'success' });
      mutate((key) => {
        return typeof key === 'string' && key.startsWith('/ws/rest/v1/relationship');
      });
    } catch (error) {
      showSnackbar({
        title: 'Success',
        subtitle: 'Failure updating relationship!' + JSON.stringify(error),
        kind: 'error',
      });
    }
  };

  if (isLoading || typesLoading) {
    return (
      <div className={styles.loading}>
        <InlineLoading
          status="active"
          iconDescription="Loading"
          description="Loading form..."
          style={{ justifyContent: 'center' }}
        />
      </div>
    );
  }

  if (error || typesError) {
    return (
      <div className={styles.error}>
        <Tile id="error">
          <strong>Error:</strong>
          <p>{error?.message ?? typesError?.message}</p>
        </Tile>
      </div>
    );
  }

  return (
    <Form onSubmit={form.handleSubmit(onSubmit)}>
      <Stack gap={4} className={styles.grid}>
        <Column>
          <PatientInfo patientUuid={relationship.personB.uuid} />
        </Column>
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
                invalid={form.formState.errors[field.name]?.message}
                invalidText={form.formState.errors[field.name]?.message}>
                <DatePickerInput
                  invalid={form.formState.errors[field.name]?.message}
                  invalidText={form.formState.errors[field.name]?.message}
                  placeholder="mm/dd/yyyy"
                  labelText={t('startDate', 'Start Date')}
                  size={'xl'}
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
        <Column>
          <Controller
            control={form.control}
            name="relationshipType"
            render={({ field }) => (
              <Dropdown
                ref={field.ref}
                invalid={form.formState.errors[field.name]?.message}
                invalidText={form.formState.errors[field.name]?.message}
                id="relationship"
                titleText={t('relationshipType', 'Relationship Type')}
                onChange={(e) => {
                  field.onChange(e.selectedItem);
                }}
                selectedItem={field.value}
                label="Choose option"
                items={relationshipTypes.map((r) => r.uuid)}
                itemToString={(item) => relationshipTypes.find((r) => r.uuid === item)?.displayBIsToA ?? ''}
              />
            )}
          />
        </Column>
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
  );
};

export default RelationshipUpdateForm;
