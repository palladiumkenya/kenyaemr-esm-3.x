import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';

interface OperationConfirmationModalProps {
  close: () => void;
  confirm: () => void;
  operationName: string;
  operationType: string;
}

const OperationConfirmation: React.FC<OperationConfirmationModalProps> = ({
  close,
  confirm,
  operationName,
  operationType,
}) => {
  const { t } = useTranslation();
  const message = t('operationsConfirmationMessages', 'Do you want to {{operationTypeOrName}}?', {
    operationTypeOrName: operationType || operationName,
  });

  return (
    <>
      <div className="cds--modal-header">
        <h3 className="cds--modal-header__heading">{t('confirmation', 'Confirmation')}</h3>
      </div>
      <div className="cds--modal-content">
        <p>{message}</p>
      </div>
      <div className="cds--modal-footer">
        <Button kind="secondary" onClick={close}>
          {t('noRespond', 'No')}
        </Button>
        <Button kind="primary" onClick={confirm}>
          {t('yesRespond', 'Yes')}
        </Button>
      </div>
    </>
  );
};

export default OperationConfirmation;
