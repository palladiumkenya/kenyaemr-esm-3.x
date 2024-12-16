import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ModalBody,
  ModalFooter,
  Button,
  InlineLoading,
  StructuredListWrapper,
  StructuredListHead,
  StructuredListRow,
  StructuredListCell,
  StructuredListBody,
  ComposedModal,
  Heading,
} from '@carbon/react';
import styles from './prompt-payment.scss';
import { convertToCurrency, extractString } from '../helpers';
import { navigate, useConfig } from '@openmrs/esm-framework';
import { BillingConfig } from '../config-schema';
import { getPatientUuidFromStore } from '@openmrs/esm-patient-common-lib';
import { useBillingPrompt } from './prompt-payment.resource';

type PromptPaymentModalProps = {};

const PromptPaymentModal: React.FC<PromptPaymentModalProps> = () => {
  const { t } = useTranslation();
  const patientUuid = getPatientUuidFromStore();
  const { shouldShowBillingPrompt, isLoading, bills } = useBillingPrompt(patientUuid, 'patient-chart');
  const [showModal, setShowModal] = useState({ loadingModal: true, billingModal: true });
  const { enforceBillPayment } = useConfig<BillingConfig>();

  const closeButtonText = enforceBillPayment
    ? t('navigateBack', 'Navigate back')
    : t('proceedToCare', 'Proceed to care');

  const handleCloseModal = () => {
    enforceBillPayment
      ? navigate({ to: `\${openmrsSpaBase}/home` })
      : setShowModal((prevState) => ({ ...prevState, billingModal: false }));
  };

  const lineItems = bills
    .filter((bill) => bill.status !== 'PAID')
    .flatMap((bill) => bill.lineItems)
    .filter((lineItem) => lineItem.paymentStatus !== 'EXEMPTED' && !lineItem.voided);

  if (!shouldShowBillingPrompt) {
    return null;
  }

  return (
    <ComposedModal preventCloseOnClickOutside open={showModal.billingModal}>
      {isLoading ? (
        <ModalBody>
          <Heading className={styles.modalTitle}>{t('billingStatus', 'Billing status')}</Heading>
          <InlineLoading
            status="active"
            iconDescription="Loading"
            description={t('patientBilling', 'Verifying patient bills')}
          />
        </ModalBody>
      ) : (
        <ModalBody>
          <Heading className={styles.modalTitle}>{t('patientBillingAlert', 'Patient Billing Alert')}</Heading>
          <p className={styles.bodyShort02}>
            {t('billPaymentRequiredMessage', 'The current patient has pending bill. Advice patient to settle bill.')}
          </p>
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
                  <StructuredListRow key={lineItem.uuid}>
                    <StructuredListCell>{extractString(lineItem.billableService || lineItem.item)}</StructuredListCell>
                    <StructuredListCell>{lineItem.quantity}</StructuredListCell>
                    <StructuredListCell>{convertToCurrency(lineItem.price)}</StructuredListCell>
                    <StructuredListCell>{convertToCurrency(lineItem.quantity * lineItem.price)}</StructuredListCell>
                  </StructuredListRow>
                );
              })}
            </StructuredListBody>
          </StructuredListWrapper>
          {!enforceBillPayment && (
            <p className={styles.providerMessage}>
              {t(
                'providerMessage',
                'By clicking Proceed to care, you acknowledge that you have advised the patient to settle the bill.',
              )}
            </p>
          )}
        </ModalBody>
      )}
      <ModalFooter>
        <Button kind="secondary" onClick={() => navigate({ to: `\${openmrsSpaBase}/home` })}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="danger" onClick={handleCloseModal}>
          {closeButtonText}
        </Button>
      </ModalFooter>
    </ComposedModal>
  );
};

export default PromptPaymentModal;
