import { Button, Loading, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { DocumentAttachment, Download } from '@carbon/react/icons';
import { showSnackbar } from '@openmrs/esm-framework';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePaymentModes } from '../billing.resource';
import { MAX_ALLOWED_FILE_SIZE } from '../constants';
import { ExcelFileRow } from '../types';
import { createBillableService, useServiceTypes } from './billable-service.resource';
import { useChargeSummaries } from './billables/charge-summary.resource';
import { BillableServicePayload, getBulkUploadPayloadFromExcelFile } from './billables/form-helper';
import styles from './clinical-charges.scss';
import { createAndDownloadFailedUploadsExcelFile, createAndDownloadFilteredRowsFile } from './utils';

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
        setIsImporting(false);
        closeModal();
        showSnackbar({
          title: t('errorOccurred', 'an error occurred'),
          subtitle: t('uploadError', 'an unknown error occurred. Please try reuploading the file'),
        });
      }

      if (fileReadResponse === 'INVALID_TEMPLATE') {
        closeModal();
        showSnackbar({
          title: t(
            'invalidFile',
            'The file you uploaded is invalid. A valid template should include [concept_id, name, short_name, price, disable, category]',
          ),
          kind: 'error',
        });
        setIsImporting(false);
        return;
      }

      const correctRowsPayload = fileReadResponse.at(0) ?? [];
      const filteredOutRows = fileReadResponse.at(1) ?? [];

      if (filteredOutRows?.length > 0) {
        createAndDownloadFilteredRowsFile(filteredOutRows as ExcelFileRow[]);
        showSnackbar({
          title: t(
            'filteredOutRows',
            'Some rows were missing categories and were filtered out. An excel file of the rows has been downloaded',
          ),
          kind: 'error',
        });
      }

      const erroredPayloads: BillableServicePayload[] = [];

      const chunkSize = 50;
      for (let i = 0; i < correctRowsPayload.length; i += chunkSize) {
        const chunk = correctRowsPayload.slice(i, i + chunkSize);

        const promises = chunk.map(async (formPayload) => {
          try {
            await createBillableService(formPayload);
          } catch (error) {
            erroredPayloads.push(formPayload);
          }
        });

        await Promise.all(promises);
      }

      setIsImporting(false);
      closeModal();

      if (erroredPayloads.length === 0 && correctRowsPayload.length >= 1) {
        showSnackbar({
          title: t('success', 'successfully'),
          subtitle: t(
            'successFullyUploadedItems',
            `Successfully uploaded ${correctRowsPayload.length} billable service${
              correctRowsPayload.length > 1 ? 's' : ''
            }.`,
          ),
          kind: 'success',
        });

        mutate();
        return;
      }

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
