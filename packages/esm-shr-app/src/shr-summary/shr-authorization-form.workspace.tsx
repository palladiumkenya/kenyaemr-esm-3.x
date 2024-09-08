import { Button, ButtonSet, Column, Form, RadioButton, RadioButtonGroup, Row, Stack, TextInput } from '@carbon/react';
import { FingerprintRecognition } from '@carbon/react/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { DefaultWorkspaceProps, showSnackbar } from '@openmrs/esm-framework';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import styles from './shr-forms.scss';
import { authorizationSchema, generateOTP, persistOTP, sendOtp, verifyOtp } from './shr-summary.resource';
import { AUTH_TYPES } from '../constants';

interface SHRAuthorizationFormProps extends DefaultWorkspaceProps {
  patientUuid: string;
  patientPhoneNumber: string;
  patientName: string;
  props: any;
  onVerified: () => void;
}

type SHRAuthorizationFormType = z.infer<typeof authorizationSchema>;

const SHRAuthorizationForm: React.FC<SHRAuthorizationFormProps> = ({
  closeWorkspace,
  patientUuid,
  onVerified,
  patientName,
  patientPhoneNumber,
}) => {
  const form = useForm<SHRAuthorizationFormType>({
    defaultValues: {
      receiver: patientPhoneNumber,
      authMethod: 'otp',
    },
    resolver: zodResolver(authorizationSchema),
  });
  const { t } = useTranslation();
  const [loadingState, setLoadingState] = useState({ isLoading: false, isSuccess: false });

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

  const handleGetOTP = async () => {
    setLoadingState((st) => ({ ...st, isLoading: true, isSuccess: false }));
    const otp = generateOTP(5);
    sendOtp({ otp, receiver: form.watch('receiver') }, patientName);
    persistOTP(otp, patientUuid);
    setLoadingState((st) => ({ ...st, isLoading: false, isSuccess: true }));
  };
  const observableAuthMethod = form.watch('authMethod');

  return (
    <Form onSubmit={form.handleSubmit(onSubmit)}>
      <Stack gap={4} className={styles.grid}>
        <Column>
          <Controller
            control={form.control}
            name="authMethod"
            render={({ field }) => (
              <RadioButtonGroup
                legendText={t('authMethod', 'Authorization Method')}
                {...field}
                invalid={form.formState.errors[field.name]?.message}
                className={styles.radioGroupInput}
                invalidText={form.formState.errors[field.name]?.message}>
                {AUTH_TYPES.map(({ label, value }, index) => (
                  <RadioButton labelText={label} value={value} id={`${index}-${value}`} key={index} />
                ))}
              </RadioButtonGroup>
            )}
          />
        </Column>
        {observableAuthMethod === 'otp' && (
          <Column>
            <Controller
              control={form.control}
              name="receiver"
              render={({ field }) => (
                <TextInput
                  invalid={form.formState.errors[field.name]?.message}
                  invalidText={form.formState.errors[field.name]?.message}
                  {...field}
                  placeholder={t('patientPhoneNUmber', 'Patient Phone number')}
                  labelText={t('patientPhoneNUmber', 'Patient Phone number')}
                />
              )}
            />
          </Column>
        )}
        {['otp', 'pin'].includes(observableAuthMethod) ? (
          <Column>
            <Controller
              control={form.control}
              name="otp"
              render={({ field }) => (
                <Row className={styles.otpInputRow}>
                  <TextInput
                    invalid={form.formState.errors[field.name]?.message}
                    invalidText={form.formState.errors[field.name]?.message}
                    {...field}
                    placeholder={
                      AUTH_TYPES.find((auth) => auth.value === observableAuthMethod)?.label ?? 'OTP Authorization code'
                    }
                    labelText={
                      AUTH_TYPES.find((auth) => auth.value === observableAuthMethod)?.label ?? 'OTP Authorization code'
                    }
                  />
                  {observableAuthMethod === 'otp' && (
                    <Button
                      kind="tertiary"
                      onClick={handleGetOTP}
                      disabled={loadingState.isLoading || loadingState.isSuccess}>
                      Verify with OTP
                    </Button>
                  )}
                </Row>
              )}
            />
          </Column>
        ) : (
          <div className={styles.biometricContainer}>
            <FingerprintRecognition size={40} />
            <p>Scan you finger</p>
          </div>
        )}
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
