import React, { useState } from 'react';
import {
  ComposedModal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  TextInput,
  InlineNotification,
  Loading,
  Stack,
  Button,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { showToast, restBaseUrl } from '@openmrs/esm-framework';
import styles from './print-preview.scss';

interface EmailModalProps {
  encounter: {
    patientUuid: string;
    encounterUuid: string;
    patientName: string;
  };
  onEmailSent: () => void;
  onClose: () => void;
}

const ADREmailModal: React.FC<EmailModalProps> = ({ encounter, onEmailSent, onClose }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    if (value && !validateEmail(value)) {
      setEmailError(t('invalidEmail', 'Please enter a valid email address'));
    } else {
      setEmailError('');
    }
  };

  const handleSendEmail = async () => {
    if (!email || !validateEmail(email)) {
      setEmailError(t('invalidEmail', 'Please enter a valid email address'));
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const response = await fetch(`/openmrs/ws/rest/v1/kenyaemr/adpdf/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          patientUuid: encounter.patientUuid,
          encounterUuid: encounter.encounterUuid,
          patientName: encounter.patientName,
          recipientEmail: email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setError(
            t('reportAlreadySent', 'This report has already been sent. Each report can only be sent once per patient.'),
          );
        } else {
          setError(data.error || t('sendEmailError', 'Failed to send email'));
        }
        return;
      }

      showToast({
        title: t('emailSentSuccessfully', 'Email Sent Successfully'),
        description: t('reportSentTo', `ADR report has been sent to ${email}`),
        kind: 'success',
        critical: false,
      });

      onEmailSent();
    } catch (err) {
      console.error('Error sending email:', err);
      setError(t('networkError', 'Network error occurred. Please check your connection and try again.'));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div>
      <ModalHeader
        title={t('sendADRReport', 'Send ADR Report via Email')}
        label={encounter.patientName}
        closeModal={onClose}
      />

      <ModalBody>
        <Stack gap={6}>
          {error && (
            <InlineNotification kind="error" title={t('error', 'Error')} subtitle={error} lowContrast hideCloseButton />
          )}

          <TextInput
            id="recipient-email"
            labelText={t('recipientEmail', 'Recipient Email Address')}
            placeholder="example@hospital.org"
            value={email}
            onChange={handleEmailChange}
            invalid={!!emailError}
            invalidText={emailError}
            disabled={isSending}
            required
          />

          <InlineNotification
            kind="info"
            title={t('importantNote', 'Important Note')}
            subtitle={t(
              'oneTimeEmail',
              'This report can only be sent once per patient. Please ensure the email address is correct before sending.',
            )}
            lowContrast
            hideCloseButton
          />

          {isSending && <Loading description={t('sendingEmail', 'Sending email...')} withOverlay={false} />}
        </Stack>
      </ModalBody>

      <ModalFooter>
        <Button kind="secondary" onClick={onClose} disabled={isSending}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="primary" onClick={handleSendEmail} disabled={isSending || !email || !!emailError}>
          {t('sendEmail', 'Send Email')}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default ADREmailModal;
