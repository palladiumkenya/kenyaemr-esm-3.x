import React from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../header/header.component';
import styles from './home.scss';
import Summary from '../summary/summary.component';
import CustomContentSwitcher from '../switcher/content-switcher.component';
import { useAwaitingPatients, useAwaitingQueuePatients } from './home.resource';
import { useLocation, useMortuaryAdmissionLocation } from '../bed-layout/bed-layout.resource';

const HomeViewComponent: React.FC = () => {
  const { t } = useTranslation();

  const [selectedLocation, setSelectedLocation] = React.useState<string>('');

  const { locations, isLoading: isLoadingLocation, error: locationError } = useLocation();

  const {
    admissionLocation,
    isLoading: isLoadingAdmission,
    error: admissionError,
    mutate,
  } = useMortuaryAdmissionLocation(selectedLocation);

  const {
    awaitingQueueDeceasedPatients,
    admittedPatients,
    dischargedPatients,
    dischargedPatientsCount,
    isLoadingAwaitingQueuePatients,
    isLoadingDischarge,
    isLoadingAll,
    errorFetchingAwaitingQueuePatients,
    mutateAwaitingQueuePatients,
    mutateAll,
  } = useAwaitingQueuePatients(admissionLocation);

  const locationItems = React.useMemo(() => {
    return locations.map((location) => ({
      id: location.ward.uuid,
      text: location.ward.display,
      ...location,
    }));
  }, [locations]);

  React.useEffect(() => {
    if (locationItems.length === 1 && !selectedLocation) {
      setSelectedLocation(locationItems[0].id);
    }
  }, [locationItems, selectedLocation]);

  const trulyAwaitingPatients = useAwaitingPatients(awaitingQueueDeceasedPatients);

  const handleLocationChange = React.useCallback((data: { selectedItem: { id: string; text: string } }) => {
    if (data.selectedItem) {
      setSelectedLocation(data.selectedItem.id);
    }
  }, []);

  return (
    <section className={styles.section}>
      <Header title={t('mortuary', 'Mortuary')} />
      <Summary
        awaitingQueueCount={trulyAwaitingPatients.length}
        admittedCount={admittedPatients.length}
        dischargedCount={dischargedPatientsCount}
        isLoading={isLoadingAll}
      />
      <CustomContentSwitcher
        awaitingQueueDeceasedPatients={trulyAwaitingPatients}
        isLoading={isLoadingAwaitingQueuePatients}
        locationItems={locationItems}
        selectedLocation={selectedLocation}
        admissionLocation={admissionLocation}
        isLoadingLocation={isLoadingLocation}
        isLoadingAdmission={isLoadingAdmission}
        locationError={locationError}
        admissionError={admissionError}
        onLocationChange={handleLocationChange}
        mutate={mutate}
        dischargedPatients={dischargedPatients}
        isLoadingDischarge={isLoadingDischarge}
      />
    </section>
  );
};

export default HomeViewComponent;
