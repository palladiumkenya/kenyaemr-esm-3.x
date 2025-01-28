import { Button, Loading, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { DocumentAttachment, Download } from '@carbon/react/icons';
import { showSnackbar } from '@openmrs/esm-framework';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePaymentModes } from '../billing.resource';
import { MAX_ALLOWED_FILE_SIZE } from '../constants';
import { createBillableService, useServiceTypes } from './billable-service.resource';
import { useChargeSummaries } from './billables/charge-summary.resource';
import { getBulkUploadPayloadFromExcelFile } from './billables/form-helper';
import styles from './clinical-charges.scss';
import { createAndDownloadFailedUploadsExcelFile } from './utils';

export const BulkImportBillableServices = ({ closeModal }) => {
  const [isImporting, setIsImporting] = useState(false);
  const { t } = useTranslation();
  const inputFileRef = useRef<HTMLInputElement>();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const { chargeSummaryItems, mutate } = useChargeSummaries();
  const { serviceTypes } = useServiceTypes();
  const { paymentModes } = usePaymentModes();

  const attachFiles = () => {
    inputFileRef.current.click();
  };

  const handleFileChange = () => {
    if (inputFileRef.current && inputFileRef.current.files) {
      const file = inputFileRef.current.files[0];
      if (file.size > MAX_ALLOWED_FILE_SIZE) {
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
      let fileReadResponse: ReturnType<typeof getBulkUploadPayloadFromExcelFile> = [];

      try {
        fileReadResponse = getBulkUploadPayloadFromExcelFile(data, chargeSummaryItems, paymentModes, serviceTypes);
      } catch (error) {
        console.error('error', error);
        setIsImporting(false);
        closeModal();
        showSnackbar({
          title: t('errorOccurred', 'an error occurred'),
          subtitle: t('uploadError', 'an unknown error occurred. Please try reuploading the file'),
          kind: 'error',
        });

        return;
      }

      if (fileReadResponse === 'INVALID_TEMPLATE') {
        closeModal();
        showSnackbar({
          title: t(
            'invalidFileError',
            'The file you uploaded is invalid. A valid template should include the following columns [name, short_name, service_status, service_type_id, concept_id, your payment modes]',
          ),
          kind: 'error',
        });
        setIsImporting(false);
        return;
      }

      const erroredPayloads = [];

      const newItems = fileReadResponse.at(0);
      const updatedItems = fileReadResponse.at(1);

      let successfulNewItems = 0;
      let successfulUpdatedItems = 0;

      const chunkSize = 50;
      for (let i = 0; i < newItems.length; i += chunkSize) {
        const chunk = newItems.slice(i, i + chunkSize);

        const promises = chunk.map(async (formPayload) => {
          try {
            await createBillableService(formPayload);
            successfulNewItems++;
          } catch (error) {
            erroredPayloads.push(formPayload);
          }
        });

        await Promise.allSettled(promises);
      }

      for (let i = 0; i < updatedItems.length; i += chunkSize) {
        const chunk = updatedItems.slice(i, i + chunkSize);

        const promises = chunk.map(async (formPayload) => {
          const uuid = chargeSummaryItems.find((i) => i.name === formPayload.name).uuid;
          try {
            await createBillableService({ uuid, ...formPayload });
            successfulUpdatedItems++;
          } catch (error) {
            erroredPayloads.push(formPayload);
          }
        });

        await Promise.allSettled(promises);
      }

      setIsImporting(false);
      closeModal();

      if (erroredPayloads.length) {
        createAndDownloadFailedUploadsExcelFile(erroredPayloads);
        showSnackbar({
          title: t('anErrorOccurred', 'anErrorOccurred'),
          subtitle: t(
            'anErrorOccurred',
            `An error occurred uploading ${erroredPayloads.length} items. A file has been downloaded with the failed services`,
          ),
          kind: 'error',
        });
      }

      if (successfulNewItems >= 1) {
        showSnackbar({
          title: t('success', 'successfully'),
          subtitle: t(
            'successFullyCreatedNewItems',
            `Successfully uploaded ${successfulNewItems} new chargeitem${successfulNewItems > 1 ? 's' : ''}.`,
          ),
          kind: 'success',
        });
      }

      if (successfulUpdatedItems >= 1) {
        showSnackbar({
          title: t('success', 'successfully'),
          subtitle: t(
            'successFullyUpdatedNewItems',
            `Successfully updated ${successfulUpdatedItems} chargeitem${successfulUpdatedItems > 1 ? 's' : ''}.`,
          ),
          kind: 'success',
        });
      }
      mutate();
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
        <Button type="submit" onClick={importBillableServices} disabled={!uploadedFile || isImporting}>
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
