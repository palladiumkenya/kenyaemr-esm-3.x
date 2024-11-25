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
  Column,
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
        <div className={styles.dateTimePickerContainer}>
          <Column>
            <DatePicker datePickerType="single" className={styles.formAdmissionDatepicker}>
              <DatePickerInput
                id="date-of-admission"
                placeholder="mm/dd/yyyy"
                labelText={t('dateOfAdmission', 'Date of admission*')}
              />
            </DatePicker>
          </Column>

          <Column>
            <div className={styles.dateTimeSection}>
              <ResponsiveWrapper>
                <TimePicker
                  id="time-of-death-picker"
                  labelText={t('timeofDischarge', 'Time of discharge*')}
                  className={styles.formAdmissionTimepicker}
                />
                <TimePickerSelect
                  className={styles.formDeathTimepickerSelector}
                  id="time-picker-select"
                  labelText={t('selectPeriod', 'AM/PM')}>
                  <SelectItem value="AM" text="AM" />
                  <SelectItem value="PM" text="PM" />
                </TimePickerSelect>
              </ResponsiveWrapper>
            </div>
          </Column>
        </div>

        <ButtonSet className={styles.buttonSet}>
          <Button size="lg" kind="secondary" onClick={closeWorkspace}>
            {t('discard', 'Discard')}
          </Button>
          <Button kind="primary" size="lg" type="submit">
            {t('admit', 'Admit')}
          </Button>
        </ButtonSet>
      </Stack>
    </Form>
  );
};

export default PatientAdditionalInfoForm;
