import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading, Search, SkeletonText } from '@carbon/react';
import styles from '../bed-layout.scss';
import { MortuaryPatient, MortuaryLocationResponse, EnhancedPatient } from '../../types';
import { useAwaitingPatients } from '../../home/home.resource';
import { launchWorkspace, useLayoutType } from '@openmrs/esm-framework';
import { EmptyState } from '@openmrs/esm-patient-common-lib/src';
import EmptyMorgueAdmission from '../../empty-state/empty-morgue-admission.component';
import { getOriginalPatient, transformMortuaryPatient } from '../../helpers/expression-helper';
import { PatientProvider } from '../../context/deceased-person-context';
import BedCard from '../../bed/bed.component';

interface BedLayoutProps {
  awaitingQueueDeceasedPatients: MortuaryPatient[];
  mortuaryLocation: MortuaryLocationResponse;
  isLoading: boolean;
  mutated?: () => void;
}

const AwaitingBedLayout: React.FC<BedLayoutProps> = ({
  awaitingQueueDeceasedPatients,
  mortuaryLocation,
  isLoading,
  mutated,
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const trulyAwaitingPatients = useAwaitingPatients(awaitingQueueDeceasedPatients);
  const isTablet = useLayoutType() === 'tablet';
  const controlSize = isTablet ? 'md' : 'sm';

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredPatients = useMemo(() => {
    if (!trulyAwaitingPatients || !searchTerm.trim()) {
      return trulyAwaitingPatients || [];
    }

    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    return trulyAwaitingPatients.filter((mortuaryPatient) => {
      const patientName = mortuaryPatient?.person?.person?.display?.toLowerCase() || '';
      const gender = mortuaryPatient?.person?.person?.gender?.toLowerCase() || '';
      const patientId = mortuaryPatient?.person?.person?.uuid?.toLowerCase() || '';
      const causeOfDeath = mortuaryPatient?.person?.person?.causeOfDeath?.display?.toLowerCase() || '';

      return (
        patientName.includes(lowerSearchTerm) ||
        gender.includes(lowerSearchTerm) ||
        patientId.includes(lowerSearchTerm) ||
        causeOfDeath.includes(lowerSearchTerm)
      );
    });
  }, [trulyAwaitingPatients, searchTerm]);

  const handleAdmit = (enhancedPatient: EnhancedPatient) => {
    // Extract the original MortuaryPatient from the enhanced patient
    const originalPatient = getOriginalPatient(enhancedPatient);
    if (originalPatient && 'patient' in originalPatient) {
      // This is a MortuaryPatient
      launchWorkspace('admit-deceased-person-form', {
        workspaceTitle: t('admissionForm', 'Admission form'),
        patientData: originalPatient,
        mortuaryLocation,
        mutated,
      });
    }
  };

  const patientContextValue = {
    mortuaryLocation,
    isLoading,
    mutate: mutated,
    onAdmit: handleAdmit,
  };

  if (isLoading) {
    return (
      <div className={styles.emptyState}>
        <SkeletonText />
        <InlineLoading description={t('loadingPatients', 'Loading patients...')} />
      </div>
    );
  }

  if (trulyAwaitingPatients.length === 0) {
    return (
      <div className={styles.emptyState}>
        <EmptyState
          headerTitle={t('noAwaitingPatients', 'No awaiting patients found')}
          displayText={t('noAwaitingPatientsDescription', 'There are currently no awaiting patients to display.')}
        />
      </div>
    );
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
        <EmptyMorgueAdmission
          title={t('noMatchingAwaitingPatients', 'No matching awaiting patients found')}
          subTitle={t(
            'noMatchingAwaitingPatientsDescription',
            'Try adjusting your search terms to find awaiting patients.',
          )}
        />
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
          {patientsToShow.map((mortuaryPatient) => (
            <BedCard
              key={mortuaryPatient.person?.person?.uuid}
              patient={transformMortuaryPatient(mortuaryPatient)}
              showActions={{ admit: true }}
            />
          ))}
        </div>
      </div>
    </PatientProvider>
  );
};

export default AwaitingBedLayout;
