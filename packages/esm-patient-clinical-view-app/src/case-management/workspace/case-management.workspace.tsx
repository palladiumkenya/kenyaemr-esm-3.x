import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Column, TextArea, Form, Stack, ButtonSet, ComboBox, Button, DatePicker, DatePickerInput } from '@carbon/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import styles from './case-management.scss';
import { ExtensionSlot, useSession } from '@openmrs/esm-framework';
import { useCaseManagers, useRelationshipType } from './case-management.resource';
import { extractNameString, uppercaseText } from '../../utils/expression-helper';
import PatientInfo from './patient-info.component';
import { caseManagementConceptMap } from './case-management-concept-map';

const schema = z.object({
  caseManager: z.string().nonempty({ message: 'Case Manager is required' }),
  relationship: z.string().nonempty({ message: 'Relationship is required' }),
  startDate: z.date({ required_error: 'Start Date is required' }),
  reasons: z.string().nonempty({ message: 'At least one reason is required' }),
  endDate: z.date().optional(),
  notes: z.string().optional(),
});

const CaseManagementForm: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useSession();
  const [patientUuid, setPatientUuid] = useState('');
  const [patientSelected, setPatientSelected] = useState(false);

  const { data, error } = useCaseManagers();
  const { data: relationshipTypesData } = useRelationshipType();

  const caseManagers =
    data?.data.results.map((manager) => ({
      id: manager.uuid,
      text: manager.display,
    })) || [];

  const caseManagerRlshipType =
    relationshipTypesData?.data.results.map((relationship) => ({
      id: relationship.uuid,
      text: relationship.display,
    })) || [];

  const conceptReasons = useMemo(() => {
    return Object.keys(caseManagementConceptMap.answers).map((key) => ({
      id: key,
      text: caseManagementConceptMap.answers[key],
    }));
  }, []);

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm({
    mode: 'onChange',
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    // Handle form submission
  };

  const selectPatient = (patientUuid) => {
    setPatientUuid(patientUuid);
    setPatientSelected(true);
  };

  return (
    <Form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <span className={styles.caseFormTitle}>{t('formTitle', 'Fill in the form details')}</span>
      <Stack gap={4} className={styles.grid}>
        <span className={styles.sectionHeader}>Demographics</span>

        <Column>
          <Controller
            name="caseManager"
            control={control}
            render={({ field, fieldState }) => (
              <ComboBox
                id="case_manager_name"
                titleText={t('manager', 'Case Manager')}
                placeholder="Select Case Manager"
                items={caseManagers}
                itemToString={(item) => uppercaseText(extractNameString(item ? item.text : ''))}
                onChange={(e) => field.onChange(e.selectedItem?.id)}
                invalid={!!fieldState.error}
                invalidText={fieldState.error?.message}
              />
            )}
          />
        </Column>

        <span className={styles.sectionHeader}>Relationship Info</span>
        {patientSelected && <PatientInfo patientUuid={patientUuid} />}
        {!patientSelected && (
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
                items={caseManagerRlshipType}
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
              <DatePicker datePickerType="single" onChange={(e) => field.onChange(e[0])}>
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

        <Column>
          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <DatePicker datePickerType="single" onChange={(e) => field.onChange(e[0])}>
                <DatePickerInput
                  placeholder="mm/dd/yyyy"
                  labelText="End Date"
                  id="case-end-date-picker"
                  size="md"
                  className={styles.component}
                />
              </DatePicker>
            )}
          />
        </Column>

        <Column>
          <Controller
            name="reasons"
            control={control}
            render={({ field, fieldState }) => (
              <ComboBox
                id="reasons"
                placeholder="Select Reason for Assignment"
                titleText={t('reasons', 'Reason for Assignment')}
                items={conceptReasons}
                itemToString={(item) => (item ? uppercaseText(item.text) : '')}
                onChange={(e) => field.onChange(e.selectedItem?.id)}
                invalid={!!fieldState.error}
                invalidText={fieldState.error?.message}
              />
            )}
          />
        </Column>

        <Column className={styles.textbox}>
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <TextArea labelText="Any additional notes" rows={4} id="case-manager-notes" {...field} />
            )}
          />
        </Column>
      </Stack>

      <ButtonSet className={styles.buttonSet}>
        <Button className={styles.button} kind="secondary">
          {t('discard', 'Discard')}
        </Button>
        <Button className={styles.button} kind="primary" type="submit" disabled={!isValid || !patientSelected}>
          {t('save', 'Save')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default CaseManagementForm;
