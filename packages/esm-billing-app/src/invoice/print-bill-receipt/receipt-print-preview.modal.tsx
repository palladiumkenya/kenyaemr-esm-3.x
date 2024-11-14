import { Button, InlineLoading, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { ErrorState } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MappedBill } from '../../types';
import { usePaidBillReceiptFileObjectUrl } from './print-bill-receipt.resource';
import styles from './print-bill-receipt.scss';

type ReceiptPrintPreviewModalProps = {
  onClose: () => void;
  bill: MappedBill;
};

const ReceiptPrintPreviewModal: React.FC<ReceiptPrintPreviewModalProps> = ({ onClose, bill }) => {
  const { t } = useTranslation();
  const { mutate, isLoading, url, error } = usePaidBillReceiptFileObjectUrl(bill.id);
  return (
    <>
      <ModalHeader closeModal={onClose} className={styles.title}>
        {t('printReceipt', 'Print Receipt')}
      </ModalHeader>
      <ModalBody>
        {isLoading && (
          <InlineLoading
            status="active"
            iconDescription="Loading"
            description={t('loadingReceipt', 'Loading Receipt')}
          />
        )}
        {error && <ErrorState error={error} headerTitle={t('previewError', 'Preview Error')} />}
        {url && !isLoading && <iframe src={String(url)} title="Receipt Preview" className={styles.previewFrame} />}
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={onClose} type="button" className={styles.btn}>
          {t('close', 'Close')}
        </Button>
      </ModalFooter>
    </>
  );
};

export default ReceiptPrintPreviewModal;
