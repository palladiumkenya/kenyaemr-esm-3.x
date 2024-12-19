import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Column, TextArea, Form, Stack, ButtonSet, ComboBox, Button, DatePicker, DatePickerInput } from '@carbon/react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import styles from './case-management.scss';
import { ExtensionSlot, showSnackbar, useConfig, useSession } from '@openmrs/esm-framework';
import { saveRelationship, useActivecases, useCaseManagers } from './case-management.resource';
import { extractNameString, uppercaseText } from '../../utils/expression-helper';
import PatientInfo from './patient-info.component';
import { useMappedRelationshipTypes } from '../../family-partner-history/relationships.resource';

const schema = z.object({
  caseManager: z.string().nonempty({ message: 'Case Manager is required' }),
  relationship: z.string().nonempty({ message: 'Relationship is required' }),
  startDate: z.date({ required_error: 'Start Date is required' }),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

type CaseManagementProp = {
  closeWorkspace: () => void;
};

const CaseManagementForm: React.FC<CaseManagementProp> = ({ closeWorkspace }) => {
  const { t } = useTranslation();
  const { user } = useSession();
  const [patientUuid, setPatientUuid] = useState('');
  const [patientSelected, setPatientSelected] = useState(false);
  const { data } = useCaseManagers();
  const { data: relationshipTypes } = useMappedRelationshipTypes();

  const caseManagerRelationshipTypeMapped =
    relationshipTypes
      .filter((relationshipType) => relationshipType.display === 'Case manager')
      ?.map((relationship) => ({
        id: relationship.uuid,
        text: relationship.display,
      })) || [];

  const caseManagerUuid = user?.person.uuid;
  const { mutate: fetchCases } = useActivecases(caseManagerUuid);

  const caseManagers =
    data?.data.results.map((manager) => ({
      id: manager.person.uuid,
      text: manager.display,
    })) || [];

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<FormData>({
    mode: 'onChange',
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const payload = {
      personA: data.caseManager,
      relationshipType: data.relationship,
      personB: patientUuid,
      startDate: data.startDate.toISOString(),
    };

    try {
      await saveRelationship(payload);
      await fetchCases();
      showSnackbar({
        kind: 'success',
        title: t('saveRlship', 'Save Relationship'),
        subtitle: t('savedRlship', 'Relationship saved successfully'),
        timeoutInMs: 3000,
        isLowContrast: true,
      });

      closeWorkspace();
    } catch (err) {
      showSnackbar({
        kind: 'error',
        title: t('RlshipError', 'Relationship Error'),
        subtitle: t('RlshipError', 'Request Failed.......'),
        timeoutInMs: 2500,
        isLowContrast: true,
      });
    }
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
            defaultValue={caseManagerUuid}
            render={({ field, fieldState }) => {
              return (
                <ComboBox
                  id="case_manager_name"
                  titleText={t('manager', 'Case Manager')}
                  placeholder="Select Case Manager"
                  items={caseManagers}
                  itemToString={(item) => uppercaseText(extractNameString(item ? item.text : ''))}
                  onChange={(e) => {
                    field.onChange(e.selectedItem?.id);
                  }}
                  selectedItem={caseManagers.find((manager) => manager.id === field.value)}
                  invalid={!!fieldState.error}
                  invalidText={fieldState.error?.message}
                />
              );
            }}
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
                items={caseManagerRelationshipTypeMapped}
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
                className={styles.formDatePicker}>
                <DatePickerInput
                  placeholder="mm/dd/yyyy"
                  labelText="Start Date"
                  id="case-start-date-picker"
                  size="md"
                  className={styles.formDatePicker}
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
              <TextArea labelText="Any additional notes" rows={4} id="case-manager-notes" {...field} />
            )}
          />
        </Column>
      </Stack>

      <ButtonSet className={styles.buttonSet}>
        <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
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
