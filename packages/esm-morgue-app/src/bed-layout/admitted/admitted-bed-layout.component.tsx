import React from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading } from '@carbon/react';
import { launchWorkspace, navigate, useConfig } from '@openmrs/esm-framework';
import styles from '../bed-layout.scss';
import BedCard from '../../bed/bed.component';
import { type MortuaryLocationResponse } from '../../types';
import EmptyBedCard from '../../bed/empty-bed.component';
import Divider from '../../bed/divider/divider.component';
import { ConfigObject } from '../../config-schema';
import { mutate as mutateSWR } from 'swr';
import EmptyMorgueAdmission from '../../empty-state/empty-morgue-admission.component';

interface BedLayoutProps {
  AdmittedDeceasedPatient: MortuaryLocationResponse | null;
  isLoading: boolean;
  onAdmit?: (patientUuid: string) => void;
  onPostmortem?: (patientUuid: string) => void;
  onDischarge?: (patientUuid: string) => void;
  onSwapCompartment?: (patientUuid: string, bedId: string) => void;
  onDispose?: (patientUuid: string) => void;
  mutate?: () => void;
}

const BedLayout: React.FC<BedLayoutProps> = ({
  AdmittedDeceasedPatient,
  isLoading,
  onPostmortem,
  onDischarge,
  onSwapCompartment,
  onDispose,
  mutate,
}) => {
  const { t } = useTranslation();
  const { autopsyFormUuid } = useConfig<ConfigObject>();

  const handlePostmortem = (patientUuid: string) => {
    if (onPostmortem) {
      onPostmortem(patientUuid);
    } else {
      launchWorkspace('mortuary-form-entry', {
        formUuid: autopsyFormUuid,
        workspaceTitle: t('postmortemForm', 'Postmortem form'),

        patientUuid: patientUuid,
        encounterUuid: '',
        mutateForm: () => {
          mutateSWR((key) => true, undefined, {
            revalidate: true,
          });
        },
      });
    }
  };

  const handleDischarge = (patientUuid: string, bedId: number) => {
    if (onDischarge) {
      onDischarge(patientUuid);
    } else {
      launchWorkspace('discharge-body-form', {
        workspaceTitle: t('dischargeForm', 'Discharge form'),
        patientUuid: patientUuid,
        bedId,
        mutate,
      });
    }
  };

  const handleSwapCompartment = (patientUuid: string, bedId: number) => {
    if (onSwapCompartment) {
      onSwapCompartment(patientUuid, bedId.toString());
    } else {
      launchWorkspace('swap-unit-form', {
        workspaceTitle: t('swapCompartment', 'Swap compartment'),
        patientUuid: patientUuid,
        bedId,
        mortuaryLocation: AdmittedDeceasedPatient,
        mutate,
      });
    }
  };

  const handleDispose = (patientUuid: string, bedId: number) => {
    if (onDispose) {
      onDispose(patientUuid);
    } else {
      launchWorkspace('dispose-deceased-person-form', {
        workspaceTitle: t('disposeForm', 'Dispose form'),
        patientUuid: patientUuid,
        bedId,
        mutate,
      });
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <InlineLoading description={t('loadingPatients', 'Loading patients...')} />
      </div>
    );
  }

  const bedLayouts = AdmittedDeceasedPatient?.bedLayouts || [];
  if (!bedLayouts) {
    return (
      <EmptyMorgueAdmission
        title={t('noAdmittedPatient', 'No deceased patients currently admitted')}
        subTitle={t(
          'noAdmittedPatientsDescription',
          'There are no admitted deceased patients to display at this time.',
        )}
      />
    );
  }

  return (
    <div className={styles.bedLayoutWrapper}>
      <div className={styles.bedLayoutContainer}>
        {bedLayouts.map((bedLayout, index) => {
          const patients = bedLayout.patients || [];
          const isEmpty = bedLayout.status === 'AVAILABLE' || patients.length === 0;

          if (isEmpty) {
            return (
              <EmptyBedCard
                key={bedLayout.bedUuid || `empty-bed-${bedLayout.bedId}-${index}`}
                bedNumber={bedLayout.bedNumber}
                bedType={bedLayout.bedType?.displayName}
                isEmpty={isEmpty}
              />
            );
          }

          return (
            <div
              key={bedLayout.bedUuid}
              className={`${styles.bedContainer} ${patients.length > 1 ? styles.sharedBedContainer : ''}`}>
              {patients.length > 1 ? (
                <div className={styles.horizontalLayout}>
                  {patients.map((patient, patientIndex) => (
                    <React.Fragment key={patient.uuid}>
                      <BedCard
                        patientUuid={patient.uuid}
                        patientName={patient.person?.display}
                        gender={patient.person?.gender}
                        age={patient.person?.age}
                        causeOfDeath={patient.person?.causeOfDeath?.display}
                        dateOfDeath={patient.person?.deathDate}
                        bedNumber={bedLayout.bedNumber}
                        bedType={bedLayout.bedType?.displayName}
                        onPostmortem={() => handlePostmortem(patient.uuid)}
                        onDischarge={() => handleDischarge(patient.uuid, bedLayout.bedId)}
                        onSwapCompartment={() => handleSwapCompartment(patient.uuid, bedLayout.bedId)}
                        onDispose={() => handleDispose(patient.uuid, bedLayout.bedId)}
                        onViewDetails={() => {
                          const hasBedInfo = bedLayout.bedNumber && bedLayout.bedId;
                          const base = `${window.getOpenmrsSpaBase()}home/morgue/patient/${patient.uuid}`;
                          const to = hasBedInfo
                            ? `${base}/compartment/${bedLayout.bedNumber}/${bedLayout.bedId}/mortuary-chart`
                            : `${base}/mortuary-chart`;
                          navigate({ to });
                        }}
                      />
                      {patientIndex < patients.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <BedCard
                  patientUuid={patients[0].uuid}
                  patientName={patients[0].person?.display}
                  gender={patients[0].person?.gender}
                  age={patients[0].person?.age}
                  causeOfDeath={patients[0].person?.causeOfDeath?.display}
                  dateOfDeath={patients[0].person?.deathDate}
                  bedNumber={bedLayout.bedNumber}
                  bedType={bedLayout.bedType?.displayName}
                  onPostmortem={() => handlePostmortem(patients[0].uuid)}
                  onDischarge={() => handleDischarge(patients[0].uuid, bedLayout.bedId)}
                  onSwapCompartment={() => handleSwapCompartment(patients[0].uuid, bedLayout.bedId)}
                  onDispose={() => handleDispose(patients[0].uuid, bedLayout.bedId)}
                  onViewDetails={() => {
                    const hasBedInfo = bedLayout.bedNumber && bedLayout.bedId;
                    const base = `${window.getOpenmrsSpaBase()}home/morgue/patient/${patients[0].uuid}`;
                    const to = hasBedInfo
                      ? `${base}/compartment/${bedLayout.bedNumber}/${bedLayout.bedId}/mortuary-chart`
                      : `${base}/mortuary-chart`;
                    navigate({ to });
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BedLayout;
