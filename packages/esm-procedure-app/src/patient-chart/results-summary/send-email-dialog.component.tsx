import { Button, Form, ModalBody, ModalFooter, ModalHeader, TextInput, InlineLoading } from '@carbon/react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePatient } from '@openmrs/esm-framework';
import styles from './results-summary.scss';

interface SendEmailDialogProps {
  patientUuid: string;
  closeModal: () => void;
  sendEmail: () => Promise<void>;
}

const SendEmailDialog: React.FC<SendEmailDialogProps> = ({ patientUuid, closeModal, sendEmail }) => {
  const { t } = useTranslation();

  const [email, setEmail] = useState();

  const { patient, isLoading } = usePatient(patientUuid);

  return (
    <>
      <Form onSubmit={sendEmail}>
        <ModalHeader closeModal={closeModal} title={t('sendResults', 'Send Results')} />
        <ModalBody>
          {isLoading && (
            <InlineLoading
              className={styles.bannerLoading}
              iconDescription="Loading"
              description="Loading banner"
              status="active"
            />
          )}
          {patient?.address ? (
            <div>
              <TextInput
                id="text-input-email"
                invalidText="Error message goes here"
                labelText="Email"
                onChange={(e) => setEmail(e.target.value)}
                size="md"
                type="email"
              />
            </div>
          ) : (
            "Patient doesn't have an email address"
          )}
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={closeModal}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button type="submit">{t('sendEmail', 'Send Email')}</Button>
        </ModalFooter>
      </Form>
    </>
  );
};

export default SendEmailDialog;
