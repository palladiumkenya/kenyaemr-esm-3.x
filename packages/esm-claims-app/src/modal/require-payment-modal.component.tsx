import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  InlineLoading,
  StructuredListWrapper,
  StructuredListHead,
  StructuredListRow,
  StructuredListCell,
  StructuredListBody,
} from '@carbon/react';
import styles from './require-payment.scss';
import { useBills } from '../billing.resource';
import { convertToCurrency, extractString } from '../helpers';
import { useConfig } from '@openmrs/esm-framework';
import { BillingConfig } from '../config-schema';

type RequirePaymentModalProps = {
  cancel: () => void;
  closeModal: () => void;
  patientUuid: string;
};

const RequirePaymentModal: React.FC<RequirePaymentModalProps> = ({ closeModal, patientUuid, cancel }) => {
  const { t } = useTranslation();
  const { bills, isLoading } = useBills(patientUuid);
  const { enforceBillPayment } = useConfig<BillingConfig>();

  const closeButtonText = enforceBillPayment
    ? t('navigateBack', 'Navigate back')
    : t('proceedToCare', 'Proceed to care');

  const handleCloseModal = () => {
    enforceBillPayment ? cancel() : closeModal();
  };

  const lineItems = bills
    .filter((bill) => bill.status !== 'PAID')
    .flatMap((bill) => bill.lineItems)
    .filter((lineItem) => lineItem.paymentStatus !== 'EXEMPTED');

  return (
    <div>
      <ModalHeader closeModal={closeModal} title={t('patientBillingAlert', 'Patient Billing Alert')} />
      <ModalBody>
        <p className={styles.bodyShort02}>
          {t('billPaymentRequiredMessage', 'The current patient has pending bill. Advice patient to settle bill.')}
        </p>
        {isLoading && (
          <InlineLoading
            status="active"
            iconDescription="Loading"
            description={t('inlineLoading', 'Loading bill items...')}
          />
        )}
        <StructuredListWrapper isCondensed>
          <StructuredListHead>
            <StructuredListRow head>
              <StructuredListCell head>{t('item', 'Item')}</StructuredListCell>
              <StructuredListCell head>{t('quantity', 'Quantity')}</StructuredListCell>
              <StructuredListCell head>{t('unitPrice', 'Unit price')}</StructuredListCell>
              <StructuredListCell head>{t('total', 'Total')}</StructuredListCell>
            </StructuredListRow>
          </StructuredListHead>
          <StructuredListBody>
            {lineItems.map((lineItem) => {
              return (
                <StructuredListRow>
                  <StructuredListCell>{extractString(lineItem.billableService || lineItem.item)}</StructuredListCell>
                  <StructuredListCell>{lineItem.quantity}</StructuredListCell>
                  <StructuredListCell>{convertToCurrency(lineItem.price)}</StructuredListCell>
                  <StructuredListCell>{convertToCurrency(lineItem.quantity * lineItem.price)}</StructuredListCell>
                </StructuredListRow>
              );
            })}
          </StructuredListBody>
        </StructuredListWrapper>
        <p className={styles.providerMessage}>
          {t(
            'providerMessage',
            'By clicking Proceed to care, you acknowledge that you have advised the patient to settle the bill.',
          )}
        </p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={cancel}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="danger" onClick={handleCloseModal}>
          {closeButtonText}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default RequirePaymentModal;
