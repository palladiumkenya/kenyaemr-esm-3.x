import {
  Button,
  ButtonSet,
  Column,
  DatePicker,
  DatePickerInput,
  Layer,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TextInput,
} from '@carbon/react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const BirthDateCalculator = ({ onClose, props: { date } }) => {
  const { t } = useTranslation();
  const [fromDate, setFromDate] = useState<Date>(date ?? new Date());
  const [formState, setFormState] = useState({
    fromDate: date ?? new Date(),
    age: '',
  });

  return (
    <React.Fragment>
      <ModalHeader closeModal={onClose}>{t('calculateBirthDate', 'Calculate birth date')}</ModalHeader>
      <ModalBody>
        <Column>
          <Layer>
            <TextInput
              placeholder="age"
              labelText={t('age', 'Age')}
              type="number"
              min={5}
              value={formState.age}
              onChange={(e) => setFormState({ ...formState, age: e.target.value })}
            />
          </Layer>
        </Column>
        <Column>
          <Layer>
            <DatePicker
              datePickerType="single"
              value={formState.fromDate}
              onChange={(e) => setFormState({ ...formState, fromDate: e.target.value })}>
              <DatePickerInput placeholder="mm/dd/yyyy" labelText={t('fromDate', 'From Date')} size="xl" />
            </DatePicker>
          </Layer>
        </Column>
      </ModalBody>
      <ModalFooter>
        <ButtonSet>
          <Button kind="primary">Submit</Button>
          <Button kind="secondary" onClick={onClose}>
            Cancel
          </Button>
        </ButtonSet>
      </ModalFooter>
    </React.Fragment>
  );
};

export default BirthDateCalculator;
