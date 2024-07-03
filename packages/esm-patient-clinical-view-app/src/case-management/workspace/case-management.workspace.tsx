import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Column,
  TextArea,
  Form,
  Layer,
  Stack,
  TextInput,
  FilterableMultiSelect,
  ButtonSet,
  ComboBox,
  Button,
  MultiSelect,
  DatePicker,
  DatePickerInput,
  Search,
} from '@carbon/react';
import styles from './case-management.scss';
import { useSession } from '@openmrs/esm-framework';
import { useCaseManagers, useRelationshipType } from './case-management.resource';
import { extractNameString } from '../../utils/expression-helper';

const CaseManagementForm: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useSession();
  const caseManagerDefault = user?.person?.display;
  const { data, error } = useCaseManagers();
  const { data: relationshipTypesData } = useRelationshipType();

  const caseManagers =
    data?.data.results.map((manager) => ({
      id: manager.uuid,
      text: manager.display,
    })) || [];

  const caseManagerRlshipType =
    relationshipTypesData?.data.results.map((relationship) => ({
      id: relationship.uuid,
      text: relationship.display,
    })) || [];
  console.log(caseManagerRlshipType);

  const [selectedCaseManager, setSelectedCaseManager] = useState('');

  const onSubmit = async (data) => {
    // console.log('Selected Case Manager:', selectedCaseManager);
    // Handle form submission
  };

  return (
    <Form className={styles.form} onSubmit={onSubmit}>
      <span className={styles.caseFormTitle}>{t('formTitle', 'Fill in the form details')}</span>
      <Stack gap={4} className={styles.grid}>
        <span className={styles.sectionHeader}>Demographics</span>

        <Column>
          <ComboBox
            id="case_manager_name"
            titleText={t('manager', 'Case Manager')}
            items={caseManagers}
            itemToString={(item) => extractNameString(item ? item.text : '')}
            onChange={({ selectedItems }) => setSelectedCaseManager(selectedItems)}
          />
        </Column>
        <span className={styles.sectionHeader}>Relationship Info</span>
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
        <Column>
          <ComboBox
            id="relationship_name"
            titleText={t('relationship', 'Relationship')}
            items={caseManagerRlshipType}
            itemToString={(item) => (item ? item.text : '')}
            onChange={({ selectedItems }) => setSelectedCaseManager(selectedItems)}
          />
        </Column>
        <Column>
          <DatePicker datePickerType="single">
            <DatePickerInput
              placeholder="mm/dd/yyyy"
              labelText="Start Date"
              id="case-start-date-picker"
              size="md"
              className={styles.datePickerInput}
            />
          </DatePicker>
        </Column>
        <Column>
          <DatePicker datePickerType="single">
            <DatePickerInput
              placeholder="mm/dd/yyyy"
              labelText="End Date"
              id="case-end-date-picker"
              size="md"
              className={styles.component}
            />
          </DatePicker>
        </Column>
        <Column>
          <MultiSelect
            id="reasons"
            titleText={t('reasons', 'Reason for Assignment')}
            items={caseManagers}
            itemToString={(item) => (item ? item.text : '')}
          />{' '}
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
          {t('save', 'Save and discard')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default CaseManagementForm;
