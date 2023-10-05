import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tile, Button, ButtonSet } from '@carbon/react';
import styles from './program-enrollment.scss';
import { Edit, TrashCan, Add } from '@carbon/react/icons';
import { showNotification, useLayoutType } from '@openmrs/esm-framework';
import isNull from 'lodash-es/isNull';
import { ProgramType } from '../types';
export interface ProgramEnrollmentProps {
  patientUuid: string;
  programName: string;
  data: Array<any>;
  formEntrySub: any;
  launchPatientWorkspace: Function;
}
const ProgramEnrollment: React.FC<ProgramEnrollmentProps> = ({
  programName,
  data,

  launchPatientWorkspace,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() == 'tablet';
  const handleOpenWorkspace = (formUuid, formName, encounterUuid) => {
    !encounterUuid
      ? showNotification({
          title: t('editEnrollment', 'Edit enrollment'),
          description: t(
            'editEnrollmentMessage',
            'The enrollment form does not have an encounter associated with it, Please contact your system administrator to add an encounter to the enrollment',
          ),
          kind: 'error',
        })
      : launchPatientWorkspace('patient-form-entry-workspace', {
          workspaceTitle: formName,
          formInfo: { formUuid, encounterUuid: encounterUuid ?? '' },
        });
  };
  if (isNull(data)) {
    return;
  }
  return (
    <section>
      <Tile>
        <div className={isTablet ? styles.tabletHeading : styles.desktopHeading}>
          <h4 className={styles.title}>{t('EnrollmentDetails', 'Enrollment History')}</h4>
        </div>
        <div className={styles.tileWrapper}>
          {data.map((enrollment) =>
            enrollment.status === 'Active' && programName === enrollment.programName ? (
              <>
                {enrollment.programName && (
                  <div className={isTablet ? styles.tabletHeading : styles.desktopHeading}></div>
                )}
                {enrollment.data.map((program) => (
                  <Tile className={styles.card}>
                    <div className={styles.programTitle}>
                      <h4>{`${enrollment.programName} program`}</h4>
                      <div className={styles.buttonContainer}>
                        <Button
                          onClick={() =>
                            handleOpenWorkspace(
                              program.enrollmentFormUuid,
                              program.enrollmentFormName,
                              program.enrollmentEncounterUuid,
                            )
                          }
                          renderIcon={Edit}
                          size="sm"
                          kind="ghost">
                          {t('edit', 'Edit')}
                        </Button>
                        <Button
                          renderIcon={TrashCan}
                          size="sm"
                          kind="danger--ghost"
                          onClick={() =>
                            handleOpenWorkspace(program.discontinuationFormUuid, program.discontinuationFormName, '')
                          }>
                          {t('discontinue', 'Discontinue')}
                        </Button>
                      </div>
                    </div>
                    <div className={styles.labelContainer}>
                      <div className={styles.content}>
                        {program.programName === ProgramType.TPT ? (
                          <p>{t('initiated', 'Initiated')}</p>
                        ) : (
                          <p>{t('enrolled', 'Enrolled')}</p>
                        )}
                        <span className={styles.value}>{program?.dateEnrolled}</span>
                      </div>
                      {program.programName === ProgramType.HIV ? (
                        <>
                          <div className={styles.content}>
                            <p>{t('whoStage', 'WHO Stage')}</p>
                            <p>
                              <span className={styles.value}>{program?.whoStage ? program?.whoStage : '--'}</span>
                            </p>
                          </div>
                          <div className={styles.content}>
                            <p>{t('entryPoint', 'Entry point')}</p>
                            <p>
                              <span className={styles.value}>{program?.entryPoint ? program?.entryPoint : '--'}</span>
                            </p>
                          </div>
                          <div className={styles.content}>
                            <p>{t('dateStartedOnArt', 'Date started on ART')}</p>
                            <p>
                              <span className={styles.value}>
                                {program?.artStartDate ? program?.artStartDate : '--'}
                              </span>
                            </p>
                          </div>
                        </>
                      ) : null}
                      {program.programName === ProgramType.MCH_MOTHER ? (
                        <>
                          <div className={styles.content}>
                            <p>{t('lmp', 'LMP')} </p>
                            <span className={styles.value}>{program?.lmp ? program?.lmp : '--'}</span>
                          </div>
                          <div className={styles.content}>
                            <p>{t('edd', 'EDD')} </p>
                            <span className={styles.value}>{program?.eddLmp ? program?.eddLmp : '--'}</span>
                          </div>
                          <div className={styles.content}>
                            <p>{t('gravida', 'Gravida')} </p>
                            <span className={styles.value}>{program?.gravida ? program?.gravida : '--'}</span>
                          </div>
                          <div className={styles.content}>
                            <p>{t('parity', 'Parity')} </p>
                            <span className={styles.value}>{program?.parity ? program?.parity : '--'}</span>
                          </div>
                          <div className={styles.content}>
                            <p>{t('gestationInWeeks', 'Gestation in weeks')} </p>
                            <span className={styles.value}>
                              {program?.gestationInWeeks ? program?.gestationInWeeks : '--'}
                            </span>
                          </div>
                        </>
                      ) : null}
                      {program.programName === ProgramType.MCH_CHILD ? (
                        <div className={styles.content}>
                          <p>{t('entryPoint', 'Entry point')}</p>
                          <span className={styles.value}>{program?.entryPoint ? program?.entryPoint : '--'}</span>
                        </div>
                      ) : null}
                      {program.programName === ProgramType.TPT ? (
                        <>
                          <div className={styles.content}>
                            <p>{t('indicationForTpt', 'Indication for TPT')} </p>
                            <span className={styles.value}>
                              {program?.tptIndication ? program?.tptIndication : '--'}
                            </span>{' '}
                          </div>
                          <div className={styles.content}>
                            <p>{t('regimen', 'Regimen')}</p>
                            <span className={styles.value}>{program?.tptDrugName ? program?.tptDrugName : '--'}</span>
                          </div>
                          <div className={styles.content}>
                            <p>{t('regimenStartDate', ' Date started regimen')}</p>
                            <span className={styles.value}>
                              {program?.tptDrugStartDate ? program?.tptDrugStartDate : '--'}
                            </span>
                          </div>
                        </>
                      ) : null}
                      {program.programName === ProgramType.TB ? (
                        <>
                          <div className={styles.content}>
                            <p>{t('regimen', 'Regimen')}</p>
                            <p>
                              <span className={styles.value}>
                                {program?.firstEncounter?.regimenShortDisplay
                                  ? program?.firstEncounter?.regimenShortDisplay
                                  : '--'}{' '}
                              </span>{' '}
                            </p>
                          </div>
                          <div className={styles.content}>
                            <p>{t('regimenStartDate', ' Date started regimen')}</p>
                            <p>
                              {' '}
                              <span className={styles.value}>
                                {program?.firstEncounter?.startDate ? program?.firstEncounter?.startDate : '--'}
                              </span>
                            </p>
                          </div>
                        </>
                      ) : null}
                    </div>
                  </Tile>
                ))}
              </>
            ) : enrollment.status === 'Inactive' && programName === enrollment.programName ? (
              <>
                {enrollment.programName && (
                  <div className={isTablet ? styles.tabletHeading : styles.desktopHeading}></div>
                )}
                {enrollment.data.map((program) => (
                  <Tile className={styles.card}>
                    <div className={styles.buttonContainer}>
                      <Button
                        renderIcon={Add}
                        size="sm"
                        kind="ghost"
                        onClick={() => handleOpenWorkspace(program.enrollmentFormUuid, program.enrollmentFormName, '')}>
                        {t('enroll', 'Enroll')}
                      </Button>
                      <Button
                        onClick={() =>
                          handleOpenWorkspace(
                            program.enrollmentFormUuid,
                            program.enrollmentFormName,
                            program.enrollmentEncounterUuid,
                          )
                        }
                        renderIcon={Edit}
                        size="sm"
                        kind="ghost">
                        {t('edit', 'Edit')}
                      </Button>
                    </div>

                    <div className={styles.labelContainer}>
                      <div className={styles.content}>
                        <p className={styles.label}>{t('completed', 'Completed')}</p>
                        <span className={styles.value}>{program?.dateCompleted ? program?.dateCompleted : '--'}</span>
                      </div>
                      {program.programName === ProgramType.HIV ? (
                        <>
                          <div className={styles.content}>
                            <p>{t('whoStage', 'WHO Stage')} </p>
                            <span className={styles.value}>{program?.whoStage ? program?.whoStage : '--'} </span>
                          </div>
                          <div className={styles.content}>
                            <p>{t('entryPoint', 'Entry point')} </p>
                            <span className={styles.value}>{program?.entryPoint ? program?.entryPoint : '--'} </span>
                          </div>
                        </>
                      ) : null}
                      {program.programName === ProgramType.MCH_MOTHER ? (
                        <>
                          <div className={styles.content}>
                            <p>{t('gestationInWeeks', 'Gestation in weeks')} </p>
                            <span className={styles.content}>
                              {program?.gestationInWeeks ? program?.gestationInWeeks : '--'}
                            </span>
                          </div>
                          <div className={styles.content}>
                            <p>{t('lmp', 'LMP')} </p>
                            <span className={styles.value}>{program?.lmp ? program?.lmp : '--'} </span>
                          </div>
                          <div className={styles.content}>
                            <p>{t('edd', 'EDD')} </p>
                            <span className={styles.value}>{program?.eddLmp ? program?.eddLmp : '--'} </span>
                          </div>
                          <div className={styles.content}>
                            <p>{t('gravida', 'Gravida')} </p>
                            <span className={styles.value}>{program?.gravida ? program?.gravida : '--'} </span>
                          </div>
                          <div className={styles.content}>
                            <p>{t('parity', 'Parity')} </p>
                            <span className={styles.value}>{program?.parity ? program?.parity : '--'} </span>
                          </div>
                        </>
                      ) : null}
                      {program.programName === ProgramType.MCH_CHILD ? (
                        <div className={styles.content}>
                          <p>{t('entryPoint', 'Entry point')} </p>
                          <span className={styles.value}>{program?.entryPoint ? program?.entryPoint : '--'} </span>
                        </div>
                      ) : null}
                      {program.programName === ProgramType.TPT ? (
                        <>
                          <div className={styles.content}>
                            <p>{t('initiated', 'Initiated')}</p>
                            <span className={styles.value}>{program?.dateEnrolled}</span>
                          </div>
                          <div className={styles.content}>
                            <p>{t('indicationForTpt', 'Indication for TPT')} </p>
                            <span className={styles.value}>
                              {program?.tptIndication ? program?.tptIndication : '--'}{' '}
                            </span>
                          </div>
                        </>
                      ) : null}
                    </div>
                  </Tile>
                ))}
              </>
            ) : null,
          )}
        </div>
      </Tile>
    </section>
  );
};
export default ProgramEnrollment;
