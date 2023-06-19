import React from 'react';
import styles from './patient-summary.scss';
import { useTranslation } from 'react-i18next';
import { useLayoutType } from '@openmrs/esm-framework';
import { StructuredListSkeleton, Button } from '@carbon/react';
import { usePatientSummary } from '../hooks/usePatientSummary';
import { Printer } from '@carbon/react/icons';

interface PatientSummaryProps {
  patientUuid: string;
}

const PatientSummary: React.FC<PatientSummaryProps> = ({ patientUuid }) => {
  const { data, isError, isLoading } = usePatientSummary(patientUuid);

  console.log('data', data);
  const { t } = useTranslation();
  const isTablet = useLayoutType() == 'tablet';

  if (isLoading) {
    return <StructuredListSkeleton role="progressbar" />;
  }

  if (isError) {
    return <span>{t('errorPatientSummary', 'Error loading patient summary')}</span>;
  }

  if (Object.keys(data)?.length === 0) {
    return;
  }

  if (Object.keys(data).length > 0) {
    return (
      <div className={styles.bodyContainer}>
        <div className={styles.card}>
          <div className={isTablet ? styles.tabletHeading : styles.desktopHeading}>
            <h4 className={styles.title}> {t('patientSummary', 'Patient summary')}</h4>
            <Button
              size="sm"
              kind="tertiary"
              renderIcon={(props) => <Printer size={16} {...props} />}
              iconDescription={t('print', 'Print')}>
              {t('print', 'Print')}
            </Button>
          </div>
          <div className={styles.container}>
            <div className={styles.content}>
              <p className={styles.label}>{t('reportDate', 'Report date')}</p>
              <p>
                <span className={styles.value}>{data?.reportDate}</span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('clinicName', 'Clinic name')}</p>
              <p>
                <span className={styles.value}>{data?.clinicName}</span>
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
                <span className={styles.value}>{data?.uniquePatientIdentifier}</span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('patientName', 'Patient name')}</p>
              <p>
                <span className={styles.value}>{data?.patientName}</span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('birthDate', 'Birth date')}</p>
              <p>
                <span className={styles.value}>{data?.birthDate}</span>
              </p>
            </div>
          </div>

          <div className={styles.container}>
            <div className={styles.content}>
              <p className={styles.label}>{t('age', 'Age')}</p>
              <p>
                <span className={styles.value}>{data?.age}</span>
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
            <div className={styles.content}>
              <p className={styles.label}>{t('maritalStatus', 'Marital status')}</p>
              <p>
                <span className={styles.value}>{data?.maritalStatus}</span>
              </p>
            </div>
          </div>

          <hr />

          <div className={styles.container}>
            <div className={styles.content}>
              <p className={styles.label}>{t('dateConfirmedPositive', 'Date confirmed HIV positive')}</p>
              <p>
                <span className={styles.value}>{data?.dateConfirmedHIVPositive}</span>
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
                <span className={styles.value}>{data?.firstCd4Date}</span>
              </p>
            </div>
          </div>

          <div className={styles.container}>
            <div className={styles.content}>
              <p className={styles.label}>{t('dateEnrolledToCare', 'Date enrolled into care')}</p>
              <p>
                <span className={styles.value}>{data?.dateEnrolledIntoCare}</span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('whoAtEnrollment', 'WHO stage at enrollment')}</p>
              <p>
                <span className={styles.value}>{data?.whoStagingAtEnrollment}</span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('transferInDate', 'Transfer in date')}</p>
              <p>
                <span className={styles.value}>{data?.transferInDate ? data?.transferInDate : '--'}</span>
              </p>
            </div>
          </div>

          <div className={styles.container}>
            <div className={styles.content}>
              <p className={styles.label}>{t('entryPoint', 'Entry point')}</p>
              <p>
                <span className={styles.value}>{data?.patientEntryPoint}</span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('dateOfEntryPoint', 'Date of entry point')}</p>
              <p>
                <span className={styles.value}>{data?.patientEntryPointDate}</span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('facilityTransferredFrom', 'Facility transferred from')}</p>
              <p>
                <span className={styles.value}>{data?.transferInFacility}</span>
              </p>
            </div>
          </div>

          <hr />

          <div className={styles.container}>
            <div className={styles.content}>
              <p className={styles.label}>{t('weight', 'Weight')}</p>
              <p>
                <span className={styles.value}>{data?.weight}</span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('height', 'Height')}</p>
              <p>
                <span className={styles.value}>{data?.height}</span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('bmi', 'BMI')}</p>
              <p>
                <span className={styles.value}>{data?.bmi}</span>
              </p>
            </div>
          </div>

          <div className={styles.container}>
            <div className={styles.content}>
              <p className={styles.label}>{t('bloodPressure', 'Blood pressure')}</p>
              <p>
                <span className={styles.value}>{data?.bloodPressure}</span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('oxygenSaturation', 'Oxygen saturation')}</p>
              <p>
                <span className={styles.value}>{data?.oxygenSaturation}</span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('respiratoryRate', 'Respiratory rate')}</p>
              <p>
                <span className={styles.value}>{data?.respiratoryRate}</span>
              </p>
            </div>
          </div>

          <div className={styles.container}>
            <div className={styles.content}>
              <p className={styles.label}>{t('pulseRate', 'Pulse rate')}</p>
              <p>
                <span className={styles.value}>{data?.pulseRate}</span>
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
                <span className={styles.value}>{data?.tbScreeningOutcome}</span>
              </p>
            </div>
          </div>

          <div className={styles.container}>
            <div className={styles.content}>
              <p className={styles.label}>{t('chronicDisease', 'Chronic disease')}</p>
              <p>
                <span className={styles.value}>{data?.chronicDisease}</span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('ioHistory', '	OI history')}</p>
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
                  <span className={styles.value}>{data?.caxcScreeningOutcome}</span>
                </p>
              </div>
            )}

            <div className={styles.content}>
              <p>{t('dateEnrolledInTb', 'TPT start date')}</p>
              <p>
                <span className={styles.value}>{data?.dateEnrolledInTb}</span>
              </p>
            </div>
            <div className={styles.content}>
              <p>{t('dateCompletedInTb', 'TPT completion date')}</p>
              <p>
                <span className={styles.value}>{data?.dateCompletedInTb}</span>
              </p>
            </div>
            {data?.gender === 'F' && (
              <div className={styles.content}>
                <p>{t('lmp', 'LMP')}</p>
                <p>
                  <span className={styles.value}>{data?.lmp}</span>
                </p>
              </div>
            )}
          </div>

          <hr />

          <div className={styles.container}>
            <div className={styles.content}>
              <p className={styles.label}>{t('treatmentSupporterName', 'Treatment supporter name')}</p>
              <p>
                <span className={styles.value}>{data?.nameOfTreatmentSupporter}</span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('treatmentSupporterRelationship', 'Treatment supporter	relationship')}</p>
              <p>
                <span className={styles.value}>{data?.relationshipToTreatmentSupporter}</span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('treatmentSupporterContact', 'Treatment Supporter contact')}</p>
              <p>
                <span className={styles.value}>{data?.contactOfTreatmentSupporter}</span>
              </p>
            </div>
          </div>

          <hr />

          <div className={styles.container}>
            <div className={styles.content}>
              <p className={styles.label}>{t('drugAllergies', 'Drug allergies')}</p>
              <p>
                <span className={styles.value}>{data?.allergies}</span>
              </p>
            </div>
          </div>

          <hr />

          <div className={styles.container}>
            <div className={styles.content}>
              <p className={styles.label}>{t('previousART', 'Previous ART')}</p>
              <p>
                <span className={styles.value}>{data?.previousArtStatus}</span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('dateStartedART', 'Date started ART')}</p>
              <p>
                <span className={styles.value}>{data?.dateStartedArt}</span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('clinicalStageART', 'Clinical stage at ART')}</p>
              <p>
                <span className={styles.value}>{data?.whoStageAtArtStart}</span>
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
                <span className={styles.value}>{data?.purposeDate ? data?.purposeDate : 'None'}</span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('cd4AtArtStart', 'CD4 at ART start')}</p>
              <p>
                <span className={styles.value}>{data?.cd4AtArtStart}</span>
              </p>
            </div>
          </div>

          <div className={styles.container}>
            <div className={styles.content}>
              <p className={styles.label}>{t('firstRegimen', 'First regimen')}</p>
              <p>
                <span className={styles.value}>{data?.firstRegimen}</span>
              </p>
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{t('currentArtRegimen', 'Current Art regimen')}</p>
              <p>
                <span className={styles.value}>{data?.currentArtRegimen}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default PatientSummary;
