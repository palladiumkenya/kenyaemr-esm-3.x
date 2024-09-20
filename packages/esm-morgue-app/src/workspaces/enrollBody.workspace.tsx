import {
  Button,
  ButtonSet,
  Column,
  ComboBox,
  DatePicker,
  DatePickerInput,
  Form,
  Accordion,
  Stack,
  TextInput,
  AccordionItem,
  TimePicker,
  TimePickerSelect,
  SelectItem,
} from '@carbon/react';
import { useLayoutType } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './enrollBody.scss';
interface ProvideModalProps {
  closeWorkspace: () => void;
}
const ProviderForm: React.FC<ProvideModalProps> = ({ closeWorkspace }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();

  return (
    <Form onSubmit={''} className={styles.form__container}>
      <Stack gap={4} className={styles.form__grid}>
        <span className={styles.form__header__section}>
          {t('healthWorkVerify', 'Health worker registry verification')}
        </span>
        <>
          <Column>
            <ComboBox
              id="form__identifier__type"
              titleText={t('identificationType', 'Identification Type')}
              placeholder={t('chooseIdentifierType', 'Choose identifier type')}
              initialSelectedItem={''}
              items={''}
              itemToString={(item) => (item ? item.display : '')}
            />
          </Column>
        </>
        <span className={styles.form__subheader__section}>{t('personinfo', 'Person info')}</span>
        <Column>
          <TextInput placeholder="surname" id="form__surname" labelText={t('surname', 'Surname*')} />
        </Column>
        <Column>
          <TextInput id="form__firstname" placeholder="firstname" labelText={t('firstname', 'First name*')} />
        </Column>
        <Column>
          <TextInput id="form__national__id" placeholder="National ID" labelText={t('nationalID', 'National ID*')} />
        </Column>
        <Column>
          <TextInput
            placeholder="license number"
            id="form__license_number"
            labelText={t('licenseNumber', 'License number*')}
          />
        </Column>
        <Column>
          <span className={styles.form__gender}>{t('selectDateAndTime', 'Select date and time of death*')}</span>
          <Accordion>
            <AccordionItem title={t('dateAndTimeSelection', 'Date and time')}>
              <DatePicker datePickerType="single" className={styles.form__date__picker}>
                <DatePickerInput
                  className={styles.form__date__picker}
                  placeholder="mm/dd/yyyy"
                  labelText="License expiry date*"
                  id="form__license_date_picker"
                  size="md"
                />
              </DatePicker>
              <TimePicker id="time-picker" labelText="Select a time" className={styles.formTimeSelector}>
                <TimePickerSelect id="time-picker-select-1">
                  <SelectItem value="AM" text="AM" />
                  <SelectItem value="PM" text="PM" />
                </TimePickerSelect>
              </TimePicker>
            </AccordionItem>
          </Accordion>
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
      <ButtonSet className={styles.form__button_set}>
        <Button className={styles.form__button} size="sm" kind="secondary" onClick={closeWorkspace}>
          {t('discard', 'Discard')}
        </Button>
        <Button className={styles.form__button} kind="primary" size="sm" type="submit">
          {t('submit', 'Submit')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default ProviderForm;
