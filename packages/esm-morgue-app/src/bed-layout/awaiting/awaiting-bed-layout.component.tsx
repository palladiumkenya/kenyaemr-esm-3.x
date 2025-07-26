import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading, Search, SkeletonText } from '@carbon/react';
import styles from '../bed-layout.scss';
import BedCard from '../../bed/bed.component';
import { MortuaryPatient, MortuaryLocationResponse } from '../../types';
import { useAwaitingPatients } from '../../home/home.resource';
import { launchWorkspace } from '@openmrs/esm-framework';
import { EmptyState } from '@openmrs/esm-patient-common-lib/src';
import EmptyMorgueAdmission from '../../empty-state/empty-morgue-admission.component';

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

  const handleAdmit = (patientData: MortuaryPatient) => {
    launchWorkspace('admit-deceased-person-form', {
      workspaceTitle: t('admissionForm', 'Admission form'),
      patientData,
      mortuaryLocation,
      mutated,
    });
  };

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
            size="sm"
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
    <>
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
          {patientsToShow.map((mortuaryPatient) => {
            const patientUuid = mortuaryPatient?.person?.person?.uuid;
            const patientName = mortuaryPatient?.person?.person?.display;
            const gender = mortuaryPatient?.person?.person?.gender;
            const age = mortuaryPatient?.person?.person?.age;
            const causeOfDeath = mortuaryPatient?.person?.person?.causeOfDeath?.display;
            const dateOfDeath = mortuaryPatient?.person?.person?.deathDate;

            return (
              <BedCard
                key={patientUuid}
                patientName={patientName}
                gender={gender}
                age={age}
                causeOfDeath={causeOfDeath}
                dateOfDeath={dateOfDeath}
                patientUuid={patientUuid}
                onAdmit={() => handleAdmit(mortuaryPatient)}
              />
            );
          })}
        </div>
      </div>
    </>
  );
};

export default AwaitingBedLayout;
