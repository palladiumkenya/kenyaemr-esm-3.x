import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Column,
  TextArea,
  Form,
  Layer,
  Stack,
  TextInput,
  Row,
  ButtonSet,
  Button,
  FilterableMultiSelect,
  MultiSelect,
  DatePicker,
  DatePickerInput,
} from '@carbon/react';
import styles from './case-management.scss';
import { Controller } from 'react-hook-form';

const CaseManagementForm: React.FC = () => {
  const { t } = useTranslation();
  const onSubmit = async (data) => {};

  return (
    <Form className={styles.form}>
      <Stack gap={1} className={styles.grid}>
        <span className={styles.caseFormTitle}>{t('formTitle', 'Fill in the form details')}</span>
        <Column className={styles.formCaseColumn}>
          <Layer className={styles.input}>
            <TextInput id="provider_name" placeholder="Provider Name" labelText={t('provider', 'Provider Name')} />
          </Layer>
        </Column>
        <Row className={styles.formCaseRow}>
          <Column className={styles.formCaseColumn}>
            <Layer className={styles.input}>
              <DatePicker datePickerType="single">
                <DatePickerInput
                  placeholder="mm/dd/yyyy"
                  labelText="Start Date"
                  id="case-start-date-picker"
                  size="md"
                />
              </DatePicker>
            </Layer>
          </Column>
          <Column className={styles.formCaseColumn}>
            <Layer className={styles.input}>
              <DatePicker datePickerType="single">
                <DatePickerInput placeholder="mm/dd/yyyy" labelText="End Date" id="case-end-date-picker" size="md" />
              </DatePicker>{' '}
            </Layer>
          </Column>
        </Row>
        <Column>
          <Layer className={styles.input}>
            <MultiSelect id="reasons" titleText={t('reasons', 'Reason for Assignment')} />
          </Layer>
        </Column>
        <ButtonSet className={styles.buttonSet}>
          <Button className={styles.button} kind="secondary">
            {t('discardClaim', 'Discard Claim')}
          </Button>
          <Button className={styles.button} kind="primary" type="submit">
            {t('processClaim', 'Process Claim')}
          </Button>
        </ButtonSet>
      </Stack>
    </Form>
  );
};

export default CaseManagementForm;
