import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { showModal, useConfig, useLayoutType } from '@openmrs/esm-framework';
import { InlineLoading, Pagination, Search } from '@carbon/react';
import styles from '../bed-layout.scss';
import { Patient, type MortuaryLocationResponse, EnhancedPatient } from '../../types';
import { ConfigObject } from '../../config-schema';
import usePatients, { useMortuaryDischargeEncounter } from './discharged-bed-layout.resource';
import BedCard from '../../bed/bed.component';
import EmptyMorgueAdmission from '../../empty-state/empty-morgue-admission.component';
import { transformDischargedPatient, extractPatientFromEnhanced } from '../../helpers/expression-helper';
import { PatientProvider } from '../../context/deceased-person-context';
interface BedLayoutProps {
  AdmittedDeceasedPatient: MortuaryLocationResponse | null;
  isLoading: boolean;
  onPrintGatePass?: (patient: Patient, encounterDate?: string) => void;
  onPrintPostmortem?: (patientUuid: string) => void;
  mutate?: () => void;
}

const DischargedBedLayout: React.FC<BedLayoutProps> = ({ AdmittedDeceasedPatient, isLoading, onPrintGatePass }) => {
  const { t } = useTranslation();
  const { morgueDischargeEncounterTypeUuid } = useConfig<ConfigObject>();
  const [searchTerm, setSearchTerm] = useState('');
  const isTablet = useLayoutType() === 'tablet';
  const controlSize = isTablet ? 'md' : 'sm';

  const {
    dischargedPatientUuids,
    encounters,
    isLoading: encountersLoading,
    error: encountersError,
    currentPage,
    totalCount,
    currPageSize,
    setCurrPageSize,
    goTo,
  } = useMortuaryDischargeEncounter(morgueDischargeEncounterTypeUuid, AdmittedDeceasedPatient);

  const {
    patients: dischargedPatients,
    isLoading: patientsLoading,
    error: patientsError,
  } = usePatients(dischargedPatientUuids || []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredPatients = useMemo(() => {
    if (!dischargedPatients || !searchTerm.trim()) {
      return dischargedPatients || [];
    }

    const lowerSearchTerm = searchTerm.toLowerCase().trim();

    return dischargedPatients.filter((patient) => {
      const patientName = patient?.person?.display?.toLowerCase() || '';
      const gender = patient?.person?.gender?.toLowerCase() || '';
      const patientId = patient?.uuid?.toLowerCase() || '';
      const causeOfDeath = patient?.person?.causeOfDeath?.display?.toLowerCase() || '';

      return (
        patientName.includes(lowerSearchTerm) ||
        gender.includes(lowerSearchTerm) ||
        patientId.includes(lowerSearchTerm) ||
        causeOfDeath.includes(lowerSearchTerm)
      );
    });
  }, [dischargedPatients, searchTerm]);

  const getEncounterDateForPatient = (patientUuid: string): string | null => {
    if (!encounters || encounters.length === 0) {
      return null;
    }

    const patientEncounter = encounters.find((encounter) => encounter.patient?.uuid === patientUuid);

    return patientEncounter?.encounterDateTime || null;
  };

  const handlePrintGatePass = (patient: EnhancedPatient | Patient, encounterDate?: string) => {
    let originalPatient: Patient | null = null;

    if ('originalPatient' in patient || 'originalMortuaryPatient' in patient) {
      originalPatient = extractPatientFromEnhanced(patient as EnhancedPatient);
    } else {
      originalPatient = patient as Patient;
    }

    if (onPrintGatePass && originalPatient) {
      onPrintGatePass(originalPatient, encounterDate);
    } else if (originalPatient) {
      const dispose = showModal('print-confirmation-modal', {
        onClose: () => dispose(),
        patient: originalPatient,
        encounterDate: encounterDate,
      });
    }
  };

  const patientContextValue = {
    mortuaryLocation: AdmittedDeceasedPatient,
    isLoading: isLoading || encountersLoading || patientsLoading,
    onPrintGatePass: handlePrintGatePass,
  };

  if (isLoading || encountersLoading || patientsLoading) {
    return (
      <div className={styles.loadingContainer}>
        <InlineLoading description={t('loadingPatients', 'Loading patients...')} />
      </div>
    );
  }

  if (encountersError || patientsError) {
    return (
      <div className={styles.emptyState}>
        <p>{t('errorLoadingPatients', 'Error loading discharged patients')}</p>
      </div>
    );
  }

  if (!dischargedPatients || dischargedPatients.length === 0) {
    return <EmptyMorgueAdmission title={t('noDischargedPatient', 'No deceased patients currently discharged')} />;
  }

  const patientsToShow = filteredPatients;

  if (searchTerm.trim() && patientsToShow.length === 0) {
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
        <EmptyMorgueAdmission title={t('noMatchingDischargedPatients', 'No matching discharged patients found')} />
      </>
    );
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
          {patientsToShow.map((patient) => {
            const encounterDate = getEncounterDateForPatient(patient.uuid);

            return (
              <BedCard
                key={patient.uuid}
                patient={transformDischargedPatient(patient, encounterDate)}
                showActions={{
                  printGatePass: true,
                }}
              />
            );
          })}
        </div>

        <div className={styles.paginationFooter}>
          <Pagination
            page={currentPage || 1}
            totalItems={totalCount || 0}
            pageSize={currPageSize}
            pageSizes={[10, 20, 50, 100]}
            onChange={({ page, pageSize }: { page: number; pageSize: number }) => {
              if (pageSize !== currPageSize) {
                setCurrPageSize(pageSize);
                goTo(1);
              } else {
                goTo(page);
              }
            }}
          />
        </div>
      </div>
    </PatientProvider>
  );
};

export default DischargedBedLayout;
