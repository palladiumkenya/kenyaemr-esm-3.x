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
  MultiSelect,
  DatePicker,
  DatePickerInput,
  Search,
} from '@carbon/react';
import styles from './case-management.scss';
import { useSession } from '@openmrs/esm-framework';

const CaseManagementForm: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useSession();
  const currentProvider = user?.person?.display;
  console.log(currentProvider);
  const onSubmit = async (data) => {};
  return (
    <Form>
      <span className={styles.caseFormTitle}>{t('formTitle', 'Fill in the form details')}</span>
      <Stack gap={4} className={styles.grid}>
        <span className={styles.sectionHeader}>Case Information</span>
        <Column>
          <Search
            size="lg"
            placeholder="Search for a case by name or identifier number"
            labelText="Search"
            closeButtonLabelText="Clear"
            id="case-search"
            onChange={() => {}}
            onKeyDown={() => {}}
          />
        </Column>
        <span className={styles.sectionHeader}>Case Manager Information</span>

        <Column>
          <TextInput
            id="case_manager_name"
            placeholder="Case Manager Name"
            labelText={t('manager', 'Case Manager Name')}
          />
        </Column>
        <span className={styles.sectionHeader}> More Information</span>
        <Row className={styles.datePickersRow}>
          <Column>
            <DatePicker datePickerType="single">
              <DatePickerInput placeholder="mm/dd/yyyy" labelText="Start Date" id="case-start-date-picker" size="md" />
            </DatePicker>
          </Column>
          <Column>
            <DatePicker datePickerType="single">
              <DatePickerInput placeholder="mm/dd/yyyy" labelText="End Date" id="case-end-date-picker" size="md" />
            </DatePicker>
          </Column>
        </Row>
        <Column>
          <MultiSelect id="reasons" titleText={t('reasons', 'Reason for Assignment')} />
        </Column>
        <Column className={styles.textbox}>
          <TextArea labelText="Any additional notes" rows={4} id="case-manager-notes" />
        </Column>
      </Stack>

      <ButtonSet className={styles.buttonSet}>
        <Button className={styles.button} kind="secondary">
          {t('discard', 'Discard')}
        </Button>
        <Button className={styles.button} kind="primary" type="submit">
          {t('submit', 'Submit')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default CaseManagementForm;
