import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, DatePicker, DatePickerInput, ModalFooter } from '@carbon/react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { mutate } from 'swr';
import { updateRelationship } from '../../relationships/relationship.resources';
import { showSnackbar } from '@openmrs/esm-framework';
import styles from './case-management-modal.scss';

const EndRelationshipSchema = z.object({
  endDate: z.date({
    required_error: 'End date is required',
    invalid_type_error: 'Please select a valid date',
  }),
});

type FormData = z.infer<typeof EndRelationshipSchema>;

interface EndRelationshipModalProps {
  closeModal: () => void;
  relationshipUuid: string;
}

const EndRelationshipModal: React.FC<EndRelationshipModalProps> = ({ closeModal, relationshipUuid }) => {
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
      closeModal();
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
    <form onSubmit={handleSubmit(handleEndRelationship)}>
      <div className="cds--modal-header">
        <h3 className="cds--modal-header__heading">{t('endRelationship', 'End relationship')}</h3>
      </div>
      <div className="cds--modal-content">
        <p>{t('relationshipConfirmationText', 'This will end the relationship. Are you sure you want to proceed?')}</p>

        <div className={styles.centeredContainer}>
          <Controller
            name="endDate"
            control={control}
            render={({ field, fieldState }) => (
              <DatePicker
                datePickerType="single"
                onChange={(e) => field.onChange(e[0])}
                className={styles.formDatePicker}>
                <DatePickerInput
                  placeholder="mm/dd/yyyy"
                  labelText={t('endDate', 'End Date')}
                  id="endDate-picker"
                  size="md"
                  className={styles.formDatePicker}
                  invalid={!!fieldState.error}
                  invalidText={fieldState.error?.message}
                />
              </DatePicker>
            )}
          />
        </div>
      </div>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('no', 'No')}
        </Button>
        <Button type="submit" kind="danger" disabled={isSubmitting}>
          {t('yes', 'Yes')}
        </Button>
      </ModalFooter>
    </form>
  );
};

export default EndRelationshipModal;
