import React from 'react';
import { useTranslation } from 'react-i18next';
import { ModalHeader, ModalBody, ModalFooter, Button, InlineLoading } from '@carbon/react';
import styles from './require-payment.scss';
import { useBills } from '../billing.resource';
import { convertToCurrency } from '../helpers';

type RequirePaymentModalProps = {
  closeModal: () => void;
  patientUuid: string;
};

const RequirePaymentModal: React.FC<RequirePaymentModalProps> = ({ closeModal, patientUuid }) => {
  const { t } = useTranslation();
  const { bills, isLoading, error } = useBills(patientUuid);

  const lineItems = bills.filter((bill) => bill.status !== 'PAID').flatMap((bill) => bill.lineItems);
  return (
    <div>
      <ModalHeader closeModal={closeModal} title={t('billPaymentRequired', 'Bill Payment Required')} />
      <ModalBody>
        <p className={styles.bodyShort02}>
          {t(
            'billPaymentRequired',
            'The current patient has pending bill. Advice patient to settle bill before receiving services',
          )}
        </p>
        {isLoading && (
          <InlineLoading
            status="active"
            iconDescription="Loading"
            description={t('inlineLoading', 'Loading bill items...')}
          />
        )}
        {lineItems?.map((item) => (
          <p key={item.uuid}>
            <strong>{`${item.item} @ ${item.price} * ${item.quantity}  = `}</strong>
            {`${convertToCurrency(item.quantity * item.price)}`}
          </p>
        ))}
      </ModalBody>
      <ModalFooter>
        <Button onClick={closeModal} kind="danger">
          {t('discard', 'Discard')}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default RequirePaymentModal;
