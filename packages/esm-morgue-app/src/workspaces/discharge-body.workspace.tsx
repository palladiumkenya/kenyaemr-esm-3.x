import {
  Button,
  ButtonSet,
  DatePicker,
  DatePickerInput,
  Form,
  Stack,
  TimePicker,
  TimePickerSelect,
  SelectItem,
} from '@carbon/react';
import { ExtensionSlot, ResponsiveWrapper, useLayoutType } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './discharge-body.scss';
import DeceasedInfo from '../component/deceasedInfo/deceased-info.component';

interface PatientAdditionalInfoFormProps {
  closeWorkspace: () => void;
  patientUuid: string;
}

const PatientAdditionalInfoForm: React.FC<PatientAdditionalInfoFormProps> = ({ closeWorkspace, patientUuid }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();

  return (
    <Form className={styles.formContainer}>
      <Stack gap={4} className={styles.formGrid}>
        <DeceasedInfo patientUuid={patientUuid} />
        <div className={styles.dateTimeSection}>
          <DatePicker
            datePickerType="single"
            style={{ paddingBottom: '1rem', marginLeft: '1rem' }}
            id="visitDate"
            maxDate={new Date().toISOString()}>
            <DatePickerInput
              labelText={t('dateDischarge', 'Date of Discharge')}
              id="visitEndDateInput"
              placeholder="mm/dd/yyyy"
              style={{ width: '100%' }}
            />
          </DatePicker>
          <ResponsiveWrapper>
            <TimePicker
              id="visitEndTime"
              labelText={t('timeDischarge', 'Time of Discharge')}
              pattern="^(1[0-2]|0?[1-9]):([0-5]?[0-9])$"
              style={{ marginLeft: '0.125rem', flex: 'none' }}
              className={styles.timePicker}>
              <TimePickerSelect id="visitStartTimeSelect" labelText={t('time', 'Time')} aria-label={t('time', 'Time')}>
                <SelectItem value="AM" text="AM" />
                <SelectItem value="PM" text="PM" />
              </TimePickerSelect>
            </TimePicker>
          </ResponsiveWrapper>
        </div>
        <ButtonSet className={styles.buttonSet}>
          <Button style={{ maxWidth: '57%' }} size="lg" kind="secondary" onClick={closeWorkspace}>
            {t('discard', 'Discard')}
          </Button>
          <Button style={{ maxWidth: '57%' }} kind="primary" size="lg" type="submit">
            {t('admit', 'Admit')}
          </Button>
        </ButtonSet>
      </Stack>
    </Form>
  );
};

export default PatientAdditionalInfoForm;
