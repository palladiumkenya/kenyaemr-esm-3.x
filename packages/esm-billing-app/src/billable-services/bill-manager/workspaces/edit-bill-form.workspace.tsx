import React, { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonSet, Form, TextInput } from '@carbon/react';
import styles from './waive-bill-form.scss';
import { LineItem, MappedBill } from '../../../types';

export const EditBillForm: React.FC<{ lineItem: LineItem }> = ({ lineItem }) => {
  const { t } = useTranslation();

  // eslint-disable-next-line no-console
  console.log(lineItem);

  return (
    <Form className={styles.form}>
      <TextInput id="howsThePlumbing" labelText={t('howsThePlumbing', "How's the plumbing?")} />
      <ButtonSet>
        <Button className={styles.button} kind="secondary">
          {t('discard', 'Discard')}
        </Button>
        <Button className={styles.button} kind="primary">
          {t('submit', 'Submit')}
        </Button>
      </ButtonSet>
    </Form>
  );
};
