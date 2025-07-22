import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonSet, ModalBody, ModalFooter, InlineNotification } from '@carbon/react';
import { useReactToPrint } from 'react-to-print';
import { formatDate, formatDatetime, parseDate, useSession } from '@openmrs/esm-framework';
import styles from './print-preview-confirmation.scss';
import { type Patient } from '../../types';
import { formatDateTime } from '../../utils/utils';

type PrintPreviewModalProps = {
  onClose: () => void;
  patient: Patient;
};

const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({ onClose, patient }) => {
  const { t } = useTranslation();
  const [printError, setPrintError] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const { sessionLocation } = useSession();

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Mortuary Gate Pass',
    onAfterPrint: () => {
      setPrintError(null);
    },
    onPrintError: (_, error) => {
      setPrintError(error?.message || 'An error occurred while printing');
    },
    pageStyle: `
      @page {
        size: A4;
        margin: 15mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          font-family: Arial, sans-serif !important;
          font-size: 11px !important;
          line-height: 1.3 !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          color: #000000 !important;
        }
        .${styles.printableContent} {
          page-break-inside: avoid !important;
          border: none !important;
          padding: 0 !important;
          margin: 0 !important;
          box-shadow: none !important;
        }
      }
    `,
  });

  const getPatientNumber = () => {
    const openMRSId =
      patient.identifiers
        ?.find((id) => id.display?.includes('OpenMRS ID'))
        ?.display?.split('=')?.[1]
        ?.trim() || '';
    return openMRSId;
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return {
      date: formatDate(now, { mode: 'standard' }),
      time: now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  const currentDateTime = getCurrentDateTime();

  return (
    <>
      <ModalBody>
        <div className={styles.container}>
          <div ref={printRef} className={styles.printableContent}>
            <div className={styles.printableHeader}>
              <div className={styles.facilityDetails}>
                <div className={styles.facilityName}>{sessionLocation?.display}</div>
                <div className={styles.heading}>MORTUARY GATE PASS</div>
              </div>
            </div>

            <div className={styles.printableBody}>
              <div className={styles.gatePassForm}>
                <div className={styles.topInfoRow}>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>PAPER NO:</span>
                    <span className={styles.value}>{''}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>PATIENT NO:</span>
                    <span className={styles.value}>{getPatientNumber()}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>DATE:</span>
                    <span className={styles.value}>{currentDateTime.date}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>TIME:</span>
                    <span className={styles.value}>{currentDateTime.time}</span>
                  </div>
                </div>
                <div className={styles.secondInfoRow}>
                  <div className={styles.patientField}>
                    <span className={styles.label}>PATIENT NAMES:</span>
                    <span className={styles.valueWide}>{patient.person?.display || ''}</span>
                  </div>
                  <div className={styles.ageField}>
                    <span className={styles.label}>AGE:</span>
                    <span className={styles.value}>{patient.person?.age || ''}</span>
                  </div>
                </div>
                <div className={styles.secondInfoRow}>
                  <div className={styles.patientField}>
                    <span className={styles.label}>DATE OF ADMISSION:</span>
                    <span className={styles.valueWide}>{formatDateTime(patient.person?.birthdate)}</span>
                  </div>
                  <div className={styles.ageField}>
                    <span className={styles.label}>DATE OF DISCHARGE:</span>
                    <span className={styles.value}>{formatDateTime(patient.person?.deathDate)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              <div className={styles.paymentSection}>
                <div className={styles.sectionTitle}>Method of payment (tick as appropriate)</div>
                <div className={styles.paymentGrid}>
                  <div className={styles.paymentOption}>
                    <span className={styles.checkbox}></span>
                    <span className={styles.optionLabel}>Cash</span>
                  </div>
                  <div className={styles.paymentOption}>
                    <span className={styles.checkbox}></span>
                    <span className={styles.optionLabel}>Cheque</span>
                  </div>
                  <div className={styles.paymentOption}>
                    <span className={styles.checkbox}></span>
                    <span className={styles.optionLabel}>SHA</span>
                  </div>
                  <div className={styles.paymentOption}>
                    <span className={styles.checkbox}></span>
                    <span className={styles.optionLabel}>Scheme</span>
                  </div>
                  <div className={styles.paymentOption}>
                    <span className={styles.checkbox}></span>
                    <span className={styles.optionLabel}>M.R.M</span>
                  </div>
                  <div className={styles.paymentOption}>
                    <span className={styles.checkbox}></span>
                    <span className={styles.optionLabel}>Others: {'...........................'}</span>
                  </div>
                </div>
              </div>

              <div className={styles.signaturesSection}>
                <div className={styles.signatureBlock}>
                  <div className={styles.signatureRow}>
                    <div className={styles.nameField}>
                      <span className={styles.label}>Account Officer:</span>
                      <span className={styles.nameValue}>{''}</span>
                    </div>
                    <div className={styles.signField}>
                      <span className={styles.label}>Sign:</span>
                      <div className={styles.signatureLine}></div>
                    </div>
                    <div className={styles.dateField}>
                      <span className={styles.label}>Date:</span>
                      <div className={styles.signatureLine}></div>
                    </div>
                  </div>
                </div>

                <div className={styles.signatureBlock}>
                  <div className={styles.signatureRow}>
                    <div className={styles.nameField}>
                      <span className={styles.label}>Nurse Officer Incharge:</span>
                      <span className={styles.nameValue}>{''}</span>
                    </div>
                    <div className={styles.signField}>
                      <span className={styles.label}>Sign:</span>
                      <div className={styles.signatureLine}></div>
                    </div>
                    <div className={styles.dateField}>
                      <span className={styles.label}>Date:</span>
                      <div className={styles.signatureLine}></div>
                    </div>
                  </div>
                </div>

                <div className={styles.signatureBlock}>
                  <div className={styles.signatureRow}>
                    <div className={styles.nameField}>
                      <span className={styles.label}>S. Guard Name:</span>
                      <span className={styles.nameValue}>{''}</span>
                    </div>
                    <div className={styles.signField}>
                      <span className={styles.label}>Sign:</span>
                      <div className={styles.signatureLine}></div>
                    </div>
                    <div className={styles.dateField}>
                      <span className={styles.label}>Date:</span>
                      <div className={styles.signatureLine}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.footerNote}>
                <div className={styles.noteText}>
                  <strong>N/B:</strong> This form should be filled in duplicate, one copy to be retained in the ward and
                  the other to be left at the main gate
                </div>
              </div>
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <ButtonSet className={styles.btnSet}>
          <Button kind="secondary" onClick={onClose} type="button">
            {t('cancel', 'Cancel')}
          </Button>
          <Button kind="primary" type="button" onClick={handlePrint}>
            {t('print', 'Print')}
          </Button>
        </ButtonSet>
      </ModalFooter>

      {printError && (
        <InlineNotification kind="error" title={t('printError', 'Error')} subtitle={printError} hideCloseButton />
      )}
    </>
  );
};

export default PrintPreviewModal;
