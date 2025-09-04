import React from 'react';
import { useTranslation } from 'react-i18next';
import { ModalBody, ModalHeader, InlineLoading, ModalFooter, Button } from '@carbon/react';
import { ErrorState } from '@openmrs/esm-framework';
import styles from './print-preview.scss';
import { usePrintPreview } from '../../usePrintPreview';

type PrintPreviewModalProps = {
  onClose: () => void;
  title?: string;
  documentUrl?: string;
};

const AdrPrintPreviewModal: React.FC<PrintPreviewModalProps> = ({ onClose, title, documentUrl }) => {
  const { t } = useTranslation();

  const { data, isLoading, error } = usePrintPreview(documentUrl);
  return (
    <div>
      <>
        <ModalHeader closeModal={onClose} className={styles.title}>
          {t('printPreview', 'Print Preview {{title}}', { title })}
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
          {data && !isLoading && (
            <iframe src={String(data)} title="ADR Report Preview" className={styles.previewFrame} />
          )}
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={onClose} type="button" className={styles.btn}>
            {t('close', 'Close')}
          </Button>
        </ModalFooter>
      </>
    </div>
  );
};

export default AdrPrintPreviewModal;
