import { Button, Loading, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { DocumentAttachment, Download } from '@carbon/react/icons';
import { showSnackbar } from '@openmrs/esm-framework';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePaymentModes } from '../billing.resource';
import { createBillableService } from './billable-service.resource';
import { useChargeSummaries } from './billables/charge-summary.resource';
import { BillableServicePayload, getBulkUploadPayloadFromExcelFile } from './billables/form-helper';
import styles from './clinical-charges.scss';
import { createAndDownloadFailedUploadsExcelFile } from './utils';

export const BulkImportBillableServices = ({ closeModal }) => {
  const [isImporting, setIsImporting] = useState(false);
  const { t } = useTranslation();
  const inputFileRef = useRef<HTMLInputElement>();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const { chargeSummaryItems, mutate } = useChargeSummaries();

  const { paymentModes } = usePaymentModes();

  const attachFiles = () => {
    inputFileRef.current.click();
  };

  const handleFileChange = () => {
    if (inputFileRef.current && inputFileRef.current.files) {
      const file = inputFileRef.current.files[0];
      if (file.size > 2097152) {
        showSnackbar({
          title: t('fileTooBig', 'fileTooBig'),
          kind: 'error',
        });

        return;
      }
      setUploadedFile(file);
    }
  };

  const importBillableServices = () => {
    const file = inputFileRef.current.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
      setIsImporting(true);
      const data = new Uint8Array(e.target.result as ArrayBuffer);
      const payload = getBulkUploadPayloadFromExcelFile(data, chargeSummaryItems, paymentModes);

      const erroredPayloads: BillableServicePayload[] = [];

      const chunkSize = 50;
      for (let i = 0; i < payload.length; i += chunkSize) {
        const chunk = payload.slice(i, i + chunkSize);

        const promises = chunk.map(async (formPayload) => {
          try {
            await createBillableService(formPayload);
          } catch (error) {
            erroredPayloads.push(formPayload);
          }
        });

        await Promise.all(promises);
      }

      mutate();
      setIsImporting(false);
      closeModal();
      showSnackbar({
        title: t('success', 'successfully'),
        subtitle: t('successFullyUploadedItems', `Successfully uploaded ${payload.length} billable services.`),
        kind: 'success',
      });

      if (erroredPayloads.length) {
        createAndDownloadFailedUploadsExcelFile(erroredPayloads);
        showSnackbar({
          title: t('anErrorOccurred', 'anErrorOccurred'),
          subtitle: t(
            'anErrorOccurred',
            `An error occurred uploading some items. A file has been downloaded with the failed services`,
          ),
          kind: 'error',
        });
      }
    };

    reader.onerror = () => {
      showSnackbar({
        title: t('errorReadingFile', 'An error occurred reading your file'),
        kind: 'error',
      });
      setIsImporting(false);
    };

    reader.readAsArrayBuffer(file);
    setIsImporting(false);
  };

  return (
    <React.Fragment>
      <ModalHeader closeModal={closeModal}>Bulk Import Billable Services</ModalHeader>
      <ModalBody>
        <input
          type="file"
          ref={inputFileRef}
          hidden
          onChange={handleFileChange}
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        />
        <p className={styles.csvreq}>Only excel files at 2mb or less</p>
        <div className={styles.uploadButtonWrapper}>
          <Button onClick={attachFiles}>
            Upload File <DocumentAttachment className={styles.iconMarginLeft} />
          </Button>
          {uploadedFile ? <p className={styles.selectedFile}>{uploadedFile.name}</p> : 'No file selected'}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal} type="button">
          {t('cancel', 'Cancel')}
        </Button>
        <Button type="submit" onClick={importBillableServices} disabled={!uploadedFile}>
          {isImporting ? (
            <>
              <Loading withOverlay={false} small />
              {t('importing', 'importing')}
            </>
          ) : (
            t('import', 'Import')
          )}
          <Download className={styles.iconMarginLeft} />
        </Button>
      </ModalFooter>
    </React.Fragment>
  );
};
