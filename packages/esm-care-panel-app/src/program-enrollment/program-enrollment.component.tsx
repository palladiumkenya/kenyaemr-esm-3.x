import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tile, Button, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import styles from './program-enrollment.scss';
import { Edit, TrashCan, Add } from '@carbon/react/icons';
import { showNotification, useLayoutType } from '@openmrs/esm-framework';
import isNull from 'lodash-es/isNull';
import { ProgramType } from '../types';
import { CardHeader } from '@openmrs/esm-patient-common-lib';
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
  const [loadMore, setLoadMore] = useState(false);

  const enrollmentToDisplay = loadMore
    ? data
    : data.map((info) => {
        const newData = info.data.length > 0 ? [info.data[0]] : [];
        return { ...info, data: newData };
      });

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
    <Tile>
      <CardHeader title={t('EnrollmentDetails', 'Enrollment History')}>
        <Button onClick={() => setLoadMore((prevState) => !prevState)} kind="ghost">
          {loadMore ? t('See less ...') : t('See more ...')}
        </Button>
      </CardHeader>
      <div className={styles.tileWrapper}>
        {enrollmentToDisplay.map((enrollment) =>
          enrollment.status === 'Active' && programName === enrollment.programName ? (
            <>
              {enrollment.programName && (
                <div className={isTablet ? styles.tabletHeading : styles.desktopHeading}></div>
              )}
              {enrollment.data.map((program) => (
                <Tile className={styles.card}>
                  <div className={styles.programTitle}>
                    <h4>{`${enrollment.programName} program`}</h4>
                    <OverflowMenu flipped>
                      <OverflowMenuItem
                        onClick={() =>
                          handleOpenWorkspace(
                            program.enrollmentFormUuid,
                            program.enrollmentFormName,
                            program.enrollmentEncounterUuid,
                          )
                        }
                        itemText={t('edit', 'Edit')}
                      />
                      <OverflowMenuItem
                        isDelete
                        onClick={() =>
                          handleOpenWorkspace(program.discontinuationFormUuid, program.discontinuationFormName, '')
                        }
                        itemText={t('discontinue', 'Discontinue')}
                      />
                    </OverflowMenu>
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
                            <span className={styles.value}>{program?.artStartDate ? program?.artStartDate : '--'}</span>
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
                  <OverflowMenu flipped>
                    <OverflowMenuItem
                      onClick={() => handleOpenWorkspace(program.enrollmentFormUuid, program.enrollmentFormName, '')}
                      itemText={t('enroll', 'Enroll')}
                    />
                    <OverflowMenuItem
                      isDelete
                      onClick={() =>
                        handleOpenWorkspace(
                          program.enrollmentFormUuid,
                          program.enrollmentFormName,
                          program.enrollmentEncounterUuid,
                        )
                      }
                      itemText={t('edit', 'Edit')}
                    />
                  </OverflowMenu>
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
  );
};
export default ProgramEnrollment;
