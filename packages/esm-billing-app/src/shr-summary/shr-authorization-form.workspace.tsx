import { Button, ButtonSet, Column, Form, Stack, TextInput } from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { DefaultWorkspaceProps } from '@openmrs/esm-framework';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import styles from './shr-forms.scss';
import { authorizationSchema } from './shr-summary.resource';

interface SHRAuthorizationFormProps extends DefaultWorkspaceProps {
  patientUuid: string;
  props: any;
}

type SHRAuthorizationFormType = z.infer<typeof authorizationSchema>;

const SHRAuthorizationForm: React.FC<SHRAuthorizationFormProps> = ({ closeWorkspace }) => {
  const form = useForm<SHRAuthorizationFormType>({
    defaultValues: {},
    resolver: zodResolver(authorizationSchema),
  });
  const { t } = useTranslation();

  const onSubmit = async (values: SHRAuthorizationFormType) => {};

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
