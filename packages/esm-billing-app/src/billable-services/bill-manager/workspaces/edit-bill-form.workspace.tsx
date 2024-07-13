import React, { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonSet, Form, TextInput } from '@carbon/react';
import { type DefaultWorkspaceProps } from '@openmrs/esm-framework';
import styles from './edit-bill-form.scss';

export const EditBillForm: React.FC<DefaultWorkspaceProps> = ({
  closeWorkspace,
  promptBeforeClosing,
}: DefaultWorkspaceProps) => {
  const { t } = useTranslation();
  const [textValue, setTextValue] = useState('');

  useEffect(() => {
    promptBeforeClosing(() => textValue.length > 0);
  }, [promptBeforeClosing, textValue]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  return (
    <Form className={styles.form}>
      <TextInput
        id="howsThePlumbing"
        labelText={t('howsThePlumbing', "How's the plumbing?")}
        onChange={(event) => setTextValue(event.target.value)}
        value={textValue}
      />
      <ButtonSet>
        <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
          {t('discard', 'Discard')}
        </Button>
        <Button onClick={handleSubmit} className={styles.button} kind="primary">
          {t('submit', 'Submit')}
        </Button>
      </ButtonSet>
    </Form>
  );
};
