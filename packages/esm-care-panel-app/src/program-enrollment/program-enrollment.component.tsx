import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tile, Button } from '@carbon/react';
import styles from './program-enrollment.scss';
import { Edit } from '@carbon/react/icons';
import { useLayoutType, useVisit } from '@openmrs/esm-framework';
import isNull from 'lodash-es/isNull';
import { ProgramType } from '../types';
interface ProgramEnrollmentProps {
  patientUuid: string;
  programName: string;
  data: Array<any>;
  formEntrySub: any;
  launchPatientWorkspace: Function;
}
const ProgramEnrollment: React.FC<ProgramEnrollmentProps> = ({
  patientUuid,
  programName,
  data,
  formEntrySub,
  launchPatientWorkspace,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() == 'tablet';
  const { currentVisit } = useVisit(patientUuid);
  const handleOpenWorkspace = (formUuid, formName, encounterUuid) => {
    const mutateForm = () => {};
    formEntrySub.next({ formUuid, encounterUuid });
    launchPatientWorkspace('patient-form-entry-workspace', {
      workspaceTitle: formName,
      mutateForm,
      formUuid,
      encounterUuid,
      visit: currentVisit,
    });
  };
  if (isNull(data)) {
    return;
  }
  return (
    <div>
      <section>
        {data.map((enrollment) =>
          enrollment.status === 'Active' && programName === enrollment.programName ? (
            <>
              {enrollment.programName && (
                <div className={isTablet ? styles.tabletHeading : styles.desktopHeading}>
                  <h4 className={styles.title}>{t('currentEnrollmentDetails', 'Current enrollment details')}</h4>
                </div>
              )}
              {enrollment.data.map((program) => (
                <Tile className={styles.card}>
                  <div className={styles.btnDiscontinue}>
                    <Button
                      size="sm"
                      iconDescription={t('edit', 'Edit')}
                      onClick={() =>
                        handleOpenWorkspace(
                          program.enrollmentFormUuid,
                          program.enrollmentFormName,
                          program.enrollmentEncounterUuid,
                        )
                      }
                      kind="tertiary"
                      renderIcon={(props) => <Edit size={16} {...props} />}>
                      {t('edit', 'Edit')}{' '}
                    </Button>
                    <Button
                      size="sm"
                      kind="danger--ghost"
                      onClick={() =>
                        handleOpenWorkspace(program.discontinuationFormUuid, program.discontinuationFormName, '')
                      }>
                      {t('discontinue', 'Discontinue')}
                    </Button>
                  </div>
                  <div className={styles.labelContainer}>
                    <div className={styles.content}>
                      <p>{t('enrolled', 'Enrolled')}</p>
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
                      <div className={styles.content}>
                        <p>{t('indicationForTpt', 'Indication for TPT')} </p>
                        <span className={styles.value}>
                          {program?.tptIndication ? program?.tptIndication : '--'}
                        </span>{' '}
                      </div>
                    ) : null}
                  </div>
                </Tile>
              ))}
            </>
          ) : enrollment.status === 'Inactive' && programName === enrollment.programName ? (
            <>
              {enrollment.programName && (
                <div className={isTablet ? styles.tabletHeading : styles.desktopHeading}>
                  <h4 className={styles.title}>{t('historicEnrollment', 'Historic enrollment')}</h4>
                </div>
              )}
              {enrollment.data.map((program) => (
                <Tile className={styles.card}>
                  <div className={styles.btnDiscontinue}>
                    <Button
                      size="sm"
                      iconDescription={t('edit', 'Edit')}
                      onClick={() =>
                        handleOpenWorkspace(
                          program.discontinuationFormUuid,
                          program.discontinuationFormName,
                          program.discontinuationEncounterUuid,
                        )
                      }
                      kind="tertiary"
                      renderIcon={(props) => <Edit size={16} {...props} />}>
                      {t('edit', 'Edit')}{' '}
                    </Button>
                    <Button
                      size="sm"
                      kind="ghost"
                      onClick={() => handleOpenWorkspace(program.enrollmentFormUuid, program.enrollmentFormName, '')}>
                      {t('enroll', 'Enroll')}
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
                      <div className={styles.content}>
                        <p>{t('indicationForTpt', 'Indication for TPT')} </p>
                        <span className={styles.value}>{program?.tptIndication ? program?.tptIndication : '--'} </span>
                      </div>
                    ) : null}
                  </div>
                </Tile>
              ))}
            </>
          ) : null,
        )}
      </section>
    </div>
  );
};
export default ProgramEnrollment;
