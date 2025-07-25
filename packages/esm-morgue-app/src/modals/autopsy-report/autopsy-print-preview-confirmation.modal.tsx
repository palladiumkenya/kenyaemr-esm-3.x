import React, { useRef, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonSet, ModalBody, ModalFooter, InlineNotification, Dropdown } from '@carbon/react';
import { useReactToPrint } from 'react-to-print';
import { formatDate, formatDatetime, isOmrsDateToday, parseDate, useSession } from '@openmrs/esm-framework';
import styles from './autopsy-print-preview-confirmation.scss';
import { type Patient, type Encounter, type Observation, OpenmrsEncounter } from '../../types';
import { documentId, formatDateTime } from '../../utils/utils';
import { Checkbox, CheckboxChecked } from '@carbon/react/icons';
import { usePerson } from '../../deceased-patient-header/deceasedInfo/deceased-info.resource';

type AutopsyReportModalProps = {
  onClose: () => void;
  encounters: OpenmrsEncounter[];
  patientUuid?: string;
};

const AutopsyReportModal: React.FC<AutopsyReportModalProps> = ({ onClose, encounters, patientUuid }) => {
  const { t } = useTranslation();
  const [printError, setPrintError] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const { sessionLocation, user } = useSession();
  const userDisplay = user ? user.display : '';
  const { person } = usePerson(patientUuid);
  const causeOfDeath = person?.causeOfDeath?.display;
  const generationTimestamp = useMemo(() => new Date(), []);

  const sortedEncounters = useMemo(() => {
    return [...encounters].sort(
      (a, b) => new Date(b?.encounterDatetime).getTime() - new Date(a?.encounterDatetime).getTime(),
    );
  }, [encounters]);

  const [selectedEncounter, setSelectedEncounter] = useState<OpenmrsEncounter>(sortedEncounters[0]);

  const encounterDropdownItems = useMemo(() => {
    return sortedEncounters?.map((encounter) => {
      const encounterDate = new Date(encounter?.encounterDatetime);
      return {
        id: encounter?.uuid,
        text: `${isOmrsDateToday(encounterDate)}`,
        encounter: encounter,
      };
    });
  }, [sortedEncounters]);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: 'Post-Mortem Report',
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

  const patient = selectedEncounter;

  const getObservationValue = (conceptName: string): string => {
    const obs = selectedEncounter?.obs?.find(
      (observation) =>
        observation.concept?.display?.toLowerCase().includes(conceptName.toLowerCase()) ||
        observation.concept?.name?.name?.toLowerCase().includes(conceptName.toLowerCase()),
    );

    if (obs?.value) {
      if (typeof obs.value === 'object' && obs.value.name) {
        return obs.value.name.name || String(obs.value);
      }
      return String(obs.value);
    }
    return '';
  };

  const getProviderName = (): string => {
    return (
      selectedEncounter?.encounterProviders?.[0]?.provider?.person?.display ||
      selectedEncounter?.encounterProviders?.[0]?.provider?.name ||
      ''
    );
  };

  const getPatientAddress = () => {
    return getObservationValue('address') || getObservationValue('Address');
  };

  const getPatientAge = () => {
    return getObservationValue('age') || getObservationValue('Age at death');
  };

  const getPatientGender = () => {
    const gender = getObservationValue('gender') || getObservationValue('respondent gender');
    return gender || patient?.person?.gender || '';
  };

  const getPatientName = () => {
    const nameFromObs = getObservationValue('first name') || getObservationValue('name');
    return nameFromObs || patient?.display?.split(' - ')[1] || patient?.display || '';
  };

  const getDataMappings = () => {
    return {
      referenceNumber: getObservationValue('VERBAL AUTOPSY REFERENCE NUMBER'),
      policeStation: getObservationValue('Program name') || '',
      patientName: getPatientName(),
      patientAddress: getPatientAddress(),
      age: getPatientAge(),
      gender: getPatientGender(),
      height: getObservationValue('Height'),
      locationOfDeath: getObservationValue('Location of death'),
      witnessedBy: getObservationValue('Witnessed by'),
      generalExamination: getObservationValue('General examination'),
      physicalExam: getObservationValue('PHYSICAL EXAM'),
      nutritionalStatus: getObservationValue('Nutritional plan'),
      externalFindings: getObservationValue('Face examination finding (text)'),
      headExamination: getObservationValue('Patient-generated history: Head, ears, eyes, nose and throat section text'),
      respiratorySystem: getObservationValue('Respiratory System status text'),
      cardiovascularSystem: getObservationValue('Cardiovascular System Inspection'),
      nervousSystem: getObservationValue('Nervous system examination'),
      spinalExamination: getObservationValue('Spinal physical examination'),
      spinalCord: getObservationValue('Result of spinal cord imaging study'),
      abdominalExamination: getObservationValue('Abdominal examination'),
      upperGI: getObservationValue('Upper gastrointestinal examination'),
      smallIntestine: getObservationValue('Small intestine examination'),
      liverExamination: getObservationValue('Liver examination'),
      kidneyExamination: getObservationValue('Result of kidney or ureter exam'),
      urologicalExamination: getObservationValue('Urological examination'),
      bloodSample: getObservationValue('Peripheral Blood Film  Examination'),
      causeOfDeath: getObservationValue('Test result free text'),
      deathCertificate: getObservationValue('Death certificate'),
      dateTimeRecorded: getObservationValue('Date/time recorded'),
      verificationDateTime: getObservationValue('Datetime of verification'),
      healthWorkerType: getObservationValue('Health worker type'),
      freeTextGeneral: getObservationValue('Free text general'),
      freeTextComment: getObservationValue('Free text comment'),
      abdominalExaminationText: getObservationValue('Abdominal examination (text)'),
      kidneyExaminationText: getObservationValue('Result of kidney or ureter exam (text)'),
      smallIntestineText: getObservationValue('Small intestine examination (text)'),
    };
  };

  const data = getDataMappings();

  return (
    <>
      <ModalBody>
        <div className={styles.container}>
          {encounterDropdownItems.length > 1 && (
            <div className={styles.encounterSelection}>
              <Dropdown
                id="date-selector"
                titleText={t('selectDate', 'Select Date')}
                label={t('chooseExaminationDate', 'Choose examination date')}
                items={encounterDropdownItems}
                selectedItem={encounterDropdownItems.find((item) => item.id === selectedEncounter.uuid)}
                itemToString={(item) => (item ? item.text : '')}
                onChange={({ selectedItem }) => {
                  if (selectedItem) {
                    setSelectedEncounter(selectedItem.encounter);
                  }
                }}
              />
            </div>
          )}

          <div ref={printRef} className={styles.printableContent}>
            <div className={styles.printableHeader}>
              <div className={styles.facilityDetails}>
                <div className={styles.facilityName}>{sessionLocation?.display}</div>
                <div className={styles.heading}>
                  {t('postMortemExaminationReport', 'Post Mortem Examination Report')}
                </div>
                <div className={styles.subheading}>
                  {t('deathInvestigationSection', '(Death Investigation - Section 386 C.P.C)')}
                </div>
              </div>
            </div>

            <div className={styles.printableBody}>
              <div className={styles.formSection}>
                <div className={styles.fieldGroup}>
                  <div className={styles.fieldRow}>
                    <div className={styles.field}>
                      <span className={styles.label}>{t('referenceNo', 'Reference No:')}</span>
                      <span className={styles.value}>{data.referenceNumber}</span>
                    </div>
                    <div className={styles.field}>
                      <span className={styles.label}>{t('date', 'Date:')}</span>
                      <span className={styles.value}>{formatDateTime(new Date(Date.now()))}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.formSection}>
                <div className={styles.fieldGroup}>
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldWide}>
                      <span className={styles.label}>{t('toOfficeInCharge', 'To: The Officer in Charge,')}</span>
                      <span className={styles.value}>{data.policeStation}</span>
                    </div>
                  </div>
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldWide}>
                      <span className={styles.label}>{t('address', 'Address:')}</span>
                      <span className={styles.value}>{data.patientAddress}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.formSection}>
                <div className={styles.fieldGroup}>
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldWide}>
                      <span className={styles.label}>{t('ReferenceBodyOf', 'Reference Body of:')}</span>
                      <span className={styles.value}>{data.patientName}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.formSection}>
                <div className={styles.sectionTitle}>{t('examinationDetails', 'Examination Details')}</div>
                <div className={styles.fieldGroup}>
                  <div className={styles.fieldRow}>
                    <div className={styles.field}>
                      <span className={styles.label}>{t('placeOfPostMortem', 'Place of Post-Mortem:')}</span>
                      <span className={styles.value}>{data?.freeTextComment || sessionLocation?.display}</span>
                    </div>
                  </div>
                  <div className={styles.fieldRow}>
                    <div className={styles.field}>
                      <span className={styles.label}>{t('dateOfPostMortem', 'Date of Post-Mortem:')}</span>
                      <span className={styles.value}>
                        {formatDate(new Date(selectedEncounter?.encounterDatetime), { mode: 'standard' })}
                      </span>
                    </div>
                    <div className={styles.field}>
                      <span className={styles.label}>{t('timeOfPostMortem', 'Time of Post-Mortem:')}</span>
                      <span className={styles.value}>
                        {new Date(selectedEncounter?.encounterDatetime).toLocaleTimeString('en-US', { hour12: false })}
                      </span>
                    </div>
                  </div>
                  <div className={styles.fieldRow}>
                    <div className={styles.field}>
                      <span className={styles.label}>{t('locationOfDeath', 'Location of Death:')}</span>
                      <span className={styles.value}>{data?.locationOfDeath}</span>
                    </div>
                    <div className={styles.field}>
                      <span className={styles.label}>{t('witnessedBy', 'Witnessed by:')}</span>
                      <span className={styles.value}>{data?.witnessedBy}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.formSection}>
                <div className={styles.sectionTitle}>
                  {t('generalObservations', 'GENERAL OBSERVATIONS ON THE BODY')}
                </div>
                <div className={styles.fieldGroup}>
                  <div className={styles.fieldRow}>
                    <div className={styles.field}>
                      <span className={styles.label}>{t('sex', 'Sex:')}</span>
                      <span className={styles.value}>{data?.gender}</span>
                    </div>
                    <div className={styles.field}>
                      <span className={styles.label}>{t('race', 'Race:')}</span>
                      <span className={styles.value}>{data?.freeTextGeneral}</span>
                    </div>
                  </div>
                  <div className={styles.fieldRow}>
                    <div className={styles.field}>
                      <span className={styles.label}>{t('age', 'Age:')}</span>
                      <span className={styles.value}>{data?.age}</span>
                    </div>
                    <div className={styles.field}>
                      <span className={styles.label}>{t('height', 'Height:')}</span>
                      <span className={styles.value}>{data?.height}</span>
                    </div>
                  </div>
                  <div className={styles.fieldRow}>
                    <div className={styles.field}>
                      <span className={styles.label}>{t('nutrition', 'Nutrition:')}</span>
                      <span className={styles.value}>{data?.nutritionalStatus}</span>
                    </div>
                    <div className={styles.field}>
                      <span className={styles.label}>{t('physicalExam', 'Physique:')}</span>
                      <span className={styles.value}>{data?.physicalExam}</span>
                    </div>
                  </div>
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldWide}>
                      <span className={styles.label}>{t('clothing', 'Clothing:')}</span>
                      <div className={styles.largeTextArea}>{data?.generalExamination}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.formSection}>
                <div className={styles.sectionTitle}>{t('externalExamination', 'External Examination')}</div>
                <div className={styles.sectionSubtitle}>
                  {t(
                    'externalExaminationNote',
                    '(Give details of condition, presence or absence of petechiae, cyanosis, etc., and position, nature and dimensions of all external injuries)',
                  )}
                </div>
                <div className={styles.fieldGroup}>
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldWide}>
                      <span className={styles.label}>{t('findings', 'Findings:')}</span>
                      <div className={styles.largeTextArea}>{data?.externalFindings}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.formSection}>
                <div className={styles.sectionTitle}>{t('internalExamination', 'Internal Examination')}</div>
                <div className={styles.fieldGroup}>
                  <div className={styles.systemRow}>
                    <div className={styles.systemField}>
                      <span className={styles.label}>{t('head', 'Head:')}</span>
                      <div className={styles.systemTextArea}>{data?.headExamination}</div>
                    </div>
                  </div>
                  <div className={styles.systemRow}>
                    <div className={styles.systemField}>
                      <span className={styles.label}>{t('respiratorySystem', 'Respiratory System:')}</span>
                      <div className={styles.systemTextArea}>{data.respiratorySystem}</div>
                    </div>
                  </div>
                  <div className={styles.systemRow}>
                    <div className={styles.systemField}>
                      <span className={styles.label}>{t('cardiovascularSystem', 'Cardiovascular System:')}</span>
                      <div className={styles.systemTextArea}>{data.cardiovascularSystem}</div>
                    </div>
                  </div>
                  <div className={styles.systemRow}>
                    <div className={styles.systemField}>
                      <span className={styles.label}>{t('digestiveSystem', 'Digestive System:')}</span>
                      <div className={styles.systemTextArea}>{data.abdominalExaminationText}</div>
                    </div>
                  </div>
                  <div className={styles.systemRow}>
                    <div className={styles.systemField}>
                      <span className={styles.label}>{t('genitourinarySystem', 'Genitourinary System:')}</span>
                      <div className={styles.systemTextArea}>{data.urologicalExamination}</div>
                    </div>
                  </div>
                  <div className={styles.systemRow}>
                    <div className={styles.systemField}>
                      <span className={styles.label}>{t('nervousSystem', 'Nervous System:')}</span>
                      <div className={styles.systemTextArea}>{data.nervousSystem}</div>
                    </div>
                  </div>
                  <div className={styles.systemRow}>
                    <div className={styles.systemField}>
                      <span className={styles.label}>{t('spinalColumn', 'Spinal Column:')}</span>
                      <div className={styles.systemTextArea}>{data.spinalExamination}</div>
                    </div>
                  </div>
                  <div className={styles.systemRow}>
                    <div className={styles.systemField}>
                      <span className={styles.label}>{t('spinalCord', 'Spinal Cord:')}</span>
                      <div className={styles.systemTextArea}>{data.spinalCord}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.formSection}>
                <div className={styles.fieldGroup}>
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldWide}>
                      <span className={styles.label}>{t('causeOfDeath', 'Cause of Death:')}</span>
                      <div className={styles.largeTextArea}>{causeOfDeath}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.formSection}>
                <div className={styles.sectionTitle}>{t('specimens', 'Specimens Collected for Analysis')}</div>
                <div className={styles.sectionSubtitle}>
                  {t('specimensNote', 'The following specimens have been collected for further examination:')}
                </div>
                <div className={styles.fieldGroup}>
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldWide}>
                      <span className={styles.label}>{t('analysis', 'Analysis:')}</span>
                      <div className={styles.largeTextArea}>{data.causeOfDeath}</div>
                    </div>
                  </div>
                </div>
                <div className={styles.fieldGroup}>
                  <div className={styles.specimenGrid}>
                    <div className={styles.specimenOption}>
                      <span className={styles.checkbox}>{data.upperGI ? <CheckboxChecked /> : <Checkbox />}</span>
                      <span className={styles.optionLabel}>{t('stomach', 'Complete Stomach and contents:')}</span>
                      <div className={styles.field}>
                        <span className={styles.value}>{data?.upperGI}</span>
                      </div>
                    </div>
                    <div className={styles.specimenOption}>
                      <span className={styles.checkbox}>
                        {data.liverExamination ? <CheckboxChecked /> : <Checkbox />}
                      </span>
                      <span className={styles.optionLabel}>{t('liver', 'Liver')}</span>
                      <div className={styles.field}>
                        <span className={styles.value}>{data?.liverExamination}</span>
                      </div>
                    </div>
                    <div className={styles.specimenOption}>
                      <span className={styles.checkbox}>
                        {data.smallIntestineText ? <CheckboxChecked /> : <Checkbox />}
                      </span>
                      <span className={styles.optionLabel}>
                        {t('upperPortionOfIntenstine', 'Upper portion of intestine and contents:')}
                      </span>
                      <div className={styles.field}>
                        <span className={styles.value}>{data?.smallIntestineText}</span>
                      </div>
                    </div>
                    <div className={styles.specimenOption}>
                      <span className={styles.checkbox}>
                        {data.kidneyExaminationText ? <CheckboxChecked /> : <Checkbox />}
                      </span>
                      <span className={styles.optionLabel}>{t('kidney', 'Kidney')}</span>
                      <div className={styles.field}>
                        <span className={styles.value}>{data?.kidneyExaminationText}</span>
                      </div>
                    </div>
                    <div className={styles.specimenOption}>
                      <span className={styles.checkbox}>{data.bloodSample ? <CheckboxChecked /> : <Checkbox />}</span>
                      <span className={styles.optionLabel}>{t('blood', 'Blood')}</span>
                      <div className={styles.field}>
                        <span className={styles.value}>{data?.bloodSample}</span>
                      </div>
                    </div>
                    <div className={styles.specimenOption}>
                      {<Checkbox />}
                      <span className={styles.optionLabel}>{t('vomit', 'Vomit')}</span>
                      <div className={styles.field}>
                        <span className={styles.value}></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.formSection}>
                <div className={styles.fieldGroup}>
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldWide}>
                      <span className={styles.label}>
                        {t(
                          'opinionConclusion',
                          'As a result of my examination, I formed the opinion that the cause of death was:',
                        )}
                      </span>
                      <div className={styles.largeTextArea}></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.formSection}>
                <div className={styles.fieldGroup}>
                  <div className={styles.fieldRow}>
                    <div className={styles.field}>
                      <span className={styles.label}>{t('deathCertificateNo', 'Death Certificate No:')}</span>
                      <span className={styles.value}>{data.deathCertificate}</span>
                    </div>
                    <div className={styles.field}>
                      <span className={styles.label}>{t('issuedDate', 'Date Issued:')}</span>
                      <span className={styles.value}>{formatDateTime(new Date(Date.now()))}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.signaturesSection}>
                <div className={styles.signatureBlock}>
                  <div className={styles.signatureRow}>
                    <div className={styles.nameField}>
                      <span className={styles.label}>{t('examinedBy', 'Examined by:')}</span>
                      <span className={styles.nameValue}>{getProviderName()}</span>
                    </div>
                    <div className={styles.signField}>
                      <span className={styles.label}>{t('signature', 'Signature:')}</span>
                      <div className={styles.signatureLine}></div>
                    </div>
                    <div className={styles.dateField}>
                      <span className={styles.label}>{t('date', 'Date:')}</span>
                      <div className={styles.signatureLine}></div>
                    </div>
                  </div>
                  <div className={styles.qualificationRow}>
                    <span className={styles.label}>{t('qualification', 'Qualification/Title:')}</span>
                    <span className={styles.value}>{data.healthWorkerType}</span>
                  </div>
                </div>

                <div className={styles.signatureBlock}>
                  <div className={styles.signatureRow}>
                    <div className={styles.nameField}>
                      <span className={styles.label}>{t('witnessedBy', 'Witnessed by:')}</span>
                      <span className={styles.nameValue}>{data.witnessedBy}</span>
                    </div>
                    <div className={styles.signField}>
                      <span className={styles.label}>{t('signature', 'Signature:')}</span>
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
              <div className={styles.footer}>
                <div className={styles.footerText}>
                  {t(
                    'reportFooter',
                    'This report is issued in accordance with Section 386 of the Criminal Procedure Code (Cap 75) of the Laws of Kenya.',
                  )}
                </div>
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

export default AutopsyReportModal;
