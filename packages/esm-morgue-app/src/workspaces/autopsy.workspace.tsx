import {
  Button,
  ButtonSet,
  ComboBox,
  Column,
  DatePicker,
  DatePickerInput,
  Form,
  TextArea,
  Stack,
  TextInput,
  FileUploaderDropContainer,
  TimePicker,
  TimePickerSelect,
  SelectItem,
} from '@carbon/react';
import { useLayoutType } from '@openmrs/esm-framework';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './autopsy.scss';

interface AutopsyModalProps {
  closeWorkspace: () => void;
}

const AutopsyForm: React.FC<AutopsyModalProps> = ({ closeWorkspace }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();

  const [isPoliceCase, setIsPoliceCase] = useState<string | null>(null);
  const [open, setOpen] = React.useState(false);

  const handlePoliceCaseChange = (selectedItem: string | null) => {
    setIsPoliceCase(selectedItem);
  };

  return (
    <Form onSubmit={''} className={styles.formContainer}>
      <Stack gap={4} className={styles.formGrid}>
        <span className={styles.formSubHeader}>{t('autopsyEntry', 'Autopsy Entry')}</span>
        <Column>
          <TextInput placeholder="Reference number" id="refNo" labelText={t('referenceNo', 'Reference number *')} />
        </Column>
        <Column>
          <TextInput
            placeholder="Police station"
            id="policeStation"
            labelText={t('policeStation', 'Police station *')}
          />
        </Column>
        <Column>
          <TextInput
            placeholder="Officer in charge"
            id="OfficerInCharge"
            labelText={t('officerInCharge', 'Officer in charge *')}
          />
        </Column>
        <Column>
          <DatePicker datePickerType="single" className={styles.formAdmissionDatepicker}>
            <DatePickerInput
              className={styles.form__date__picker}
              placeholder="mm/dd/yyyy"
              labelText="Date of  autopsy*"
              id="formDateAutopsy"
              size="md"
            />
          </DatePicker>
        </Column>
        <Column>
          <TimePicker
            id="time-picker"
            className={styles.formDeathTimepicker}
            labelText={t('timeOfAutopsy', 'Time of Autopsy*')}>
            <TimePickerSelect id="time-picker-select-1">
              <SelectItem value="AM" text="AM" />
              <SelectItem value="PM" text="PM" />
            </TimePickerSelect>
          </TimePicker>
        </Column>
        <Column>
          <TextArea labelText={t('findings', 'Findings *')} rows={5} id="text-area-1" />
        </Column>
        <Column>
          <p className="cds--file--label">Upload files</p>
          <p className="cds--label-description">Only .jpg, .png, and .pdf files are supported.</p>
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
        <Column>
          <TextInput
            id="authorizedPersonnel"
            placeholder="authorized Personnel from hospital"
            labelText={t('authorizedPersonnel', 'Authorized personnel*')}
          />
        </Column>
        <Column>
          <TextInput
            id="licenseNumber"
            placeholder="License Number"
            labelText={t('licenseNumber', 'License Number*')}
          />
        </Column>
        <Column>
          <TextInput
            id="authorizedPersonnel"
            placeholder="authorized Personnel from police"
            labelText={t('authorizedPersonnel', 'Authorized personnel*')}
          />
        </Column>
        <Column>
          <TextInput
            id="serviceNumber"
            placeholder="Service Number"
            labelText={t('serviceNumber', 'Service Number*')}
          />
        </Column>
        <Column>
          <ComboBox
            onChange={(e) => handlePoliceCaseChange(e.selectedItem)}
            id="status-combobox"
            items={['PENDING', 'COMPLETED']}
            itemToString={(item) => (item ? item : '')}
            titleText="Status*"
          />
        </Column>
      </Stack>
      <ButtonSet className={styles.formButtonSet}>
        <Button className={styles.buttonButton} size="lg" kind="secondary" onClick={closeWorkspace}>
          {t('discard', 'Discard')}
        </Button>
        <Button className={styles.buttonButton} kind="primary" size="lg" type="submit">
          {t('save', 'Save')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default AutopsyForm;
