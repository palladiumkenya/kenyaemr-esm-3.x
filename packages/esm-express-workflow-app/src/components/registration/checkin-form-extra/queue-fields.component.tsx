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
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './queue-fields.scss';
import { postQueueEntry, useMutateQueueEntries, useQueueRooms } from './checkin-form-extra.resource';
import { ExpressWorkflowConfig } from '../../../config-schema';

export interface QueueFieldsProps {
  setOnSubmit(onSubmit: (visit: Visit) => Promise<any>);
}

const PATIENT_CATEGORIES = [
  { id: 'triage', name: 'Triage' },
  { id: 'walk-in', name: 'Walk-in' },
];

/**
 * This component contains form fields for starting a patient's queue entry.
 */
const QueueFields: React.FC<QueueFieldsProps> = ({ setOnSubmit }) => {
  const { t } = useTranslation();
  const { queueRooms, isLoading: isLoadingQueueRooms } = useQueueRooms();
  const { sessionLocation } = useSession();

  const {
    visitQueueNumberAttributeUuid,
    concepts: { defaultStatusConceptUuid, defaultPriorityConceptUuid, emergencyPriorityConceptUuid },
  } = useConfig<ExpressWorkflowConfig>();

  const [selectedCategory, setSelectedCategory] = useState('triage');
  const [selectedQueueRoom, setSelectedQueueRoom] = useState('');
  const [priority, setPriority] = useState(defaultPriorityConceptUuid);
  const { mutateQueueEntries } = useMutateQueueEntries();
  const memoMutateQueueEntries = useCallback(mutateQueueEntries, [mutateQueueEntries]);

  const sortWeight = priority === emergencyPriorityConceptUuid ? 1 : 0;

  const filteredQueueRooms = useMemo(() => {
    if (!queueRooms || queueRooms.length === 0) {
      return [];
    }

    return queueRooms.filter((room) => {
      const roomName = room.name.toLowerCase();
      const queueName = room.queue?.display?.toLowerCase() || '';
      const serviceName = room.queue?.service?.display?.toLowerCase() || '';

      if (selectedCategory === 'triage') {
        return roomName.includes('triage') || queueName.includes('triage') || serviceName.includes('triage');
      } else if (selectedCategory === 'walk-in') {
        const isTriageRoom =
          roomName.includes('triage') || queueName.includes('triage') || serviceName.includes('triage');

        return !isTriageRoom;
      }
      return false;
    });
  }, [queueRooms, selectedCategory]);

  const serviceLabel = useMemo(() => {
    if (selectedCategory === 'triage') {
      return t('selectTriageRoom', 'Select a triage room');
    } else {
      return t('selectWalkInRoom', 'Select a walk-in room');
    }
  }, [selectedCategory, t]);

  const onSubmit = useCallback(
    (visit: Visit) => {
      if (selectedQueueRoom && priority) {
        const selectedRoom = filteredQueueRooms.find((room) => room.uuid === selectedQueueRoom);
        const queueUuid = selectedRoom?.queue?.uuid;

        if (!queueUuid) {
          showSnackbar({
            title: t('queueEntryError', 'Error adding patient to the queue'),
            kind: 'error',
            isLowContrast: false,
            subtitle: t('noQueueAssociated', 'No queue associated with selected room'),
          });
          return Promise.reject(new Error('No queue associated with selected room'));
        }

        return postQueueEntry(
          visit.uuid,
          queueUuid,
          visit.patient.uuid,
          priority,
          defaultStatusConceptUuid,
          sortWeight,
          sessionLocation.uuid,
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
      selectedQueueRoom,
      priority,
      sortWeight,
      defaultStatusConceptUuid,
      visitQueueNumberAttributeUuid,
      memoMutateQueueEntries,
      sessionLocation.uuid,
      filteredQueueRooms,
      t,
    ],
  );

  useEffect(() => {
    setOnSubmit?.(onSubmit);
  }, [onSubmit, setOnSubmit]);

  useEffect(() => {
    setSelectedQueueRoom('');
  }, [selectedCategory]);

  useEffect(() => {
    if (filteredQueueRooms.length > 0 && !selectedQueueRoom) {
      setSelectedQueueRoom(filteredQueueRooms[0].uuid);
    }
  }, [filteredQueueRooms, selectedQueueRoom]);

  return (
    <div>
      <section className={styles.section}>
        <div className={styles.sectionTitle}>{t('patientCategory', 'Patient Category')}</div>
        <ResponsiveWrapper>
          <RadioButtonGroup
            className={styles.radioButtonWrapper}
            name="patientCategory"
            id="patientCategory"
            orientation="vertical"
            valueSelected={selectedCategory}
            onChange={(value) => setSelectedCategory(String(value))}>
            {PATIENT_CATEGORIES.map((category) => (
              <RadioButton
                key={category.id}
                className={styles.radioButtonOption}
                labelText={category.name}
                value={category.id}
              />
            ))}
          </RadioButtonGroup>
        </ResponsiveWrapper>
      </section>

      <section className={styles.section}>
        {isLoadingQueueRooms ? (
          <SelectSkeleton />
        ) : !filteredQueueRooms?.length ? (
          <InlineNotification
            className={styles.inlineNotification}
            kind={'error'}
            lowContrast
            subtitle={t('configureQueueRooms', `Please configure ${selectedCategory} queue rooms to continue.`)}
            title={t('noQueueRoomsConfigured', 'No queue rooms configured')}
          />
        ) : (
          <Select
            labelText={serviceLabel}
            id="queueRoom"
            name="queueRoom"
            invalidText="Required"
            value={selectedQueueRoom}
            onChange={(event) => setSelectedQueueRoom(event.target.value)}>
            {!selectedQueueRoom ? <SelectItem text={t('selectQueueRoom', 'Select a queue room')} value="" /> : null}
            {filteredQueueRooms?.length > 0 &&
              filteredQueueRooms.map((room) => (
                <SelectItem key={room.uuid} text={room.name} value={room.uuid}>
                  {room.name}
                </SelectItem>
              ))}
          </Select>
        )}
      </section>
    </div>
  );
};

export default QueueFields;
