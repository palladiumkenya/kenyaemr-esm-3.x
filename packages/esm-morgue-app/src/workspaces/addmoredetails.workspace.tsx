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
  FormItem,
  FileUploaderDropContainer,
} from '@carbon/react';
import { useLayoutType } from '@openmrs/esm-framework';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './addmoredetails.scss';

interface ProvideModalProps {
  closeWorkspace: () => void;
}

const MorgueEnrollForm: React.FC<ProvideModalProps> = ({ closeWorkspace }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();

  const [isPoliceCase, setIsPoliceCase] = useState<string | null>(null);
  const [selectedCompartment, setSelectedCompartment] = useState(null);
  const handlePoliceCaseChange = (selectedItem: string | null) => {
    setIsPoliceCase(selectedItem);
  };
  const handleCompartmentChange = (selectedItem: string) => {
    setSelectedCompartment(selectedItem);
  };

  return (
    <Form onSubmit={''} className={styles.formContainer}>
      <Stack gap={4} className={styles.formGrid}>
        <span className={styles.formSubHeader}>{t('moreDetails', 'More Details')}</span>
        <Column>
          <DatePicker datePickerType="single" className={styles.formAdmissionDatepicker}>
            <DatePickerInput placeholder="mm/dd/yyyy" labelText="Date of admission" id="date-of-admission" />
          </DatePicker>
        </Column>
        <Column>
          <TimePicker
            id="time-picker"
            className={styles.formDeathTimepicker}
            labelText={t('timeDeath', 'Time of death*')}>
            <TimePickerSelect id="time-picker-select-1">
              <SelectItem value="AM" text="AM" />
              <SelectItem value="PM" text="PM" />
            </TimePickerSelect>
          </TimePicker>
        </Column>
        <Column>
          <TextInput id="tagNumber" placeholder="Tag Number" labelText={t('tagNumber', 'Tag Number*')} />
        </Column>
        <Column>
          <ComboBox
            onChange={(e) => handlePoliceCaseChange(e.selectedItem)}
            id="morgue-combobox"
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
            <Column>
              <p className="cds--file--label">Upload files</p>
              <p className="cds--label-description">
                "Max file size is 500mb. Only .jpg, .png, and .pdf files are supported."
              </p>
              <FileUploaderDropContainer
                labelText="Drag and drop files here or click to upload"
                multiple={true}
                accept={['image/jpeg', 'image/png', 'application/pdf']}
                disabled={false}
                name=""
                tabIndex={0}
                className={styles.fileUploader}
              />
            </Column>
          </>
        )}
        <Column>
          <ComboBox
            id="avail-compartment"
            items={['empty-compartment-1', 'empty-compartment-2']}
            itemToString={(item) => (item ? item : '')}
            titleText="Available Compartment"
            onChange={(e) => handleCompartmentChange(e.selectedItem)}
          />
        </Column>
      </Stack>
      <ButtonSet className={styles.formButtonSet}>
        <Button className={styles.buttonButton} size="lg" kind="secondary" onClick={closeWorkspace}>
          {t('discard', 'Discard')}
        </Button>
        <Button className={styles.buttonButton} kind="primary" size="lg" type="submit">
          {t('admit', 'Admit')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default MorgueEnrollForm;
