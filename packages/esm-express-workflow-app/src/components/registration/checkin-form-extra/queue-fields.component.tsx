import {
  InlineNotification,
  RadioButton,
  RadioButtonGroup,
  RadioButtonSkeleton,
  Select,
  SelectItem,
  SelectSkeleton,
} from '@carbon/react';
import { ResponsiveWrapper, showSnackbar, useConfig, useSession, type Visit } from '@openmrs/esm-framework';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './queue-fields.scss';
import { postQueueEntry, useMutateQueueEntries, useQueueLocations, useQueues } from './checkin-form-extra.resource';
import { ExpressWorkflowConfig } from '../../../config-schema';

export interface QueueFieldsProps {
  setOnSubmit(onSubmit: (visit: Visit) => Promise<any>);
}

/**
 * This component contains form fields for starting a patient's queue entry.
 */
const QueueFields: React.FC<QueueFieldsProps> = ({ setOnSubmit }) => {
  const { t } = useTranslation();
  const { queueLocations, isLoading: isLoadingQueueLocations } = useQueueLocations();
  const { sessionLocation } = useSession();

  const filteredQueueLocations = queueLocations.filter((location) => {
    const locationName = location.name.toLowerCase();
    return (
      locationName.includes('walkin') ||
      locationName.includes('triage') ||
      locationName.includes('walk-in') ||
      locationName.includes('walk in')
    );
  });
  const {
    visitQueueNumberAttributeUuid,
    concepts: { defaultStatusConceptUuid, defaultPriorityConceptUuid, emergencyPriorityConceptUuid },
  } = useConfig<ExpressWorkflowConfig>();

  const [selectedQueueLocation, setSelectedQueueLocation] = useState('');
  const { queues, isLoading: isLoadingQueues } = useQueues(selectedQueueLocation);
  const [selectedService, setSelectedService] = useState('');
  const [priority, setPriority] = useState(defaultPriorityConceptUuid);
  const { mutateQueueEntries } = useMutateQueueEntries();
  const memoMutateQueueEntries = useCallback(mutateQueueEntries, [mutateQueueEntries]);

  const sortWeight = priority === emergencyPriorityConceptUuid ? 1 : 0;

  const selectedLocationName = useMemo(() => {
    return filteredQueueLocations.find((loc) => loc.id === selectedQueueLocation)?.name?.toLowerCase() || '';
  }, [filteredQueueLocations, selectedQueueLocation]);

  const locationType = useMemo(() => {
    if (selectedLocationName.includes('triage')) {
      return 'triage';
    } else if (
      selectedLocationName.includes('walkin') ||
      selectedLocationName.includes('walk-in') ||
      selectedLocationName.includes('walk in')
    ) {
      return 'walk-in';
    }
    return 'triage';
  }, [selectedLocationName]);

  const serviceLabel = useMemo(() => {
    if (locationType === 'triage') {
      return t('selectTriageService', 'Select a triage service');
    } else {
      return t('selectWalkInService', 'Select a walk-in service');
    }
  }, [locationType, t]);

  const onSubmit = useCallback(
    (visit: Visit) => {
      if (selectedQueueLocation && selectedService && priority) {
        return postQueueEntry(
          visit.uuid,
          selectedService,
          visit.patient.uuid,
          priority,
          defaultStatusConceptUuid,
          sortWeight,
          selectedQueueLocation,
          visitQueueNumberAttributeUuid,
        )
          .then(() => {
            showSnackbar({
              kind: 'success',
              isLowContrast: true,
              title: t('addedPatientToQueue', 'Added patient to queue'),
              subtitle: t('queueEntryAddedSuccessfully', 'Queue entry added successfully'),
            });
            memoMutateQueueEntries();
          })
          .catch((error) => {
            showSnackbar({
              title: t('queueEntryError', 'Error adding patient to the queue'),
              kind: 'error',
              isLowContrast: false,
              subtitle: error?.message,
            });
            throw error;
          });
      } else {
        return Promise.resolve();
      }
    },
    [
      selectedQueueLocation,
      selectedService,
      priority,
      sortWeight,
      defaultStatusConceptUuid,
      visitQueueNumberAttributeUuid,
      memoMutateQueueEntries,
      t,
    ],
  );

  useEffect(() => {
    setOnSubmit?.(onSubmit);
  }, [onSubmit, setOnSubmit]);
  useEffect(() => {
    if (filteredQueueLocations.length > 0 && !selectedQueueLocation) {
      const triageLocation = filteredQueueLocations.find((location) => location.name.toLowerCase().includes('triage'));
      const defaultLocation = triageLocation?.id || filteredQueueLocations[0]?.id;
      setSelectedQueueLocation(defaultLocation);
    }
  }, [filteredQueueLocations, selectedQueueLocation]);

  useEffect(() => {
    if (filteredQueueLocations.map((l) => l.id).includes(sessionLocation.uuid)) {
      setSelectedQueueLocation(sessionLocation.uuid);
    }
  }, [filteredQueueLocations, sessionLocation.uuid]);

  return (
    <div>
      <section className={styles.section}>
        <div className={styles.sectionTitle}>{t('patientCategory', 'Patient Category')}</div>
        <ResponsiveWrapper>
          {isLoadingQueueLocations ? (
            <RadioButtonGroup name={'queueLocation'} orientation="vertical">
              <RadioButtonSkeleton />
              <RadioButtonSkeleton />
              <RadioButtonSkeleton />
            </RadioButtonGroup>
          ) : filteredQueueLocations?.length > 0 ? (
            <RadioButtonGroup
              className={styles.radioButtonWrapper}
              name="queueLocation"
              id="queueLocation"
              orientation="vertical"
              valueSelected={selectedQueueLocation}
              onChange={(value) => setSelectedQueueLocation(String(value))}>
              {filteredQueueLocations.map((location) => (
                <RadioButton
                  key={location.id}
                  className={styles.radioButtonOption}
                  labelText={location.name}
                  value={location.id}
                />
              ))}
            </RadioButtonGroup>
          ) : (
            <InlineNotification
              className={styles.inlineNotification}
              kind={'error'}
              lowContrast
              subtitle={t('configureQueueLocations', 'Please configure queue locations to continue.')}
              title={t('noQueueLocationsConfigured', 'No queue locations configured')}
            />
          )}
        </ResponsiveWrapper>
      </section>

      <section className={styles.section}>
        {isLoadingQueues ? (
          <SelectSkeleton />
        ) : !queues?.length ? (
          <InlineNotification
            className={styles.inlineNotification}
            kind={'error'}
            lowContrast
            subtitle={t('configureServices', 'Please configure services to continue.')}
            title={t('noServicesConfigured', 'No services configured')}
          />
        ) : (
          <Select
            labelText={serviceLabel}
            id="service"
            name="service"
            invalidText="Required"
            value={selectedService}
            onChange={(event) => setSelectedService(event.target.value)}>
            {!selectedService ? <SelectItem text={t('selectQueueService', 'Select a queue service')} value="" /> : null}
            {queues?.length > 0 &&
              queues.map((service) => (
                <SelectItem key={service.uuid} text={service.name} value={service.uuid}>
                  {service.name}
                </SelectItem>
              ))}
          </Select>
        )}
      </section>
    </div>
  );
};

export default QueueFields;
