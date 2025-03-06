import React, { useRef, useState } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Button, StructuredListSkeleton } from '@carbon/react';
import { formatDate, useLayoutType, useSession } from '@openmrs/esm-framework';
import { usePatientSummary } from '../hooks/usePatientSummary';
import { Printer } from '@carbon/react/icons';
import { useReactToPrint } from 'react-to-print';
import PrintComponent from '../print-layout/print.component';
import styles from './patient-summary.scss';

interface PatientSummaryProps {
  patientUuid: string;
}

const PatientSummary: React.FC<PatientSummaryProps> = ({ patientUuid }) => {
  const { data, error, isLoading } = usePatientSummary(patientUuid);
  const currentUserSession = useSession();
  const componentRef = useRef(null);
  const [printMode, setPrintMode] = useState(false);

  const { t } = useTranslation();
  const isTablet = useLayoutType() == 'tablet';

  const printRef = useReactToPrint({
    content: () => componentRef.current,
    onBeforeGetContent: () => setPrintMode(true),
    onAfterPrint: () => setPrintMode(false),
    pageStyle: styles.pageStyle,
    documentTitle: data?.patientName,
  });

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const handlePrint = async () => {
    await delay(500);
    printRef();
  };

  if (isLoading) {
    return <StructuredListSkeleton role="progressbar" />;
  }

  if (error) {
    return <span>{t('errorPatientSummary', 'Error loading patient summary')}</span>;
  }

  if (Object.keys(data)?.length === 0) {
    return;
  }

  if (Object.keys(data).length > 0) {
    return (
      <div className={styles.bodyContainer} ref={componentRef}>
        {printMode === true && <PrintComponent />}
        <div className={styles.card}>
          <div className={isTablet ? styles.tabletHeading : styles.desktopHeading}>
            <h4 className={styles.title}> {t('patientSummary', 'Patient summary')}</h4>
            {printMode === false && (
              <Button
                size="sm"
                className={styles.btnShow}
                onClick={() => {
                  handlePrint(), setPrintMode(true);
                }}
                kind="tertiary"
                renderIcon={(props) => <Printer size={16} {...props} />}
                iconDescription={t('print', 'Print')}>
                {t('print', 'Print')}
              </Button>
            )}
          </div>
          <div className={styles.container}>
            <div className={styles.content}>
              <p className={styles.label}>{t('reportDate', 'Report date')}</p>
              <p>
                <span className={styles.value}>
                  {data?.reportDate ? formatDate(new Date(data?.reportDate), { noToday: true }) : '--'}
                </span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('clinicName', 'Clinic name')}</p>
              <p>
                <span className={styles.value}>{data?.clinicName ? data?.clinicName : '--'}</span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('mflCode', 'MFL code')}</p>
              <p>
                <span className={styles.value}>{data?.mflCode}</span>
              </p>
            </div>
          </div>

          <div className={styles.container}>
            <div className={styles.content}>
              <p className={styles.label}>{t('uniquePatientIdentifier', 'Unique patient identifier')}</p>
              <p>
                <span className={styles.value}>
                  {data?.uniquePatientIdentifier ? data?.uniquePatientIdentifier : '--'}
                </span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>
                {t('nationalUniquePatientIdentifier', 'National unique patient identifier')}
              </p>
              <p>
                <span className={styles.value}>
                  {data?.nationalUniquePatientIdentifier ? data?.nationalUniquePatientIdentifier : '--'}
                </span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('patientName', 'Patient name')}</p>
              <p>
                <span className={styles.value}>{data?.patientName ? data?.patientName : '--'}</span>
              </p>
            </div>
          </div>

          <div className={styles.container}>
            <div className={styles.content}>
              <p className={styles.label}>{t('birthDate', 'Birth date')}</p>
              <p>
                <span className={styles.value}>{data?.birthDate ? formatDate(new Date(data?.birthDate)) : '--'}</span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('age', 'Age')}</p>
              <p>
                <span className={styles.value}>{data?.age ? data?.age : '--'}</span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('gender', 'Gender')}</p>
              <p>
                <span className={styles.value}>
                  {data?.gender === 'F' ? 'Female' : data?.gender === 'M' ? 'Male' : 'Unknown'}
                </span>
              </p>
            </div>
          </div>

          <div className={styles.container}>
            <div className={styles.content}>
              <p className={styles.label}>{t('maritalStatus', 'Marital status')}</p>
              <p>
                <span className={styles.value}>{data?.maritalStatus ? data?.maritalStatus : '--'}</span>
              </p>
            </div>
          </div>

          <hr />

          <div className={styles.container}>
            <div className={styles.content}>
              <p className={styles.label}>{t('dateConfirmedPositive', 'Date confirmed HIV positive')}</p>
              <p>
                <span className={styles.value}>
                  {data?.dateConfirmedHIVPositive ? formatDate(new Date(data?.dateConfirmedHIVPositive)) : '--'}
                </span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('firstCD4', 'First CD4')}</p>
              <p>
                <span className={styles.value}>{data?.firstCd4 ? data?.firstCd4 : '--'}</span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('dateFirstCD4', 'Date first CD4')}</p>
              <p>
                <span className={styles.value}>
                  {data?.firstCd4Date === 'N/A' || data?.firstCd4Date === '' ? (
                    <span>None</span>
                  ) : (
                    <span>{data?.firstCd4Date ? formatDate(new Date(data?.firstCd4Date)) : '--'}</span>
                  )}
                </span>
              </p>
            </div>
          </div>

          <div className={styles.container}>
            <div className={styles.content}>
              <p className={styles.label}>{t('dateEnrolledToCare', 'Date enrolled into care')}</p>
              <p>
                <span className={styles.value}>
                  {data?.dateEnrolledIntoCare ? formatDate(new Date(data?.dateEnrolledIntoCare)) : '--'}
                </span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('whoAtEnrollment', 'WHO stage at enrollment')}</p>
              <p>
                <span className={styles.value}>
                  {data?.whoStagingAtEnrollment ? data?.whoStagingAtEnrollment : '--'}
                </span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('transferInDate', 'Transfer in date')}</p>
              <p>
                <span className={styles.value}>
                  {data?.transferInDate === 'N/A' || data?.transferInDate === '' ? (
                    <span>None</span>
                  ) : (
                    <span>{data?.transferInDate}</span>
                  )}
                </span>
              </p>
            </div>
          </div>

          <div className={styles.container}>
            <div className={styles.content}>
              <p className={styles.label}>{t('entryPoint', 'Entry point')}</p>
              <p>
                <span className={styles.value}>{data?.patientEntryPoint ? data?.patientEntryPoint : '--'}</span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('dateOfEntryPoint', 'Date of entry point')}</p>
              <p>
                <span className={styles.value}>
                  {data?.patientEntryPointDate ? formatDate(new Date(data?.patientEntryPointDate)) : '--'}
                </span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('facilityTransferredFrom', 'Facility transferred from')}</p>
              <p>
                <span className={styles.value}>{data?.transferInFacility ? data?.transferInFacility : '--'}</span>
              </p>
            </div>
          </div>

          <hr />

          <div className={styles.container}>
            <div className={styles.content}>
              <p className={styles.label}>{t('weight', 'Weight')}</p>
              <p>
                <span className={styles.value}>{data?.weight ? data?.weight : '--'}</span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('height', 'Height')}</p>
              <p>
                <span className={styles.value}>{data?.height ? data?.height : '--'}</span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('bmi', 'BMI')}</p>
              <p>
                <span className={styles.value}>{data?.bmi ? data?.bmi : '--'}</span>
              </p>
            </div>
          </div>

          <div className={styles.container}>
            <div className={styles.content}>
              <p className={styles.label}>{t('bloodPressure', 'Blood pressure')}</p>
              <p>
                <span className={styles.value}>
                  {data?.bloodPressure && data?.bpDiastolic ? `${data?.bloodPressure}/${data?.bpDiastolic}` : '--'}
                </span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('oxygenSaturation', 'Oxygen saturation')}</p>
              <p>
                <span className={styles.value}>{data?.oxygenSaturation ? data?.oxygenSaturation : '--'}</span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('respiratoryRate', 'Respiratory rate')}</p>
              <p>
                <span className={styles.value}>{data?.respiratoryRate ? data?.respiratoryRate : '--'}</span>
              </p>
            </div>
          </div>

          <div className={styles.container}>
            <div className={styles.content}>
              <p className={styles.label}>{t('pulseRate', 'Pulse rate')}</p>
              <p>
                <span className={styles.value}>{data?.pulseRate ? data?.pulseRate : '--'}</span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('familyProtection', 'FP method')}</p>
              <p>
                <span className={styles.value}>{data?.familyProtection ? data?.familyProtection : '--'}</span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('tbScreeningOutcome', 'TB screening outcome')}</p>
              <p>
                <span className={styles.value}>{data?.tbScreeningOutcome ? data?.tbScreeningOutcome : '--'}</span>
              </p>
            </div>
          </div>

          <div className={styles.container}>
            <div className={styles.content}>
              <p className={styles.label}>{t('chronicDisease', 'Chronic disease')}</p>
              <p>
                <span className={styles.value}>{data?.chronicDisease ? data?.chronicDisease : '--'}</span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('ioHistory', ' OI history')}</p>
              <p>
                <span className={styles.value}>{data?.iosResults ? data?.iosResults : '--'}</span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('stiScreeningOutcome', 'Sti screening')}</p>
              <p>
                <span className={styles.value}>{data?.stiScreeningOutcome ? data?.stiScreeningOutcome : '--'}</span>
              </p>
            </div>
          </div>

          <div className={styles.container}>
            {data?.gender === 'F' && (
              <div className={styles.content}>
                <p className={styles.label}>{t('caxcScreeningOutcome', 'Caxc screening')}</p>
                <p>
                  <span className={styles.value}>{data?.caxcScreeningOutcome ? data?.caxcScreeningOutcome : '--'}</span>
                </p>
              </div>
            )}

            <div className={styles.content}>
              <p className={styles.label}>{t('dateEnrolledInTb', 'TPT start date')}</p>
              <p>
                <span className={styles.value}>
                  {data?.dateEnrolledInTb === 'None' || data?.dateEnrolledInTb === '' ? (
                    <span>None</span>
                  ) : (
                    <span>{data?.dateEnrolledInTb ? formatDate(new Date(data?.dateEnrolledInTb)) : '--'}</span>
                  )}
                </span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('dateCompletedInTb', 'TPT completion date')}</p>
              <p>
                <span className={styles.value}>
                  {data?.dateCompletedInTb === 'None' || data?.dateCompletedInTb === '' ? (
                    <span>None</span>
                  ) : (
                    <span>{data?.dateCompletedInTb ? formatDate(new Date(data?.dateCompletedInTb)) : '--'}</span>
                  )}
                </span>
              </p>
            </div>
            {data?.gender === 'F' && (
              <div className={styles.content}>
                <p className={styles.label}>{t('lmp', 'LMP')}</p>
                <p>
                  <span className={styles.value}>{data?.lmp ? formatDate(new Date(data?.lmp)) : '--'}</span>
                </p>
              </div>
            )}
          </div>

          <hr />

          <div className={styles.container}>
            <div className={styles.content}>
              <p className={styles.label}>{t('treatmentSupporterName', 'Treatment supporter name')}</p>
              <p>
                <span className={styles.value}>
                  {data?.nameOfTreatmentSupporter ? data?.nameOfTreatmentSupporter : '--'}
                </span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('treatmentSupporterRelationship', 'Treatment supporter relationship')}</p>
              <p>
                <span className={styles.value}>
                  {data?.relationshipToTreatmentSupporter ? data?.relationshipToTreatmentSupporter : '--'}
                </span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('treatmentSupporterContact', 'Treatment Supporter contact')}</p>
              <p>
                <span className={styles.value}>
                  {data?.contactOfTreatmentSupporter ? data?.contactOfTreatmentSupporter : '--'}
                </span>
              </p>
            </div>
          </div>

          <hr />

          <div className={styles.container}>
            <div className={styles.content}>
              <p className={styles.label}>{t('drugAllergies', 'Drug allergies')}</p>
              <p>
                <span className={styles.value}>{data?.allergies ? data?.allergies : '--'}</span>
              </p>
            </div>
          </div>

          <hr />

          <div className={styles.container}>
            <div className={styles.content}>
              <p className={styles.label}>{t('previousART', 'Previous ART')}</p>
              <p>
                <span className={styles.value}>{data?.previousArtStatus ? data?.previousArtStatus : '--'}</span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('dateStartedART', 'Date started ART')}</p>
              <p>
                <span className={styles.value}>
                  {data?.dateStartedArt ? formatDate(new Date(data?.dateStartedArt)) : '--'}
                </span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('clinicalStageART', 'Clinical stage at ART')}</p>
              <p>
                <span className={styles.value}>{data?.whoStageAtArtStart ? data?.whoStageAtArtStart : '--'}</span>
              </p>
            </div>
          </div>

          <div className={styles.container}>
            <div className={styles.content}>
              <p className={styles.label}>{t('purposeDrugs', 'Purpose drugs')}</p>
              <p>
                <span className={styles.value}>{data?.purposeDrugs ? data?.purposeDrugs : 'None'}</span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('purposeDate', 'Purpose drugs date')}</p>
              <p>
                <span className={styles.value}>
                  {data?.purposeDate ? formatDate(new Date(data?.purposeDate)) : 'None'}
                </span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('cd4AtArtStart', 'CD4 at ART start')}</p>
              <p>
                <span className={styles.value}>{data?.cd4AtArtStart ? data?.cd4AtArtStart : '--'}</span>
              </p>
            </div>
          </div>

          <div className={styles.container}>
            <div className={styles.content}>
              <p className={styles.label}>{t('initialRegimen', 'Initial regimen')}</p>
              <p>
                <span className={styles.value}>
                  {data?.firstRegimen ? data?.firstRegimen?.regimenShortDisplay : '--'}
                </span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('initialRegimenDate', 'Initial regimen date')}</p>
              <p>
                <span className={styles.value}>{data?.firstRegimen ? data?.firstRegimen?.startDate : '--'}</span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('currentArtRegimen', 'Current Art regimen')}</p>
              <p>
                <span className={styles.value}>
                  {data?.currentArtRegimen ? data?.currentArtRegimen?.regimenShortDisplay : '--'}
                </span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('currentArtRegimenDate', 'Current Art regimen date')}</p>
              <p>
                <span className={styles.value}>
                  {data?.currentArtRegimen ? formatDate(new Date(data?.currentArtRegimen?.startDate)) : '--'}
                </span>
              </p>
            </div>
          </div>

          <hr />

          <div className={styles.container}>
            <div className={styles.content}>
              <p className={styles.label}>{t('artInterruptionReason', 'ART interruptions reason')}</p>
              <p>
                <span className={styles.value}>--</span>
                <span className={styles.label}> </span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>
                {t('substitutionWithin1stLineRegimen', 'Substitution within 1st line regimen')}
              </p>
              <p>
                <span className={styles.value}>--</span>
                <span className={styles.label}> </span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('switchTo2ndLineRegimen', 'Switch to 2nd line regimen')}</p>
              <p>
                <span className={styles.value}>--</span>
                <span className={styles.label}> </span>
              </p>
            </div>
          </div>

          <div className={styles.container}>
            <div className={styles.content}>
              <p className={styles.label}>{t('Dapsone', 'Dapsone')}</p>
              <p>
                <span className={styles.value}>{data?.dapsone ? data?.dapsone : '--'}</span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('tpt', 'TPT')}</p>
              <p>
                <span className={styles.value}>{data?.onIpt ? data?.onIpt : '--'}</span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('clinicsEnrolled', 'Clinics enrolled')}</p>
              <p>
                <span className={styles.value}>{data?.clinicsEnrolled ? data?.clinicsEnrolled : '--'}</span>
              </p>
            </div>
          </div>

          <div className={styles.container}>
            <div className={styles.content}>
              <p className={styles.label}>{t('transferOutDate', 'Transfer out date')}</p>
              <p>
                <span className={styles.value}>
                  {data?.transferOutDate === 'N/A' || data?.transferOutDate === '' ? (
                    <span>None</span>
                  ) : (
                    <span>{data?.transferOutDate ? formatDate(new Date(data?.transferOutDate)) : '--'}</span>
                  )}
                </span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('transferOutFacility', 'Transfer out facility')}</p>
              <p>
                <span className={styles.value}>{data?.transferOutFacility ? data?.transferOutFacility : '--'}</span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('deathDate', 'Death date')}</p>
              <p>
                <span className={styles.value}>
                  {data?.deathDate === 'N/A' || data?.deathDate === '' ? (
                    <span>None</span>
                  ) : (
                    <span>{data?.deathDate ? formatDate(new Date(data?.deathDate)) : '--'}</span>
                  )}
                </span>
              </p>
            </div>
          </div>

          <div className={styles.container}>
            <div className={styles.content}>
              <p className={styles.label}>{t('mostRecentCD4', 'Most recent CD4')}</p>
              <p>
                <span className={styles.value}>{data?.mostRecentCd4 ? data?.mostRecentCd4 : ''}</span>
                <span className={styles.label}>
                  {data?.mostRecentCd4Date === 'N/A' || data?.mostRecentCd4Date === '' ? (
                    <span>None</span>
                  ) : (
                    <span>{data?.mostRecentCd4Date ? formatDate(new Date(data?.mostRecentCd4Date)) : '--'}</span>
                  )}
                </span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('mostRecentVL', 'Most recent VL')}</p>
              <p>
                <span className={styles.value}>{data?.viralLoadValue ? data?.viralLoadValue : '--'}</span>
                <span className={styles.label}>
                  {data?.viralLoadDate === 'N/A' || data?.viralLoadDate === '' ? (
                    <span>None</span>
                  ) : (
                    <span>{data?.viralLoadDate ? formatDate(new Date(data?.viralLoadDate)) : '--'}</span>
                  )}
                </span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('nextAppointmentDate', ' Next appointment')}</p>
              <p>
                <span className={styles.value}>
                  {data?.nextAppointmentDate ? formatDate(new Date(data?.nextAppointmentDate)) : 'None'}
                </span>
              </p>
            </div>
          </div>

          <div className={styles.container}>
            <div className={styles.content}>
              <p className={styles.label}>{t('viralLoadTrends', 'Viral load trends')}</p>
              {data?.allVlResults?.value?.length > 0
                ? data?.allVlResults?.value?.map((vl, index) => {
                    return (
                      <div key={`vl-${index}`}>
                        <span className={styles.value}> {vl.vl} </span>
                        {vl?.vlDate === 'N/A' || vl?.vlDate === '' ? (
                          <span>None</span>
                        ) : (
                          <span>({vl?.vlDate ? vl?.vlDate : '--'})</span>
                        )}
                        <br />
                      </div>
                    );
                  })
                : '--'}
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('cd4Trends', 'CD4 Trends')}</p>
              {data?.allCd4CountResults?.length > 0
                ? data?.allCd4CountResults?.map((cd4, index) => {
                    return (
                      <div key={`cd4Trend-${cd4?.cd4Count}-${index}`}>
                        <span className={styles.value}>{cd4?.cd4Count}</span>
                        {cd4?.cd4Count === 'N/A' || cd4?.cd4Count === '' ? (
                          <span>None</span>
                        ) : (
                          <span>( {cd4?.cd4CountDate ? cd4?.cd4CountDate : '--'})</span>
                        )}
                        <br />
                      </div>
                    );
                  })
                : '--'}
            </div>
          </div>

          <hr />

          <div className={styles.container}>
            <div className={styles.content}>
              <p className={styles.label}>{t('clinicalNotes', 'Clinical notes')}</p>
              <p>
                <span className={styles.value}>--</span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('clinicianName', 'Clinician name')}</p>
              <p>
                <span className={styles.value}>
                  {currentUserSession?.user?.person?.display
                    ? currentUserSession?.user?.person?.display
                    : t('none', 'None')}
                </span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('clinicianSignature', 'Clinician signature')}</p>
              <p>
                <span className={styles.value}>
                  {currentUserSession?.user?.person?.display
                    ? currentUserSession?.user?.person?.display
                    : t('none', 'None')}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default PatientSummary;
