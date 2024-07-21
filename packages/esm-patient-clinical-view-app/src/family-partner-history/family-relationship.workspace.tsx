import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Column, TextArea, Form, Stack, ButtonSet, ComboBox, Button, DatePicker, DatePickerInput } from '@carbon/react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import styles from './family-relationship.scss';
import { ExtensionSlot, showSnackbar } from '@openmrs/esm-framework';
import { uppercaseText } from '../utils/expression-helper';
import { saveRelationship } from '../case-management/workspace/case-management.resource';
import PatientInfo from '../case-management/workspace/patient-info.component';
import { mutate } from 'swr';
import { useAllRelationshipTypes, useRelationships } from './relationships.resource';

const schema = z.object({
  relationship: z.string({ required_error: 'Relationship is required' }),
  startDate: z.date({ required_error: 'Start date is required' }),
  endDate: z.date().optional(),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

type RelationshipFormProps = {
  closeWorkspace: () => void;
  rootPersonUuid: string;
};

export const familyRelationshipTypes = [
  'Sibling/Sibling',
  'Parent/Child',
  'Aunt/Uncle/Niece/Nephew',
  'Guardian/Dependant',
  'Spouse/Spouse',
  'Partner/Partner',
  'Co-wife/Co-wife',
  'SNS/SNS',
  'Injectable-drug-user/Injectable-druguser',
];

const FamilyRelationshipForm: React.FC<FamilyRelationshipFormProps> = ({ closeWorkspace, personAUUID }) => {
  const { t } = useTranslation();
  const [patientUuid, setPatientUuid] = useState<string | undefined>(undefined);
  const { relationshipsUrl } = useRelationships(personAUUID);
  const { data: relationshipTypesData } = useAllRelationshipTypes();

  const relationshipTypes =
    relationshipTypesData?.data.results
      .map((relationship) => ({
        id: relationship.uuid,
        text: relationship.display,
      }))
      .filter((r) => familyRelationshipTypes.includes(r.text)) || [];

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<FormData>({
    mode: 'all',
    resolver: zodResolver(schema),
  });

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
    setPatientUuid(relatedPersonUuid);
  };

  return (
    <Form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <span className={styles.caseFormTitle}>{t('formTitle', 'Fill in the form details')}</span>
      <Stack gap={5} className={styles.grid}>
        {patientUuid && <PatientInfo patientUuid={patientUuid} />}
        {!patientUuid && (
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
              <TextArea labelText={t('addiotionalNotes','Any additional notes')} rows={4} id="relationship-notes" {...field} />
            )}
          />
        </Column>
      </Stack>

      <ButtonSet className={styles.buttonSet}>
        <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
          {t('discard', 'Discard')}
        </Button>
        <Button className={styles.button} kind="primary" type="submit" disabled={!isValid || !patientUuid}>
          {t('save', 'Save')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default FamilyRelationshipForm;
