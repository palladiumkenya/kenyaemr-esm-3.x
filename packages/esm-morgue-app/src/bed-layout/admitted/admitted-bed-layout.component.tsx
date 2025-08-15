import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading, Search } from '@carbon/react';
import { launchWorkspace, navigate, useConfig, useLayoutType } from '@openmrs/esm-framework';
import styles from '../bed-layout.scss';
import BedCard from '../../bed/bed.component';
import { type MortuaryLocationResponse } from '../../types';
import EmptyBedCard from '../../bed/empty-bed.component';
import Divider from '../../bed/divider/divider.component';
import { ConfigObject } from '../../config-schema';
import { mutate as mutateSWR } from 'swr';
import EmptyMorgueAdmission from '../../empty-state/empty-morgue-admission.component';
import { PatientProvider } from '../../context/deceased-person-context';
import { transformAdmittedPatient } from '../../helpers/expression-helper';

interface BedLayoutProps {
  AdmittedDeceasedPatient: MortuaryLocationResponse | null;
  isLoading: boolean;
  onAdmit?: (patientUuid: string) => void;
  onPostmortem?: (patientUuid: string) => void;
  onDischarge?: (patientUuid: string) => void;
  onSwapCompartment?: (patientUuid: string, bedId: string) => void;
  mutate?: () => void;
}

const BedLayout: React.FC<BedLayoutProps> = ({
  AdmittedDeceasedPatient,
  isLoading,
  onPostmortem,
  onDischarge,
  onSwapCompartment,
  mutate,
}) => {
  const { t } = useTranslation();
  const { autopsyFormUuid } = useConfig<ConfigObject>();
  const [searchTerm, setSearchTerm] = useState('');
  const isTablet = useLayoutType() === 'tablet';
  const controlSize = isTablet ? 'md' : 'sm';

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handlePostmortem = (patientUuid: string, bedInfo?: { bedNumber: string; bedId: number }) => {
    const hasBedInfo = bedInfo?.bedNumber && bedInfo?.bedId;

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
    const base = `${window.getOpenmrsSpaBase()}home/morgue/patient/${patientUuid}`;
    const to = hasBedInfo
      ? `${base}/compartment/${bedInfo.bedNumber}/${bedInfo.bedId}/mortuary-chart`
      : `${base}/mortuary-chart`;
    navigate({ to });
  };

  const handleDischarge = (patientUuid: string, bedId?: number) => {
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

  const handleSwapCompartment = (patientUuid: string, bedId?: number) => {
    if (onSwapCompartment) {
      onSwapCompartment(patientUuid, bedId?.toString() || '');
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

  const handleViewDetails = (patientUuid: string, bedInfo?: { bedNumber: string; bedId: number }) => {
    const hasBedInfo = bedInfo?.bedNumber && bedInfo?.bedId;
    const base = `${window.getOpenmrsSpaBase()}home/morgue/patient/${patientUuid}`;
    const to = hasBedInfo
      ? `${base}/compartment/${bedInfo.bedNumber}/${bedInfo.bedId}/mortuary-chart`
      : `${base}/mortuary-chart`;
    navigate({ to });
  };

  const filteredBedLayouts = useMemo(() => {
    if (!AdmittedDeceasedPatient?.bedLayouts || !searchTerm.trim()) {
      return AdmittedDeceasedPatient?.bedLayouts || [];
    }

    const lowerSearchTerm = searchTerm.toLowerCase().trim();

    return AdmittedDeceasedPatient.bedLayouts.filter((bedLayout) => {
      const bedNumber = bedLayout.bedNumber?.toString().toLowerCase() || '';
      const bedType = bedLayout.bedType?.displayName?.toLowerCase() || '';

      if (bedNumber.includes(lowerSearchTerm) || bedType.includes(lowerSearchTerm)) {
        return true;
      }

      const patients = bedLayout.patients || [];
      return patients.some((patient) => {
        const patientName = patient.person?.display?.toLowerCase() || '';
        const gender = patient.person?.gender?.toLowerCase() || '';
        const patientId = patient.uuid?.toLowerCase() || '';
        const causeOfDeath = patient.person?.causeOfDeath?.display?.toLowerCase() || '';

        return (
          patientName.includes(lowerSearchTerm) ||
          gender.includes(lowerSearchTerm) ||
          patientId.includes(lowerSearchTerm) ||
          causeOfDeath.includes(lowerSearchTerm)
        );
      });
    });
  }, [AdmittedDeceasedPatient?.bedLayouts, searchTerm]);

  const patientContextValue = {
    mortuaryLocation: AdmittedDeceasedPatient,
    isLoading,
    mutate,
    onPostmortem: handlePostmortem,
    onDischarge: handleDischarge,
    onSwapCompartment: handleSwapCompartment,
    onViewDetails: handleViewDetails,
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <InlineLoading description={t('loadingPatients', 'Loading patients...')} />
      </div>
    );
  }

  const bedLayouts = filteredBedLayouts;
  if (!bedLayouts || bedLayouts.length === 0) {
    if (searchTerm.trim()) {
      return (
        <>
          <div className={styles.searchContainer}>
            <Search
              labelText={t('searchDeceasedPatients', 'Search deceased patients')}
              placeholder={t(
                'searchPatientsPlaceholder',
                'Search by name, ID number, gender, compartment, or bed type...',
              )}
              value={searchTerm}
              onChange={handleSearchChange}
              size={controlSize}
            />
          </div>
          <EmptyMorgueAdmission title={t('noMatchingPatients', 'No matching patients found')} />
        </>
      );
    }

    return <EmptyMorgueAdmission title={t('noAdmittedPatient', 'No deceased patients currently admitted')} />;
  }

  return (
    <PatientProvider value={patientContextValue}>
      <div className={styles.searchContainer}>
        <Search
          labelText={t('searchDeceasedPatients', 'Search deceased patients')}
          placeholder={t('searchPatientsPlaceholder', 'Search by name, ID number, gender, compartment, or bed type...')}
          value={searchTerm}
          onChange={handleSearchChange}
          size="sm"
        />
      </div>
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
                          patient={transformAdmittedPatient(patient, {
                            bedNumber: bedLayout.bedNumber,
                            bedId: bedLayout.bedId,
                            bedType: bedLayout.bedType?.displayName,
                          })}
                          showActions={{
                            discharge: true,
                            swapCompartment: true,
                            postmortem: true,
                            viewDetails: true,
                          }}
                        />
                        {patientIndex < patients.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </div>
                ) : (
                  <BedCard
                    patient={transformAdmittedPatient(patients[0], {
                      bedNumber: bedLayout.bedNumber,
                      bedId: bedLayout.bedId,
                      bedType: bedLayout.bedType?.displayName,
                    })}
                    showActions={{
                      discharge: true,
                      swapCompartment: true,
                      postmortem: true,
                      viewDetails: true,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </PatientProvider>
  );
};

export default BedLayout;
