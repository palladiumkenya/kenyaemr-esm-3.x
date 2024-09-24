import { Button, Loading, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { DocumentAttachment, Download } from '@carbon/react/icons';
import { showSnackbar } from '@openmrs/esm-framework';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './clinical-charges.scss';

export const BulkImportBillableServices = ({ closeModal }) => {
  const [isImporting, setIsImporting] = useState(false);
  const { t } = useTranslation();
  const inputFileRef = useRef<HTMLInputElement>();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

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

  const importFiles = () => {
    setIsImporting(true);
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
        <Button type="submit" onClick={importFiles} disabled={!uploadedFile}>
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
