import React from 'react';
import styles from './program-summary.scss';
import { useProgramSummary } from '../hooks/useProgramSummary';
import { useTranslation } from 'react-i18next';
import { formatDate, useLayoutType } from '@openmrs/esm-framework';
import { StructuredListSkeleton, Tile } from '@carbon/react';
import { ProgramType, RegimenType } from '../types';
import RegimenButton from '../regimen-editor/regimen-button.component';
import { useRegimenEncounter } from '../hooks/useRegimenEncounter';
export interface ProgramSummaryProps {
  patientUuid: string;
  programName: string;
}
const ProgramSummary: React.FC<ProgramSummaryProps> = ({ patientUuid, programName }) => {
  const { data, isError, isLoading } = useProgramSummary(patientUuid);
  const { t } = useTranslation();
  const { regimenEncounter } = useRegimenEncounter(RegimenType[programName], patientUuid);

  const isTablet = useLayoutType() == 'tablet';
  if (isLoading) {
    return <StructuredListSkeleton role="progressbar" />;
  }
  if (isError) {
    return <span>{t('errorProgramSummary', 'Error loading HIV summary')}</span>;
  }
  if (Object.keys(data ?? {})?.length === 0) {
    return;
  }
  if (Object.keys(data ?? {}).length > 0) {
    return (
      <>
        {Object.entries(data).map(([key, val]) =>
          key == ProgramType.HIV && programName == ProgramType.HIV ? (
            <Tile>
              <div className={styles.card}>
                <div className={isTablet ? styles.tabletHeading : styles.desktopHeading}>
                  <h4 className={styles.title}> {t('currentStatus', 'Current status')}</h4>
                </div>
                <div className={styles.container}>
                  <div className={styles.content}>
                    <p>{t('lastViralLoad', 'Last viral load')}</p>
                    <p>
                      {' '}
                      <span className={styles.value}>{data?.HIV?.ldlValue ? data?.HIV?.ldlValue : '--'}</span>
                      {data?.HIV?.ldlDate ? <span>({formatDate(new Date(data?.HIV?.ldlDate))})</span> : ''}
                    </p>
                  </div>
                  <div className={styles.content}>
                    <p>{t('lastCd4Count', 'Last CD4 count')}</p>
                    <p>
                      <span className={styles.value}>{data?.HIV?.cd4 ? data?.HIV?.cd4 : '--'}</span>
                      {data?.HIV?.cd4Date ? <span> ({formatDate(new Date(data?.HIV?.cd4Date))}) </span> : ''}
                    </p>
                  </div>
                  <div className={styles.content}>
                    <p>{t('CD4Percentage', 'CD4 percentage')}</p>
                    <p>
                      <span className={styles.value}>{data?.HIV?.cd4Percent ? data?.HIV?.cd4Percent : '--'}</span>
                      {data?.HIV?.cd4PercentDate ? (
                        <span>({formatDate(new Date(data?.HIV?.cd4PercentDate))}) </span>
                      ) : (
                        ''
                      )}
                    </p>
                  </div>
                  <div className={styles.content}>
                    <p>{t('lastWhoStage', 'Last WHO stage')}</p>
                    <p>
                      <span className={styles.value}>
                        {t('whoStage', 'WHO STAGE')} {data?.HIV?.whoStage ? data?.HIV?.whoStage : '--'}
                      </span>
                      {data?.HIV?.whoStageDate ? <span> ({formatDate(new Date(data?.HIV?.whoStageDate))}) </span> : ''}
                    </p>
                  </div>
                  <div className={styles.content}>
                    <p>{t('regimen', 'Regimen')}</p>
                    <p className={styles.value}>
                      {data?.HIV?.lastEncDetails?.regimenShortDisplay
                        ? data?.HIV?.lastEncDetails?.regimenShortDisplay
                        : t('neverOnArvRegimen', 'Never on ARVs')}
                      <span>
                        <RegimenButton
                          patientUuid={patientUuid}
                          category={programName}
                          onRegimen={
                            data?.HIV?.lastEncDetails?.regimenShortDisplay
                              ? data?.HIV?.lastEncDetails?.regimenShortDisplay
                              : ''
                          }
                          lastRegimenEncounter={regimenEncounter}
                        />
                      </span>
                    </p>
                  </div>
                  <div className={styles.content}>
                    <p>{t('regimenStartDate', ' Date started regimen')}</p>
                    <p className={styles.value}>
                      {data?.HIV?.lastEncDetails?.startDate
                        ? formatDate(new Date(data?.HIV?.lastEncDetails?.startDate))
                        : '--'}
                    </p>
                  </div>
                </div>
              </div>
            </Tile>
          ) : key == ProgramType.TB && programName == ProgramType.TB ? (
            <Tile>
              <div className={styles.card}>
                <div className={isTablet ? styles.tabletHeading : styles.desktopHeading}>
                  <h4 className={styles.title}> {t('currentStatus', 'Current status')}</h4>
                </div>
                <div className={styles.container}>
                  <div className={styles.content}>
                    <p>{t('treatmentNumber:', 'Treatment number')}</p>
                    <p>
                      <span className={styles.value}>
                        {data?.TB?.tbTreatmentNumber ? data?.TB?.tbTreatmentNumber : '--'}
                      </span>
                    </p>
                  </div>
                  <div className={styles.content}>
                    <p>{t('diseaseClassification', 'Disease classification')}</p>
                    <p>
                      <span className={styles.value}>
                        {data?.TB?.tbDiseaseClassification ? data?.TB?.tbDiseaseClassification : '--'}
                      </span>
                      {data?.TB?.tbDiseaseClassificationDate ? (
                        <span> ({formatDate(new Date(data?.TB?.tbDiseaseClassificationDate.toString()))}) </span>
                      ) : (
                        ''
                      )}
                    </p>
                  </div>
                  <div className={styles.content}>
                    <p>{t('patientClassification', 'Patient classification')}</p>
                    <p>
                      <span className={styles.value}>
                        {data?.TB?.tbPatientClassification ? data?.TB?.tbPatientClassification : '--'}
                      </span>
                    </p>
                  </div>
                  <div className={styles.content}>
                    <p>{t('regimen', 'Regimen')}</p>
                    <p>
                      <span className={styles.value}>
                        {data?.TB?.lastTbEncounter
                          ? data?.TB?.lastTbEncounter?.regimenShortDisplay
                          : t('neverOnTbRegimen', 'Never on TB regimen')}
                      </span>
                      <RegimenButton
                        patientUuid={patientUuid}
                        category={programName}
                        onRegimen={data?.TB?.lastTbEncounter ? data?.TB?.lastTbEncounter?.regimenShortDisplay : ''}
                        lastRegimenEncounter={regimenEncounter}
                      />
                    </p>
                  </div>
                  <div className={styles.content}>
                    <p>{t('regimenStartDate', ' Date started regimen')}</p>
                    <p>
                      <span className={styles.value}>
                        {data?.HIV?.lastEncDetails?.startDate
                          ? formatDate(new Date(data?.HIV?.lastEncDetails?.startDate))
                          : '--'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </Tile>
          ) : key == ProgramType.MCHMOTHER && programName == ProgramType.MCHMOTHER ? (
            <Tile>
              <div className={styles.card}>
                <div className={isTablet ? styles.tabletHeading : styles.desktopHeading}>
                  <h4 className={styles.title}> {t('currentStatus', 'Current status')}</h4>
                </div>
                <div className={styles.container}>
                  <div className={styles.content}>
                    <p>{t('hivStatus:', 'HIV status')}</p>
                    <p>
                      <span className={styles.value}>
                        {data?.mchMother?.hivStatus ? data?.mchMother?.hivStatus : '--'}
                      </span>
                      {data?.mchMother?.hivStatusDate ? (
                        <span>({formatDate(new Date(data?.mchMother?.hivStatusDate))})</span>
                      ) : (
                        ''
                      )}
                    </p>
                  </div>
                  <div className={styles.content}>
                    <p>{t('onART', 'On ART')}</p>
                    <p>
                      <span className={styles.value}>{data?.mchMother?.onHaart ? data?.mchMother?.onHaart : '--'}</span>
                      {data?.mchMother?.onHaartDate ? (
                        <span> ({formatDate(new Date(data?.mchMother?.onHaartDate))}) </span>
                      ) : (
                        ''
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </Tile>
          ) : key == ProgramType.MCHCHILD && programName == ProgramType.MCHCHILD ? (
            <Tile>
              <div className={styles.card}>
                <div className={isTablet ? styles.tabletHeading : styles.desktopHeading}>
                  <h4 className={styles.title}> {t('currentStatus', 'Current status')}</h4>
                </div>
                <div className={styles.container}>
                  <div className={styles.content}>
                    <p>{t('currentProphylaxisUsed:', 'Current prophylaxis used')}</p>
                    <p>
                      <span className={styles.value}>
                        {data?.mchChild?.currentProphylaxisUsed ? data?.mchChild?.currentProphylaxisUsed : '--'}
                      </span>
                      {data?.mchChild?.currentProphylaxisUsedDate ? (
                        <span>{formatDate(new Date(data?.mchChild?.currentProphylaxisUsedDate))}</span>
                      ) : (
                        ''
                      )}
                    </p>
                  </div>
                  <div className={styles.content}>
                    <p>{t('currentFeedingOption', 'Current feeding option')}</p>
                    <p>
                      <span className={styles.value}>
                        {data?.mchChild?.currentFeedingOption ? data?.mchChild?.currentFeedingOption : '--'}
                      </span>
                      {data?.mchChild?.currentFeedingOptionDate ? (
                        <span> {formatDate(new Date(data?.mchChild?.currentFeedingOptionDate))} </span>
                      ) : (
                        ''
                      )}
                    </p>
                  </div>
                  <div className={styles.content}>
                    <p>{t('milestonesAttained', 'Milestones Attained')}</p>
                    <p>
                      <span className={styles.value}>
                        {data?.mchChild?.milestonesAttained ? data?.mchChild?.milestonesAttained : '--'}
                      </span>
                      {data?.mchChild?.milestonesAttainedDate ? (
                        <span>{formatDate(new Date(data?.mchChild?.milestonesAttainedDate))} </span>
                      ) : (
                        ''
                      )}
                    </p>
                  </div>
                  <div className={styles.content}>
                    <p>{t('heiOutcome', 'HEI Outcome')}</p>
                    <p>
                      <span className={styles.value}>
                        {data?.mchChild?.heiOutcome ? data?.mchChild?.heiOutcome : '--'}
                      </span>
                      {data?.mchChild?.heiOutcomeDate ? (
                        <span> ({formatDate(new Date(data?.mchChild?.heiOutcomeDate))}) </span>
                      ) : (
                        ''
                      )}
                    </p>
                  </div>
                  <div className={styles.content}>
                    <p>{t('hivStatus', 'HIV Status')}</p>
                    <p>
                      <span className={styles.value}>
                        {data?.mchChild?.hivStatus ? data?.mchChild?.hivStatus : '--'}
                      </span>
                      {data?.mchChild?.hivStatusDate ? (
                        <span> ({formatDate(new Date(data?.mchChild?.hivStatusDate))}) </span>
                      ) : (
                        ''
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </Tile>
          ) : null,
        )}
      </>
    );
  }
};
export default ProgramSummary;
