import React, { useRef, useState, useMemo } from 'react';
import { Button, ButtonSet, ModalBody, ModalFooter, InlineNotification } from '@carbon/react';
import { useReactToPrint } from 'react-to-print';
import { formatDate, formatDatetime, parseDate, useSession } from '@openmrs/esm-framework';
import styles from './print-preview-confirmation.scss';
import { type Patient } from '../../types';
import { formatDateTime, documentId, getAbsoluteDateTime } from '../../utils/utils';
import { useTranslation } from 'react-i18next';

type PrintPreviewModalProps = {
  onClose: () => void;
  patient: Patient;
  encounterDate?: string;
};

const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({ onClose, patient, encounterDate }) => {
  const { t } = useTranslation();
  const [printError, setPrintError] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const { sessionLocation, user } = useSession();
  const userDisplay = user ? user.display : '';
  const generationTimestamp = useMemo(() => new Date(), []);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
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

  const currentDateTime = getAbsoluteDateTime();

  return (
    <>
      <ModalBody>
        <div className={styles.container}>
          <div ref={printRef} className={styles.printableContent}>
            <div className={styles.printableHeader}>
              <div className={styles.facilityDetails}>
                <div className={styles.facilityName}>{sessionLocation?.display}</div>
                <div className={styles.heading}>{t('mortuaryGatePass', 'Mortuary Gate Pass')}</div>
              </div>
            </div>

            <div className={styles.printableBody}>
              <div className={styles.gatePassForm}>
                <div className={styles.topInfoRow}>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>{t('paperNo', 'Paper No' + ':')}</span>
                    <span className={styles.value}>{getPatientNumber()}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>{t('patientNo', 'Patient No' + ':')}</span>
                    <span className={styles.value}>{getPatientNumber()}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>{t('date', 'Date' + ':')}</span>
                    <span className={styles.value}>{currentDateTime.date}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>{t('time', 'Time' + ':')}</span>
                    <span className={styles.value}>{currentDateTime.time}</span>
                  </div>
                </div>
                <div className={styles.secondInfoRow}>
                  <div className={styles.patientField}>
                    <span className={styles.label}>{t('patientName', 'Patient Name' + ':')}</span>
                    <span className={styles.valueWide}>{patient.person?.display || ''}</span>
                  </div>
                  <div className={styles.ageField}>
                    <span className={styles.label}>{t('age', 'Age' + ':')}</span>
                    <span className={styles.value}>{patient.person?.age || ''}</span>
                  </div>
                </div>
                <div className={styles.secondInfoRow}>
                  <div className={styles.patientField}>
                    <span className={styles.label}>{t('dateOfAdmission', 'Date of Admission' + ':')}</span>
                    <span className={styles.valueWide}>{formatDateTime(patient.person?.deathDate)}</span>
                  </div>
                  <div className={styles.ageField}>
                    <span className={styles.label}>{t('dateOfDischarge', 'Date of Discharge' + ':')}</span>
                    <span className={styles.value}>{formatDateTime(encounterDate)}</span>
                  </div>
                </div>
              </div>

              <div className={styles.paymentSection}>
                <div className={styles.sectionTitle}>
                  {t('methodOfPayment', 'Method of payment (tick as appropriate)')}
                </div>
                <div className={styles.paymentGrid}>
                  <div className={styles.paymentOption}>
                    <span className={styles.checkbox}></span>
                    <span className={styles.optionLabel}>{t('cash', 'Cash')}</span>
                  </div>
                  <div className={styles.paymentOption}>
                    <span className={styles.checkbox}></span>
                    <span className={styles.optionLabel}>{t('cheque', 'Cheque')}</span>
                  </div>
                  <div className={styles.paymentOption}>
                    <span className={styles.checkbox}></span>
                    <span className={styles.optionLabel}>{t('sha', 'SHA')}</span>
                  </div>
                  <div className={styles.paymentOption}>
                    <span className={styles.checkbox}></span>
                    <span className={styles.optionLabel}>{t('scheme', 'Scheme')}</span>
                  </div>
                  <div className={styles.paymentOption}>
                    <span className={styles.checkbox}></span>
                    <span className={styles.optionLabel}>{t('mrM', 'M.R.M')}</span>
                  </div>
                  <div className={styles.paymentOption}>
                    <span className={styles.checkbox}></span>
                    <span className={styles.optionLabel}>
                      {t('others', 'Others:')} {'...........................'}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.signaturesSection}>
                <div className={styles.signatureBlock}>
                  <div className={styles.signatureRow}>
                    <div className={styles.nameField}>
                      <span className={styles.label}>{t('accountOfficer', 'Account Officer:')}</span>
                      <span className={styles.nameValue}>{''}</span>
                    </div>
                    <div className={styles.signField}>
                      <span className={styles.label}>{t('sign', 'Sign:')}</span>
                      <div className={styles.signatureLine}></div>
                    </div>
                    <div className={styles.dateField}>
                      <span className={styles.label}>{t('date', 'Date:')}</span>
                      <div className={styles.signatureLine}></div>
                    </div>
                  </div>
                </div>

                <div className={styles.signatureBlock}>
                  <div className={styles.signatureRow}>
                    <div className={styles.nameField}>
                      <span className={styles.label}>{t('nurseOfficerIncharge', 'Nurse Officer Incharge:')}</span>
                      <span className={styles.nameValue}>{''}</span>
                    </div>
                    <div className={styles.signField}>
                      <span className={styles.label}>{t('sign', 'Sign:')}</span>
                      <div className={styles.signatureLine}></div>
                    </div>
                    <div className={styles.dateField}>
                      <span className={styles.label}>{t('date', 'Date:')}</span>
                      <div className={styles.signatureLine}></div>
                    </div>
                  </div>
                </div>

                <div className={styles.signatureBlock}>
                  <div className={styles.signatureRow}>
                    <div className={styles.nameField}>
                      <span className={styles.label}>{t('securityGuardName', 'S. Guard Name:')}</span>
                      <span className={styles.nameValue}>{''}</span>
                    </div>
                    <div className={styles.signField}>
                      <span className={styles.label}>{t('sign', 'Sign:')}</span>
                      <div className={styles.signatureLine}></div>
                    </div>
                    <div className={styles.dateField}>
                      <span className={styles.label}>{t('date', 'Date:')}</span>
                      <div className={styles.signatureLine}></div>
                    </div>
                  </div>
                </div>

                <div className={styles.signatureBlock}>
                  <div className={styles.signatureRow}>
                    <div className={styles.nameField}>
                      <span className={styles.label}>{t('printedBy', 'Printed by:')}</span>
                      <span className={styles.nameValue}>{userDisplay}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.footerNote}>
                <div className={styles.noteText}>
                  <strong>{t('nb', 'N/B:')}</strong>{' '}
                  {t(
                    'formDuplicateNotes',
                    'This form should be filled in duplicate, one copy to be retained in the mortuary and the other to be left at the main gate',
                  )}
                </div>
              </div>

              <div className={styles.footer}>
                <div className={styles.footerDetails}>
                  <div>
                    {documentId()} | {t('generatedBy', 'Generated By')}: {userDisplay}
                  </div>
                  <div>
                    {t('generationTimestamp', 'Generated')}: {formatDatetime(generationTimestamp)} |{' '}
                    {t('facility', 'Facility')}: {sessionLocation?.display}
                  </div>
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
