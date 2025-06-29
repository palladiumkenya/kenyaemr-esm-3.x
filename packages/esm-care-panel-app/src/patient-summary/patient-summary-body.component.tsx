import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSession } from '@openmrs/esm-framework';
import PatientSummaryRow from './patient-summary-row.component';
import styles from './patient-summary.scss';
import { type PatientSummary } from '../types';

function capitalizeEveryWord(str) {
  if (!str) {
    return '';
  }
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

interface PatientSummaryBodyProps {
  data: PatientSummary;
}

const PatientSummaryBody: React.FC<PatientSummaryBodyProps> = ({ data }) => {
  const { t } = useTranslation();
  const currentUserSession = useSession();

  return (
    <>
      <PatientSummaryRow
        items={[
          { label: t('reportDate', 'Report Date'), value: data?.reportDate, isDate: true },
          { label: t('clinicName', 'Clinic Name'), value: data?.clinicName },
          { label: t('mflCode', 'MFL Code'), value: data?.mflCode },
        ]}
      />

      <PatientSummaryRow
        items={[
          { label: t('uniquePatientIdentifier', 'Unique Patient Identifier'), value: data?.uniquePatientIdentifier },
          {
            label: t('nationalUniquePatientIdentifier', 'National Unique Patient Identifier'),
            value: data?.nationalUniquePatientIdentifier,
          },
          { label: t('patientName', 'Patient Name'), value: capitalizeEveryWord(data?.patientName) },
        ]}
      />

      <PatientSummaryRow
        items={[
          { label: t('birthDate', 'Birth Date'), value: data?.birthDate, isDate: true },
          { label: t('age', 'Age'), value: data?.age },
          { label: t('gender', 'Gender'), value: data?.gender, isGender: true },
        ]}
      />

      <PatientSummaryRow items={[{ label: t('maritalStatus', 'Marital Status'), value: data?.maritalStatus }]} />

      <div className={styles.divider} />

      <PatientSummaryRow
        items={[
          {
            label: t('dateConfirmedPositive', 'Date Confirmed Positive'),
            value: data?.dateConfirmedHIVPositive,
            isDate: true,
          },
          { label: t('firstCD4', 'First CD4'), value: data?.firstCd4 },
          { label: t('dateFirstCD4', 'Date First CD4'), value: data?.firstCd4Date, isNone: true },
        ]}
      />

      <PatientSummaryRow
        items={[
          { label: t('dateEnrolledToCare', 'Date Enrolled to Care'), value: data?.dateEnrolledIntoCare, isDate: true },
          { label: t('whoAtEnrollment', 'WHO at Enrollment'), value: data?.whoStagingAtEnrollment },
          { label: t('transferInDate', 'Transfer In Date'), value: data?.transferInDate, isNone: true },
        ]}
      />

      <PatientSummaryRow
        items={[
          { label: t('entryPoint', 'Entry Point'), value: data?.patientEntryPoint },
          { label: t('dateOfEntryPoint', 'Date of Entry Point'), value: data?.patientEntryPointDate, isDate: true },
          { label: t('facilityTransferredFrom', 'Facility Transferred From'), value: data?.transferInFacility },
        ]}
      />

      <div className={styles.divider} />

      <PatientSummaryRow
        items={[
          { label: t('weight', 'Weight'), value: data?.weight },
          { label: t('height', 'Height'), value: data?.height },
          { label: t('bmi', 'BMI'), value: data?.bmi },
        ]}
      />

      <PatientSummaryRow
        items={[
          {
            label: t('bloodPressure', 'Blood Pressure'),
            value: data?.bloodPressure && data?.bpDiastolic ? `${data?.bloodPressure}/${data?.bpDiastolic}` : null,
          },
          { label: t('oxygenSaturation', 'Oxygen Saturation'), value: data?.oxygenSaturation },
          { label: t('respiratoryRate', 'Respiratory Rate'), value: data?.respiratoryRate },
        ]}
      />

      <PatientSummaryRow
        items={[
          { label: t('pulseRate', 'Pulse Rate'), value: data?.pulseRate },
          { label: t('familyProtection', 'Family Protection'), value: data?.familyProtection },
          { label: t('tbScreeningOutcome', 'TB Screening Outcome'), value: data?.tbScreeningOutcome },
        ]}
      />

      <PatientSummaryRow
        items={[
          { label: 'chronicDisease', value: data?.chronicDisease },
          { label: 'ioHistory', value: data?.iosResults },
          { label: 'stiScreeningOutcome', value: data?.stiScreeningOutcome },
        ]}
      />

      <PatientSummaryRow
        items={[
          ...(data?.gender === 'F'
            ? [{ label: t('caxcScreeningOutcome', 'CAXC Screening Outcome'), value: data?.caxcScreeningOutcome }]
            : []),
          { label: t('dateEnrolledInTb', 'Date Enrolled in TB'), value: data?.dateEnrolledInTb, isNone: true },
          { label: t('dateCompletedInTb', 'Date Completed in TB'), value: data?.dateCompletedInTb, isNone: true },
          ...(data?.gender === 'F' ? [{ label: t('lmp', 'LMP'), value: data?.lmp, isDate: true }] : []),
        ]}
      />

      <div className={styles.divider} />

      <PatientSummaryRow
        items={[
          {
            label: t('treatmentSupporterName', 'Treatment Supporter Name'),
            value: capitalizeEveryWord(data?.nameOfTreatmentSupporter),
          },
          {
            label: t('treatmentSupporterRelationship', 'Treatment Supporter Relationship'),
            value: data?.relationshipToTreatmentSupporter,
          },
          {
            label: t('treatmentSupporterContact', 'Treatment Supporter Contact'),
            value: data?.contactOfTreatmentSupporter,
          },
        ]}
      />

      <div className={styles.divider} />

      <PatientSummaryRow items={[{ label: t('drugAllergies', 'Drug Allergies'), value: data?.allergies }]} />

      <div className={styles.divider} />

      <PatientSummaryRow
        items={[
          { label: t('previousART', 'Previous ART'), value: data?.previousArtStatus },
          { label: t('dateStartedART', 'Date Started ART'), value: data?.dateStartedArt, isDate: true },
          { label: t('clinicalStageART', 'Clinical Stage ART'), value: data?.whoStageAtArtStart },
        ]}
      />

      <PatientSummaryRow
        items={[
          { label: t('purposeDrugs', 'Purpose Drugs'), value: data?.purposeDrugs },
          { label: t('purposeDate', 'Purpose Date'), value: data?.purposeDate, isDate: true },
          { label: t('cd4AtArtStart', 'CD4 at ART Start'), value: data?.cd4AtArtStart },
        ]}
      />

      <PatientSummaryRow
        items={[
          { label: t('initialRegimen', 'Initial Regimen'), value: data?.firstRegimen?.regimenShortDisplay },
          { label: t('initialRegimenDate', 'Initial Regimen Date'), value: data?.firstRegimen?.startDate },
          { label: t('currentArtRegimen', 'Current ART Regimen'), value: data?.currentArtRegimen?.regimenShortDisplay },
          {
            label: t('currentArtRegimenDate', 'Current ART Regimen Date'),
            value: data?.currentArtRegimen?.startDate,
            isDate: true,
          },
        ]}
      />

      <div className={styles.divider} />

      <PatientSummaryRow
        items={[
          { label: t('artInterruptionReason', 'ART Interruption Reason'), value: '--' },
          { label: t('substitutionWithin1stLineRegimen', 'Substitution Within 1st Line Regimen'), value: '--' },
          { label: t('switchTo2ndLineRegimen', 'Switch to 2nd Line Regimen'), value: '--' },
        ]}
      />

      <PatientSummaryRow
        items={[
          { label: t('dapsone', 'Dapsone'), value: data?.dapsone },
          {
            label: t('tpt', 'TPT'),
            value: data?.clinicsEnrolled
              ?.toLowerCase()
              .split(',')
              .map((s) => s.trim())
              ?.includes('tpt')
              ? 'Yes'
              : 'No',
          },
          { label: t('clinicsEnrolled', 'Clinics Enrolled'), value: data?.clinicsEnrolled },
        ]}
      />

      <PatientSummaryRow
        items={[
          { label: t('transferOutDate', 'Transfer Out Date'), value: data?.transferOutDate, isNone: true },
          { label: t('transferOutFacility', 'Transfer Out Facility'), value: data?.transferOutFacility },
          { label: t('deathDate', 'Death Date'), value: data?.deathDate, isNone: true },
        ]}
      />

      <PatientSummaryRow
        items={[
          { label: t('mostRecentCD4', 'Most Recent CD4'), value: data?.mostRecentCd4 },
          { label: t('mostRecentVL', 'Most Recent VL'), value: data?.viralLoadValue },
          { label: t('nextAppointmentDate', 'Next Appointment Date'), value: data?.nextAppointmentDate, isDate: true },
        ]}
      />

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

      <div className={styles.divider} />

      <PatientSummaryRow
        items={[
          { label: t('clinicalNotes', 'Clinical Notes'), value: data?.['clinicalNotes'] ?? '--' },
          { label: t('clinicianName', 'Clinician Name'), value: currentUserSession?.user?.person?.display },
          { label: t('clinicianSignature', 'Clinician Signature'), value: currentUserSession?.user?.person?.display },
        ]}
      />
    </>
  );
};

export default PatientSummaryBody;
