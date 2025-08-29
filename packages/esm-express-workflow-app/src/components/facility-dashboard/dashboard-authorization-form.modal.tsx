import {
  Button,
  ButtonSet,
  Form,
  InlineLoading,
  ModalBody,
  ModalFooter,
  ModalHeader,
  PasswordInput,
  TextInput,
} from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { refetchCurrentUser, showSnackbar, useConfig, useSession } from '@openmrs/esm-framework';
import React, { FC } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ExpressWorkflowConfig } from '../../config-schema';
import {
  authorizeDashboard,
  DashboardAuthorizationForm,
  DashboardAuthorizationFormSchema,
  getToken,
} from './dashboard.resources';
import styles from './dashboard.scss';

type DashboardAuthorizationFormProps = {
  onClose?: () => void;
  onAuthorizationSuccess?: () => void;
};
const DashboardAuthorizationForm: FC<DashboardAuthorizationFormProps> = ({ onClose, onAuthorizationSuccess }) => {
  const { t } = useTranslation();
  const { supersetDashboardConfig } = useConfig<ExpressWorkflowConfig>();
  const { user } = useSession();
  const form = useForm<DashboardAuthorizationForm>({
    resolver: zodResolver(DashboardAuthorizationFormSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });
  const onSubmit: SubmitHandler<DashboardAuthorizationForm> = async ({ password, username }) => {
    try {
      const token = await getToken(username, password, supersetDashboardConfig);
      if (token) {
        await authorizeDashboard(user, { username, password });
        showSnackbar({
          subtitle: t('authorizationSuccess', 'Authorization succesfull'),
          title: t('success', 'Success'),
          kind: 'success',
        });
        onClose?.();
      } else {
        showSnackbar({
          subtitle: t('invalidCredentials', 'Invalid Credentials'),
          title: t('error', 'Error'),
          kind: 'error',
        });
      }
    } catch (error) {
      showSnackbar({
        subtitle: error?.message,
        title: t('error', 'Error'),
        kind: 'error',
      });
    }
  };
  return (
    <Form onSubmit={form.handleSubmit(onSubmit)}>
      <ModalHeader className={styles.sectionHeader} closeModal={onClose}>
        {t('dashboardAuthorization', 'Dashboard Authorization')}
      </ModalHeader>
      <ModalBody className={styles.form}>
        <Controller
          control={form.control}
          name="username"
          render={({ field, fieldState }) => (
            <TextInput
              {...field}
              id={'username'}
              labelText={t('usename', 'Username')}
              invalid={Boolean(fieldState?.error)}
              invalidText={fieldState?.error?.message}
            />
          )}
        />
        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <PasswordInput
              {...field}
              id={'password'}
              labelText={t('password', 'Password')}
              invalid={Boolean(fieldState?.error)}
              invalidText={fieldState?.error?.message}
            />
          )}
        />
      </ModalBody>
      <ModalFooter>
        <ButtonSet className={styles.buttonSet}>
          <Button kind="secondary" onClick={onClose} className={styles.button}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button disabled={form.formState.isSubmitting} kind="primary" type="submit" className={styles.button}>
            {form.formState.isSubmitting ? (
              <InlineLoading description={t('authorizing', 'Authorizing ...')} />
            ) : (
              t('authorize', 'Authorize')
            )}
          </Button>
        </ButtonSet>
      </ModalFooter>
    </Form>
  );
};

export default DashboardAuthorizationForm;
