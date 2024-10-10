import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Column, TextArea, Form, Stack, ButtonSet, ComboBox, Button, DatePicker, DatePickerInput } from '@carbon/react';
import { useForm, Controller, SubmitHandler, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import styles from './other-relationships.scss';
import { ExtensionSlot, showSnackbar, useConfig } from '@openmrs/esm-framework';
import { uppercaseText } from '../utils/expression-helper';
import { saveRelationship } from '../case-management/workspace/case-management.resource';
import PatientInfo from '../case-management/workspace/patient-info.component';
import { mutate } from 'swr';
import { useMappedRelationshipTypes, usePatientRelationships } from '../family-partner-history/relationships.resource';
import { ConfigObject } from '../config-schema';
import PatientSearchCreate from '../relationships/forms/patient-search-create-form';

const schema = z.object({
  relationship: z.string({ required_error: 'Relationship is required' }),
  startDate: z.date({ required_error: 'Start date is required' }),
  endDate: z.date().optional(),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

type OtherRelationshipsFormProps = {
  closeWorkspace: () => void;
  rootPersonUuid: string;
};

export const OtherRelationshipsForm: React.FC<OtherRelationshipsFormProps> = ({ closeWorkspace, rootPersonUuid }) => {
  const { t } = useTranslation();
  const [relatedPersonUuid, setRelatedPersonUuid] = useState<string | undefined>(undefined);
  const { relationshipsUrl } = usePatientRelationships(rootPersonUuid);
  const { data: mappedRelationshipTypes } = useMappedRelationshipTypes();
  const { familyRelationshipsTypeList } = useConfig<ConfigObject>();
  const familyRelationshipTypesUUIDs = new Set(familyRelationshipsTypeList.map((r) => r.uuid));
  const otherRelationshipTypes = mappedRelationshipTypes.filter((type) => !familyRelationshipTypesUUIDs.has(type.uuid));

  const relationshipTypes = otherRelationshipTypes.map((relationship) => ({
    id: relationship.uuid,
    text: relationship.display,
  }));

  const form = useForm<FormData>({
    mode: 'all',
    resolver: zodResolver(schema),
  });

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = form;

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const payload = {
      personA: rootPersonUuid,
      personB: relatedPersonUuid,
      relationshipType: data.relationship,
      startDate: data.startDate.toISOString(),
      endDate: data.endDate ? data.endDate.toISOString() : null,
    };

    try {
      await saveRelationship(payload);
      mutate(relationshipsUrl);
      showSnackbar({
        kind: 'success',
        title: t('saveRelationship', 'Save Relationship'),
        subtitle: t('savedRlship', 'Relationship saved successfully'),
        timeoutInMs: 3000,
        isLowContrast: true,
      });

      closeWorkspace();
    } catch (err) {
      showSnackbar({
        kind: 'error',
        title: t('relationshpError', 'Relationship Error'),
        subtitle: t('RlshipError', 'Request Failed.......'),
        timeoutInMs: 2500,
        isLowContrast: true,
      });
    }
  };

  const selectPatient = (relatedPersonUuid: string) => {
    setRelatedPersonUuid(relatedPersonUuid);
  };

  return (
    <FormProvider {...form}>
      <Form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <span className={styles.caseFormTitle}>{t('formTitle', 'Fill in the form details')}</span>
        <Stack gap={5} className={styles.grid}>
          <PatientSearchCreate />
          {relatedPersonUuid && <PatientInfo patientUuid={relatedPersonUuid} />}
          {!relatedPersonUuid && (
            <Column>
              <ExtensionSlot
                name="patient-search-bar-slot"
                state={{
                  selectPatientAction: selectPatient,
                  buttonProps: {
                    kind: 'primary',
                  },
                }}
              />
            </Column>
          )}
          <Column>
            <Controller
              name="relationship"
              control={control}
              render={({ field, fieldState }) => (
                <ComboBox
                  id="relationship_name"
                  titleText={t('relationship', 'Relationship')}
                  placeholder="Select Relationship"
                  items={relationshipTypes}
                  itemToString={(item) => (item ? uppercaseText(item.text) : '')}
                  onChange={(e) => field.onChange(e.selectedItem?.id)}
                  invalid={!!fieldState.error}
                  invalidText={fieldState.error?.message}
                />
              )}
            />
          </Column>

          <Column>
            <Controller
              name="startDate"
              control={control}
              render={({ field, fieldState }) => (
                <DatePicker
                  datePickerType="single"
                  onChange={(e) => field.onChange(e[0])}
                  className={styles.datePickerInput}>
                  <DatePickerInput
                    placeholder="mm/dd/yyyy"
                    labelText="Start Date"
                    id="case-start-date-picker"
                    size="md"
                    className={styles.datePickerInput}
                    invalid={!!fieldState.error}
                    invalidText={fieldState.error?.message}
                  />
                </DatePicker>
              )}
            />
          </Column>

          <Column className={styles.component}>
            <Controller
              name="endDate"
              control={control}
              render={({ field, fieldState }) => (
                <DatePicker
                  datePickerType="single"
                  onChange={(e) => field.onChange(e[0])}
                  className={styles.datePickerInput}>
                  <DatePickerInput
                    placeholder="mm/dd/yyyy"
                    labelText="End Date"
                    id="case-end-date-picker"
                    size="md"
                    className={styles.datePickerInput}
                    invalid={!!fieldState.error}
                    invalidText={fieldState.error?.message}
                  />
                </DatePicker>
              )}
            />
          </Column>

          <Column className={styles.textbox}>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextArea
                  labelText={t('additionalNotes', 'Any additional notes')}
                  rows={4}
                  id="relationship-notes"
                  {...field}
                />
              )}
            />
          </Column>
        </Stack>

        <ButtonSet className={styles.buttonSet}>
          <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
            {t('discard', 'Discard')}
          </Button>
          <Button className={styles.button} kind="primary" type="submit" disabled={!isValid || !relatedPersonUuid}>
            {t('save', 'Save')}
          </Button>
        </ButtonSet>
      </Form>
    </FormProvider>
  );
};
