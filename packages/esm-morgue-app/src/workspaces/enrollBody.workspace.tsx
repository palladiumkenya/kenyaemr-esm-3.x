import {
  Button,
  ButtonSet,
  ComboBox,
  Column,
  RadioButtonGroup,
  DatePicker,
  DatePickerInput,
  Form,
  TextArea,
  Stack,
  TextInput,
  Row,
  TimePicker,
  TimePickerSelect,
  SelectItem,
  RadioButton,
} from '@carbon/react';
import { useLayoutType } from '@openmrs/esm-framework';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './enrollBody.scss';
import CauseOfDeath from './common/causeOfdeath.component';

interface ProvideModalProps {
  closeWorkspace: () => void;
}

const ProviderForm: React.FC<ProvideModalProps> = ({ closeWorkspace }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();

  const [isPoliceCase, setIsPoliceCase] = useState<string | null>(null);

  const handlePoliceCaseChange = (selectedItem: string | null) => {
    setIsPoliceCase(selectedItem);
  };

  return (
    <Form onSubmit={''} className={styles.formContainer}>
      <Stack gap={4} className={styles.formGrid}>
        <span className={styles.formSubHeader}>{t('Decease', 'Deceased')}</span>
        <Column>
          <TextInput placeholder="surname" id="form__surname" labelText={t('surname', 'Surname*')} />
        </Column>
        <Column>
          <TextInput id="formFirstname" placeholder="firstname" labelText={t('firstname', 'First name*')} />
        </Column>
        <Column>
          <RadioButtonGroup legendText="Select gender*" name="genderGroup">
            <RadioButton labelText="Male" value="radio-1" id="male" />
            <RadioButton labelText="Female" value="radio-2" id="female" />
          </RadioButtonGroup>
        </Column>
        <Column>
          <DatePicker datePickerType="single" className={styles.formAdmissionDatepicker}>
            <DatePickerInput
              className={styles.form__date__picker}
              placeholder="mm/dd/yyyy"
              labelText="Date of  birth*"
              id="formDoB"
              size="md"
            />
          </DatePicker>
        </Column>
        <Column>
          <TextInput id="residence" placeholder="Residence address" labelText={t('residenceAddress', 'Residence*')} />
        </Column>
        <span className={styles.formSubHeader}>{t('MoreInfo', 'More info')}</span>
        <Column>
          <DatePicker datePickerType="single" className={styles.formAdmissionDatepicker}>
            <DatePickerInput
              className={styles.m}
              placeholder="mm/dd/yyyy"
              labelText="Date of  admission*"
              id="formAdmissionDate"
              size="md"
            />
          </DatePicker>
        </Column>
        <Column>
          <ComboBox
            onChange={(e) => handlePoliceCaseChange(e.selectedItem)}
            id="carbon-combobox"
            items={['Yes', 'No']}
            itemToString={(item) => (item ? item : '')}
            titleText="Is the body associated with a police case? If so, can you provide the OB number?*"
          />
        </Column>

        {isPoliceCase === 'Yes' && (
          <>
            <Column>
              <TextInput id="obNumber" placeholder="OB Number" labelText={t('obNumber', 'OB Number*')} />
            </Column>
            <Column>
              <TextArea labelText="Police's report" rows={4} id="text-area-1" />
            </Column>
          </>
        )}

        <CauseOfDeath />
        <Column>
          <Row>
            <DatePicker datePickerType="single" className={styles.form__date__picker}>
              <DatePickerInput
                className={styles.formDatepicker}
                placeholder="mm/dd/yyyy"
                labelText={t('DateAndTime', 'Date and Time of death*')}
                id="form__license_date_picker"
                size="md"
              />
            </DatePicker>
            <TimePicker id="time-picker" className={styles.formTimeSelector}>
              <TimePickerSelect id="time-picker-select-1">
                <SelectItem value="AM" text="AM" />
                <SelectItem value="PM" text="PM" />
              </TimePickerSelect>
            </TimePicker>
          </Row>
        </Column>

        <Column>
          <DatePicker datePickerType="single" className={styles.form__date__picker}>
            <DatePickerInput
              className={styles.form__date__picker}
              placeholder="mm/dd/yyyy"
              labelText="License expiry date*"
              id="form__license_date_picker"
              size="md"
            />
          </DatePicker>
        </Column>

        <Column>
          <TextInput placeholder="Username" id="form__username" labelText={t('username', 'Username*')} />
        </Column>
      </Stack>
      {/* <ButtonSet className={styles.formButtonSet}>
        <Button className={styles.buttonButton} size="sm" kind="secondary" onClick={closeWorkspace}>
          {t('discard', 'Discard')}
        </Button>
        <Button className={styles.buttonButton} kind="primary" size="sm" type="submit">
          {t('submit', 'Submit')}
        </Button>
      </ButtonSet> */}
    </Form>
  );
};

export default ProviderForm;
