import {
  Button,
  ButtonSet,
  DataTable,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import { formatDate, parseDate } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../tables/lab-manifest-table.scss';
import { LabManifestSample } from '../types';

interface SampleDeleteConfirmDialogProps {
  onClose: () => void;
  onDelete: () => void;
  samples?: Array<LabManifestSample>;
}
const SampleDeleteConfirmDialog: React.FC<SampleDeleteConfirmDialogProps> = ({ onClose, onDelete, samples = [] }) => {
  const { t } = useTranslation();

  const headers = [
    {
      header: t('patientIdentifier', 'Patient Identifier'),
      key: 'cccKDODNumber',
    },
    {
      header: t('batchNumber', 'Batch Number'),
      key: 'batchNumber',
    },
    {
      header: t('sampleType', 'Sample type'),
      key: 'sampleType',
    },
    {
      header: t('dateRequested', 'Date Requested'),
      key: 'dateRequested',
    },
    {
      header: t('resultDate', 'Result Date'),
      key: 'resultDate',
    },
    {
      header: t('result', 'Result'),
      key: 'result',
    },
  ];

  const tableRows =
    samples.map((sample) => {
      return {
        id: `${sample.uuid}`,
        sampleType: sample.sampleType ?? '--',
        status: sample.status,
        batchNumber: sample.batchNumber ?? '--',
        cccKDODNumber: sample?.order?.patient?.identifiers[0]?.identifier ?? '--',
        dateRequested: sample.dateSent ? formatDate(parseDate(sample.dateSent)) : '--',
        resultDate: sample.resultDate ? formatDate(parseDate(sample.resultDate)) : '--',
        result: sample.result ?? '--',
      };
    }) ?? [];

  return (
    <React.Fragment>
      <ModalHeader className={styles.sectionHeader} closeModal={onClose}>
        {t('removeSampledFromManifest', 'Remove Samples from Manifest')}
      </ModalHeader>
      <ModalBody>
        <Stack>
          <span className={styles.modalQuiz}>
            Are you sure yu would like to remove bellow samples from the manifest?
          </span>
          <div className={styles.widgetContainer}>
            <DataTable
              useZebraStyles
              size="sm"
              rows={tableRows ?? []}
              headers={headers}
              render={({ rows, headers, getHeaderProps, getRowProps, getTableProps, getTableContainerProps }) => (
                <>
                  <TableContainer {...getTableContainerProps()}>
                    <Table {...getTableProps()}>
                      <TableHead>
                        <TableRow>
                          {headers.map((header, i) => (
                            <TableHeader key={i} {...getHeaderProps({ header })}>
                              {header.header}
                            </TableHeader>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rows.map((row, i) => (
                          <TableRow key={i} {...getRowProps({ row })} onClick={(evt) => {}}>
                            {row.cells.map((cell) => (
                              <TableCell key={cell.id}>{cell.value}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            />
          </div>
        </Stack>
      </ModalBody>
      <ModalFooter>
        <ButtonSet className={styles.buttonSet}>
          <Button kind="secondary" onClick={onClose} className={styles.button}>
            Cancel
          </Button>
          <Button kind="danger" onClick={onDelete} className={styles.button}>
            Remove
          </Button>
        </ButtonSet>
      </ModalFooter>
    </React.Fragment>
  );
};

export default SampleDeleteConfirmDialog;
