import {
  Button,
  ModalBody,
  ModalFooter,
  ModalHeader,
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from '@carbon/react';
import { formatDate, parseDate } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FacilityClaim } from '../../../../types';
import { useFacilityClaims } from '../use-facility-claims';
import styles from './claim-summary.scss';
import upperCase from 'lodash-es/upperCase';
import Capitalize from 'lodash-es/capitalize';
import { useCurrencyFormatting } from '../../../../helpers/currency';

type ProvidedItem = {
  uuid: string;
  originUuid: string;
  price: number;
  dateOfServed: string | null;
  status: string;
  numberOfConsumptions: number;
  item: {
    uuid: string;
    display: string;
  };
};

type ExtendedClaim = FacilityClaim & {
  id: string;
  providerName: string;
  patientName: string;
  patientId?: string;
  visitType?: { uuid: string; display: string };
  patient?: {
    uuid: string;
    display: string;
    person?: {
      display?: string;
      gender: string;
      age: number;
      birthdate: string;
    };
  };
  visit?: {
    uuid: string;
    display: string;
    startDatetime: string;
    stopDatetime: string;
    encounters: Array<{
      diagnoses: Array<{
        uuid: string;
        diagnosis: {
          coded?: {
            display: string;
            name?: {
              display: string;
            };
          };
          display?: string;
        };
      }>;
    }>;
  };
  bill: {
    uuid: string;
    providedItems?: Array<ProvidedItem>;
  };
};

