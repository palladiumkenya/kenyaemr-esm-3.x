import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../header/header.component';
import styles from './home.scss';
import Summary from '../summary/summary.component';
import CustomContentSwitcher from '../switcher/content-switcher.component';
import { useLocation, useMortuaryAdmissionLocation } from '../bed-layout/bed-layout.resource';
import { transformQueueEntryToPatient, useDischargedPatients, useMortuaryQueueEntries } from './home.resource';

const HomeViewComponent: React.FC = () => {
  const { t } = useTranslation();
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [hasInitialDataLoaded, setHasInitialDataLoaded] = useState(false);

  const { locations, isLoading: isLoadingLocation, error: locationError } = useLocation();

  const { queueEntries, isLoading: isLoadingQueue, error: queueError, mutate: mutateQueue } = useMortuaryQueueEntries();

  const {
    admissionLocation,
    isLoading: isLoadingAdmission,
    error: admissionError,
    mutate: mutateAdmission,
  } = useMortuaryAdmissionLocation(selectedLocation);

  const {
    dischargedPatients,
    dischargedPatientsCount,
    isLoading: isLoadingDischarge,
    error: dischargeError,
    mutate: mutateDischarge,
  } = useDischargedPatients(admissionLocation);

  const awaitingQueuePatients = useMemo(() => {
    return queueEntries.map(transformQueueEntryToPatient);
  }, [queueEntries]);

  const admittedCount = useMemo(() => {
    if (!admissionLocation?.bedLayouts) {
      return 0;
    }
    return admissionLocation.bedLayouts.reduce((total, bed) => total + (bed.patients?.length || 0), 0);
  }, [admissionLocation]);

  const locationItems = useMemo(() => {
    return locations.map((location) => ({
      id: location.ward.uuid,
      text: location.ward.display,
      ...location,
    }));
  }, [locations]);

  useEffect(() => {
    if (locationItems?.length === 1 && !selectedLocation) {
      setSelectedLocation(locationItems[0].id);
    }
  }, [locationItems, selectedLocation]);

  const isInitialDataLoading = useMemo(() => {
    return (
      isLoadingLocation ||
      isLoadingQueue ||
      isLoadingAdmission ||
      isLoadingDischarge ||
      (!selectedLocation && locationItems?.length === 0)
    );
  }, [isLoadingLocation, isLoadingQueue, isLoadingAdmission, isLoadingDischarge, selectedLocation, locationItems]);

  useEffect(() => {
    if (!isInitialDataLoading && selectedLocation) {
      setHasInitialDataLoaded(true);
    }
  }, [isInitialDataLoading, selectedLocation]);

  const handleLocationChange = useCallback((data: { selectedItem: { id: string; text: string } }) => {
    if (data.selectedItem) {
      setSelectedLocation(data.selectedItem.id);
      setHasInitialDataLoaded(false);
    }
  }, []);

  const mutateAllData = useCallback(() => {
    mutateQueue();
    mutateAdmission();
    mutateDischarge();
  }, [mutateQueue, mutateAdmission, mutateDischarge]);

  return (
    <section className={styles.section}>
      <Header title={t('mortuary', 'Mortuary')} />
      <Summary
        awaitingQueueCount={awaitingQueuePatients.length}
        admittedCount={admittedCount}
        dischargedCount={dischargedPatientsCount}
        isLoading={isInitialDataLoading && !hasInitialDataLoaded}
      />
      <CustomContentSwitcher
        awaitingQueuePatients={awaitingQueuePatients}
        isLoadingQueue={isLoadingQueue}
        locationItems={locationItems}
        selectedLocation={selectedLocation}
        admissionLocation={admissionLocation}
        isLoadingLocation={isLoadingLocation}
        isLoadingAdmission={isLoadingAdmission}
        locationError={locationError}
        admissionError={admissionError}
        queueError={queueError}
        onLocationChange={handleLocationChange}
        mutate={mutateAllData}
        dischargedPatients={dischargedPatients}
        dischargedPatientsCount={dischargedPatientsCount}
        isLoadingDischarge={isLoadingDischarge}
      />
    </section>
  );
};

export default HomeViewComponent;
