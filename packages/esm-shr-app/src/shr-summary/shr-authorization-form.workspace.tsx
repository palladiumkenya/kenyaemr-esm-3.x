import { Button, ButtonSet, Column, Form, Stack, TextInput } from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { DefaultWorkspaceProps, showSnackbar } from '@openmrs/esm-framework';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import styles from './shr-forms.scss';
import { authorizationSchema, generateOTP, persistOTP, sendOtp, verifyOtp } from './shr-summary.resource';

interface SHRAuthorizationFormProps extends DefaultWorkspaceProps {
  patientUuid: string;
  props: any;
  onVerified: () => void;
}

type SHRAuthorizationFormType = z.infer<typeof authorizationSchema>;

const SHRAuthorizationForm: React.FC<SHRAuthorizationFormProps> = ({ closeWorkspace, patientUuid, onVerified }) => {
  const form = useForm<SHRAuthorizationFormType>({
    defaultValues: {
      sender: '+254793889658',
      receiver: '+254793889658',
    },
    resolver: zodResolver(authorizationSchema),
  });
  const { t } = useTranslation();

  const onSubmit = async (values: SHRAuthorizationFormType) => {
    try {
      verifyOtp(values.otp, patientUuid);
      showSnackbar({ title: 'Success', kind: 'success', subtitle: 'Access granted successfully' });
      closeWorkspace();
      onVerified();
    } catch (error) {
      showSnackbar({ title: 'Faulure', kind: 'error', subtitle: `${error}` });
    }
  };

  useEffect(() => {
    const otp = generateOTP(5);
    alert('OTP SEND TO CLIENT: ' + otp);
    // sendOtp({ otp, receiver: form.watch('receiver'), sender: form.watch('sender') });
    persistOTP(otp, patientUuid);
  }, []);

  return (
    <Form onSubmit={form.handleSubmit(onSubmit)}>
      <span className={styles.formTitle}>{t('formTitle', 'Fill in the form details')}</span>
      <Stack gap={4} className={styles.grid}>
        <Column>
          <Controller
            control={form.control}
            name="otp"
            render={({ field }) => (
              <TextInput
                invalid={form.formState.errors[field.name]?.message}
                invalidText={form.formState.errors[field.name]?.message}
                {...field}
                placeholder="OTP authorization code"
                labelText={t('otpCode', 'OTP Card')}
              />
            )}
          />
        </Column>
      </Stack>

      <ButtonSet className={styles.buttonSet}>
        <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
          {t('discard', 'Discard')}
        </Button>
        <Button className={styles.button} kind="primary" type="submit" disabled={form.formState.isSubmitting}>
          {t('submit', 'Submit')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default SHRAuthorizationForm;