export const ClaimSummaryModal = ({ closeModal, claimId }: { closeModal: () => void; claimId: string }) => {
  const { t } = useTranslation();
  const { claims } = useFacilityClaims();
  const { format: formatCurrency } = useCurrencyFormatting();

  const claim = claims.find((claim) => claim.id === claimId) as ExtendedClaim | undefined;

  if (!claim) {
    return (
      <React.Fragment>
        <ModalHeader closeModal={closeModal}>{t('claimInvoice', 'Claim Invoice')}</ModalHeader>
        <ModalBody>
          <p>{t('claimNotFound', 'Claim not found')}</p>
        </ModalBody>
        <ModalFooter>
          <Button kind="primary" onClick={closeModal} type="button">
            {t('close', 'Close')}
          </Button>
        </ModalFooter>
      </React.Fragment>
    );
  }

  const diagnoses =
    claim.visit?.encounters?.flatMap((encounter) => {
      if (!encounter.diagnoses || encounter.diagnoses.length === 0) {
        return [];
      }

      return encounter.diagnoses
        .map((d) => {
          let displayName = '';

          if (d.diagnosis?.coded?.display) {
            displayName = d.diagnosis.coded.display;
          } else if (d.diagnosis?.coded?.name?.display) {
            displayName = d.diagnosis.coded.name.display;
          } else if (d.diagnosis?.display) {
            displayName = d.diagnosis.display;
          } else if (typeof d.diagnosis === 'string') {
            displayName = d.diagnosis;
          }

          return {
            uuid: d.uuid,
            display: displayName,
          };
        })
        .filter((d) => d.display);
    }) || [];

  const lineItemsHeaders = [
    { key: 'item', header: t('item', 'Item') },
    { key: 'quantity', header: t('quantity', 'Quantity') },
    { key: 'unitPrice', header: t('unitPrice', 'Unit Price') },
    { key: 'total', header: t('total', 'Total') },
  ];

  const providedItems = claim.bill?.providedItems || [];

  const lineItemsRows =
    providedItems.length > 0
      ? providedItems.map((item, index) => ({
          id: `${index}`,
          item: item.item?.display || '-',
          quantity: item.numberOfConsumptions || 1,
          unitPrice: formatCurrency(item.price || 0),
          total: formatCurrency((item.price || 0) * (item.numberOfConsumptions || 1)),
        }))
      : [];

  const calculatedTotal = providedItems.reduce((sum, item) => {
    return sum + (item.price || 0) * (item.numberOfConsumptions || 1);
  }, 0);

  const displayTotal = calculatedTotal > 0 ? calculatedTotal : claim.claimedTotal || 0;

  return (
    <React.Fragment>
      <ModalBody>
        <div className={styles.invoiceContainer}>
          <div className={styles.invoiceHeader}>
            <div className={styles.invoiceTitle}>
              <h3>{t('claimSummary', 'CLAIM SUMMARY')}</h3>
            </div>
            <div className={styles.claimNumber}>
              <span className={styles.claimNumberLabel}>{t('claimNo', 'Claim No.')}</span>
              <span className={styles.claimNumberValue}>{claim.claimCode || 'N/A'}</span>
            </div>
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoBlock}>
              <h4 className={styles.blockTitle}>{t('billTo', 'BILL TO')}</h4>
              <div className={styles.infoContent}>
                <p className={styles.primaryInfo}>
                  {upperCase(claim.patient?.person?.display || claim.patientName) || '-'}
                </p>
                <p className={styles.secondaryInfo}>
                  {claim.patient?.person?.gender} • {claim.patient?.person?.age} years
                </p>
                <p className={styles.secondaryInfo}>
                  {t('dob', 'DOB')}:{' '}
                  {claim.patient?.person?.birthdate
                    ? formatDate(parseDate(claim.patient.person.birthdate), { time: false, noToday: true })
                    : '-'}
                </p>
              </div>
            </div>

            <div className={styles.infoBlock}>
              <h4 className={styles.blockTitle}>{t('provider', 'PROVIDER')}</h4>
              <div className={styles.infoContent}>
                <p className={styles.primaryInfo}>{claim.providerName || '-'}</p>
              </div>
            </div>
          </div>

          <div className={styles.visitSection}>
            <h4 className={styles.sectionTitle}>{t('visitInformation', 'VISIT INFORMATION')}</h4>
            <div className={styles.visitGrid}>
              <div className={styles.visitField}>
                <span className={styles.visitLabel}>{t('visitType', 'Visit Type')}</span>
                <div className={styles.visitValueContainer}>
                  <span className={styles.visitValue}>{claim.visitType?.display || claim.use || '-'}</span>
                </div>
              </div>
              <div className={styles.visitField}>
                <span className={styles.visitLabel}>{t('dateFrom', 'Service From')}</span>
                <span className={styles.visitValue}>
                  {claim.dateFrom ? formatDate(parseDate(claim.dateFrom), { time: false, noToday: true }) : '-'}
                </span>
              </div>
              <div className={styles.visitField}>
                <span className={styles.visitLabel}>{t('dateTo', 'Service To')}</span>
                <span className={styles.visitValue}>
                  {claim.dateTo ? formatDate(parseDate(claim.dateTo), { time: false, noToday: true }) : '-'}
                </span>
              </div>
            </div>
          </div>

          {diagnoses.length > 0 && (
            <div className={styles.diagnosesSection}>
              <h4 className={styles.sectionTitle}>{t('diagnoses', 'DIAGNOSES')}</h4>
              <ul className={styles.diagnosesList}>
                {diagnoses.map((diagnosis) => (
                  <li key={diagnosis.uuid} className={styles.diagnosisItem}>
                    {Capitalize(diagnosis.display)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className={styles.lineItemsSection}>
            <h4 className={styles.sectionTitle}>{t('servicesProvided', 'SERVICES PROVIDED')}</h4>
            {providedItems.length === 0 ? (
              <p className={styles.noItems}>{t('noLineItems', 'No line items available')}</p>
            ) : lineItemsRows.length > 0 ? (
              <DataTable rows={lineItemsRows} headers={lineItemsHeaders}>
                {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
                  <Table {...getTableProps()} size="md" useZebraStyles={false}>
                    <TableHead>
                      <TableRow>
                        {headers.map((header) => (
                          <TableHeader {...getHeaderProps({ header })} key={header.key}>
                            {header.header}
                          </TableHeader>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRow {...getRowProps({ row })} key={row.id}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>{cell.value}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </DataTable>
            ) : (
              <p className={styles.noItems}>{t('noLineItems', 'No line items available')}</p>
            )}
          </div>

          <div className={styles.financialSummary}>
            <h4 className={styles.sectionTitle}>{t('total', 'TOTAL')}</h4>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>{t('claimedAmount', 'Claimed Amount')}</span>
              <span className={styles.summaryValue}>{formatCurrency(displayTotal)}</span>
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button kind="primary" onClick={closeModal} type="button">
          {t('close', 'Close')}
        </Button>
      </ModalFooter>
    </React.Fragment>
  );
};
