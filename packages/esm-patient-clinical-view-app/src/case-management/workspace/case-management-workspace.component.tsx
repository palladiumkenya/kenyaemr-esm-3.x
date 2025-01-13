import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, DatePicker, DatePickerInput, Column, ButtonSet, Form, Stack } from '@carbon/react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { mutate } from 'swr';
import { updateRelationship } from '../../relationships/relationship.resources';
import { showSnackbar } from '@openmrs/esm-framework';
import styles from './case-management-workspace.scss';

const EndRelationshipSchema = z.object({
  endDate: z.date({
    required_error: 'End date is required',
    invalid_type_error: 'Please select a valid date',
  }),
});

type FormData = z.infer<typeof EndRelationshipSchema>;

interface EndRelationshipWorkspaceProps {
  closeWorkspace: () => void;
  relationshipUuid: string;
}

const EndRelationshipWorkspace: React.FC<EndRelationshipWorkspaceProps> = ({ closeWorkspace, relationshipUuid }) => {
  const { t } = useTranslation();

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(EndRelationshipSchema),
    defaultValues: { endDate: null },
  });

  const handleEndRelationship = async (data: FormData) => {
    try {
      await updateRelationship(relationshipUuid, { endDate: data.endDate });
      mutate((key) => typeof key === 'string' && key.startsWith('/ws/rest/v1/relationship'), undefined, {
        revalidate: true,
      });
      showSnackbar({
        kind: 'success',
        title: t('endRelationship', 'End relationship'),
        subtitle: t('savedRelationship', 'Relationship ended successfully'),
        timeoutInMs: 3000,
        isLowContrast: true,
      });
      closeWorkspace();
    } catch (error) {
      showSnackbar({
        kind: 'error',
        title: t('relationshipError', 'Relationship Error'),
        subtitle: t('relationshipErrorMessage', 'Request Failed'),
        timeoutInMs: 2500,
        isLowContrast: true,
      });
    }
  };

  return (
    <Form className={styles.formContainer} onSubmit={handleSubmit(handleEndRelationship)}>
      <Stack gap={4} className={styles.formGrid}>
        <div className={styles.dateTimePickerContainer}>
          <p className={styles.confirmationText}>
            {t('relationshipConfirmationText', 'This will end the relationship. Are you sure you want to proceed?')}
          </p>
          <Column>
            <Controller
              name="endDate"
              control={control}
              render={({ field, fieldState }) => (
                <DatePicker datePickerType="single" onChange={(e) => field.onChange(e[0])}>
                  <DatePickerInput
                    placeholder="mm/dd/yyyy"
                    labelText={t('endDate', 'End Date')}
                    id="endDate-picker"
                    size="md"
                    invalid={!!fieldState.error}
                    invalidText={fieldState.error?.message}
                  />
                </DatePicker>
              )}
            />
          </Column>
        </div>

        <ButtonSet className={styles.buttonSet}>
          <Button size="lg" kind="secondary" onClick={closeWorkspace}>
            {t('discard', 'Discard')}
          </Button>
          <Button kind="primary" size="lg" type="submit">
            {t('save', 'Save')}
          </Button>
        </ButtonSet>
      </Stack>
    </Form>
  );
};

export default EndRelationshipWorkspace;
