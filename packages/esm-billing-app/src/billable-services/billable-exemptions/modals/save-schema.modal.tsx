import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ComposedModal, Form, InlineLoading, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { showSnackbar } from '@openmrs/esm-framework';
import { saveExemptionSchema, useSystemBillableSetting } from '../../../hooks/useExemptionSchema';

import type { Schema } from '../../../types';
import styles from './save-schema-modal.scss';

interface SaveSchemaModalProps {
  schema: Schema;
}

const SaveSchemaModal: React.FC<SaveSchemaModalProps> = ({ schema }) => {
  const { t } = useTranslation();
  const { mutate } = useSystemBillableSetting('kenyaemr.billing.exemptions');
  const [isSavingSchema, setIsSavingSchema] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    setIsSavingSchema(true);

    try {
      await saveExemptionSchema(schema, 'kenyaemr.billing.exemptions');

      showSnackbar({
        title: t('schemaCreated', 'New schema created'),
        kind: 'success',
        isLowContrast: true,
        subtitle: t(
          'saveSuccessMessage',
          'Exemptions schema was created successfully. The Billables exemptions have been set.',
        ),
      });

      closeModal();
      await mutate();
    } catch (error) {
      showSnackbar({
        title: t('errorCreatingSchema', 'Error creating schema'),
        kind: 'error',
        subtitle: error instanceof Error ? error.message : t('unexpectedError', 'An unexpected error occurred'),
      });
    } finally {
      setIsSavingSchema(false);
    }
  };

  return (
    <>
      <ComposedModal open={isModalOpen} onClose={closeModal} preventCloseOnClickOutside>
        <ModalHeader className={styles.modalHeader} title={t('saveSchemaToServer', 'Save schema to server')} />
        <Form onSubmit={handleSubmit} className={styles.saveSchemaBody}>
          <ModalBody>
            <p>{t('saveExplainerText', 'Clicking the Save button saves your Exemption schema to the database.')}</p>
          </ModalBody>
          <ModalFooter>
            <Button kind="secondary" onClick={closeModal}>
              {t('close', 'Close')}
            </Button>
            <Button disabled={isSavingSchema} className={styles.spinner} type="submit" kind="primary">
              {isSavingSchema ? (
                <InlineLoading description={`${t('saving', 'Saving')}...`} />
              ) : (
                <span>{t('save', 'Save')}</span>
              )}
            </Button>
          </ModalFooter>
        </Form>
      </ComposedModal>

      <Button disabled={!schema} kind="primary" onClick={openModal}>
        {t('saveSchema', 'Save Exemption Schema')}
      </Button>
    </>
  );
};

export default SaveSchemaModal;
