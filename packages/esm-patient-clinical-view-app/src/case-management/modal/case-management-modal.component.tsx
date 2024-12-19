import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalBody, ModalFooter, ModalHeader, Column } from '@carbon/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { mutate } from 'swr';
import { updateRelationship } from '../../relationships/relationship.resources';
import { showSnackbar } from '@openmrs/esm-framework';
import EndDatePicker from './end-date.component';
import styles from './end-date.scss';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(EndRelationshipSchema),
    defaultValues: { endDate: null },
  });

  const handleEndRelationship = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      await updateRelationship(relationshipUuid, { endDate: data.endDate });
      mutate((key) => typeof key === 'string' && key.startsWith('/ws/rest/v1/relationship'), undefined, {
        revalidate: true,
      });
      showSnackbar({
        kind: 'success',
        title: t('endRlship', 'End relationship'),
        subtitle: t('savedRlship', 'Relationship ended successfully'),
        timeoutInMs: 3000,
        isLowContrast: true,
      });
      closeModal();
    } catch (error) {
      showSnackbar({
        kind: 'error',
        title: t('RlshipError', 'Relationship Error'),
        subtitle: t('RlshipErrorMessage', 'Request Failed'),
        timeoutInMs: 2500,
        isLowContrast: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleEndRelationship)}>
      <div className="cds--modal-header">
        <h3 className="cds--modal-header__heading">{t('endRelationship', 'End Relationship')}</h3>
      </div>
      <div className="cds--modal-content">
        <p>{t('rlshipConfirmationText', 'This will end the relationship. Are you sure you want to proceed?')}</p>

        <div className={styles.centeredContainer}>
          <EndDatePicker name="endDate" control={control} label={t('endDate', 'End Date')} />
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
