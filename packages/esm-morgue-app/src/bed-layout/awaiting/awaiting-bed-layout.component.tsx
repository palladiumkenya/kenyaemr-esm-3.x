import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading, Search, SkeletonText } from '@carbon/react';
import styles from '../bed-layout.scss';
import { EnhancedPatient, MortuaryLocationResponse } from '../../types';
import { launchWorkspace, showModal, showSnackbar, useLayoutType } from '@openmrs/esm-framework';
import EmptyMorgueAdmission from '../../empty-state/empty-morgue-admission.component';
import { PatientProvider } from '../../context/deceased-person-context';
import BedCard from '../../bed/bed.component';
import { removeFromMortuaryQueue } from '../../home/home.resource';

interface BedLayoutProps {
  awaitingQueuePatients: EnhancedPatient[];
  mortuaryLocation: MortuaryLocationResponse;
  isLoading: boolean;
  mutated?: () => void;
}

const AwaitingBedLayout: React.FC<BedLayoutProps> = ({
  awaitingQueuePatients,
  mortuaryLocation,
  isLoading,
  mutated,
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const isTablet = useLayoutType() === 'tablet';
  const controlSize = isTablet ? 'md' : 'sm';

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredPatients = useMemo(() => {
    if (!awaitingQueuePatients || !searchTerm.trim()) {
      return awaitingQueuePatients || [];
    }

    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    return awaitingQueuePatients.filter((patient) => {
      const patientName = patient?.person?.display?.toLowerCase() || '';
      const gender = patient?.person?.gender?.toLowerCase() || '';
      const patientId = patient?.uuid?.toLowerCase() || '';
      const causeOfDeath = patient?.person?.causeOfDeath?.display?.toLowerCase() || '';
      const priority = patient?.queueInfo?.priority?.toLowerCase() || '';
      const priorityComment = patient?.queueInfo?.priorityComment?.toLowerCase() || '';

      return (
        patientName.includes(lowerSearchTerm) ||
        gender.includes(lowerSearchTerm) ||
        patientId.includes(lowerSearchTerm) ||
        causeOfDeath.includes(lowerSearchTerm) ||
        priority.includes(lowerSearchTerm) ||
        priorityComment.includes(lowerSearchTerm)
      );
    });
  }, [awaitingQueuePatients, searchTerm]);

  const handleAdmit = (patient: EnhancedPatient) => {
    launchWorkspace('admit-deceased-person-form', {
      workspaceTitle: t('admissionForm', 'Admission form'),
      patient,
      queueEntryUuid: patient.queueInfo?.queueEntryUuid,
      mortuaryLocation,
      mutated,
    });
  };

  const handleRemoveFromQueue = (patient: EnhancedPatient) => {
    const dispose = showModal('delete-confirmation-modal', {
      close: () => dispose(),
      onConfirm: async () => {
        try {
          await removeFromMortuaryQueue(patient.queueInfo?.queueEntryUuid);

          showSnackbar({
            kind: 'success',
            isLowContrast: true,
            title: t('removedFromQueue', 'Removed from queue'),
            subtitle: t('patientRemovedSuccess', '{{patientName}} has been removed from the mortuary queue', {
              patientName: patient.person.display,
            }),
          });

          mutated?.();
        } catch (error) {
          showSnackbar({
            kind: 'error',
            isLowContrast: false,
            title: t('errorRemovingFromQueue', 'Error removing from queue'),
            subtitle: error?.message || t('unexpectedError', 'An unexpected error occurred'),
          });
        }
      },
      modalHeading: t('removeFromQueueConfirmation', 'Remove from mortuary queue?'),
      modalBody: t(
        'removeFromQueueWarning',
        'Are you sure you want to remove {{patientName}} from the mortuary queue? This action cannot be undone.',
        {
          patientName: patient.person.display,
        },
      ),
      primaryButtonText: t('remove', 'Remove'),
      danger: true,
    });
  };

  const patientContextValue = {
    mortuaryLocation,
    isLoading,
    mutate: mutated,
    onAdmit: handleAdmit,
    onRemoveFromQueue: handleRemoveFromQueue,
  };

  if (isLoading) {
    return (
      <div className={styles.emptyState}>
        <SkeletonText />
        <InlineLoading description={t('loadingQueuePatients', 'Loading queue patients...')} />
      </div>
    );
  }

  if (!awaitingQueuePatients || awaitingQueuePatients.length === 0) {
    return (
      <div>
        <EmptyMorgueAdmission title={t('noAwaitingPatients', 'No patients in mortuary queue')} />
      </div>
    );
  }

  const patientsToShow = filteredPatients;

  if (searchTerm.trim() && patientsToShow.length === 0) {
    return (
      <>
        <div className={styles.searchContainer}>
          <Search
            labelText={t('searchQueuePatients', 'Search queue patients')}
            placeholder={t('searchPlaceholder', 'Search by name, ID, gender, cause of death, or priority...')}
            value={searchTerm}
            onChange={handleSearchChange}
            size={controlSize}
          />
        </div>
        <EmptyMorgueAdmission title={t('noMatchingPatients', 'No matching patients found')} />
      </>
    );
  }

  return (
    <PatientProvider value={patientContextValue}>
      <div className={styles.searchContainer}>
        <Search
          labelText={t('searchQueuePatients', 'Search queue patients')}
          placeholder={t('searchPlaceholder', 'Search by name, ID, gender, cause of death, or priority...')}
          value={searchTerm}
          onChange={handleSearchChange}
          size="sm"
        />
      </div>
      <div className={styles.bedLayoutWrapper}>
        <div className={styles.bedLayoutContainer}>
          {patientsToShow.map((patient) => (
            <BedCard key={patient.uuid} patient={patient} showActions={{ admit: true, removeFromQueue: true }} />
          ))}
        </div>
      </div>
    </PatientProvider>
  );
};

export default AwaitingBedLayout;
