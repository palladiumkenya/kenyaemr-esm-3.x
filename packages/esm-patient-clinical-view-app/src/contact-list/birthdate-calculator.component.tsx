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

const BirthDateCalculator = ({ onClose, props: { date, onBirthDateChange } }) => {
  const { t } = useTranslation();
  const [formState, setFormState] = useState<{ fromDate: Date; age: number | undefined }>({
    fromDate: date ?? new Date(),
    age: undefined,
  });

  const handleSubmit = () => {
    const { fromDate, age } = formState;

    // Create a new date object to avoid mutating state directly
    const dob = new Date(fromDate);

    // Subtract the age from the current year
    dob.setFullYear(dob.getFullYear() - age);

    // Update the state and close the modal
    onBirthDateChange(dob);
    onClose();
  };

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
              onChange={([date]) => setFormState({ ...formState, fromDate: date })}>
              <DatePickerInput placeholder="mm/dd/yyyy" labelText={t('onDate', 'On Date')} size="xl" />
            </DatePicker>
          </Layer>
        </Column>
      </ModalBody>
      <ModalFooter>
        <ButtonSet>
          <Button kind="primary" onClick={handleSubmit} disabled={!formState.age || !formState.fromDate}>
            Submit
          </Button>
          <Button kind="secondary" onClick={onClose}>
            Cancel
          </Button>
        </ButtonSet>
      </ModalFooter>
    </React.Fragment>
  );
};

export default BirthDateCalculator;
