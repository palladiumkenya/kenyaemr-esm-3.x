import { Button, ButtonSet, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';

const BirthDateCalculator = ({ onClose, props: { date } }) => {
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <ModalHeader closeModal={onClose}>{t('calculateBirthDate', 'Calculate birth date')}</ModalHeader>
      <ModalBody>{`${date}`}</ModalBody>
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
