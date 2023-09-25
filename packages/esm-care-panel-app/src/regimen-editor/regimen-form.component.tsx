import React, { useEffect, useState, useMemo, useCallback } from 'react';
import dayjs from 'dayjs';
import {
  Button,
  ButtonSet,
  DatePicker,
  DatePickerInput,
  Form,
  Layer,
  SelectItem,
  Stack,
  RadioButtonGroup,
  RadioButton,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import {
  useLocations,
  useSession,
  useLayoutType,
  toOmrsIsoString,
  toDateObjectStrict,
  showNotification,
  showToast,
  useConfig,
  showModal,
} from '@openmrs/esm-framework';
import styles from './standard-regimen.scss';
import { closeOverlay } from '../hooks/useOverlay';
import StandardRegimen from './standard-regimen.component';
import RegimenReason from './regimen-reason.component';
import { Encounter, Regimen, UpdateObs } from '../types';
import { saveEncounter, updateEncounter } from './regimen.resource';
import { useRegimenEncounter } from '../hooks/useRegimenEncounter';
import { CarePanelConfig } from '../config-schema';
import { mutate } from 'swr';

interface RegimenFormProps {
  patientUuid: string;
  category: string;
  onRegimen: string;
}

const RegimenForm: React.FC<RegimenFormProps> = ({ patientUuid, category, onRegimen }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const locations = useLocations();
  const sessionUser = useSession();
  const config = useConfig() as CarePanelConfig;
  const { regimenEncounter, isLoading, error } = useRegimenEncounter(category, patientUuid);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visitDate, setVisitDate] = useState(new Date());
  const [regimenEvent, setRegimenEvent] = useState('');
  const [standRegimen, setStandardRegimen] = useState('');
  const [standRegimenLine, setStandardRegimenLine] = useState('');
  const [regimenReason, setRegimenReason] = useState('');
  const [obsArray, setObsArray] = useState([]);
  const [obsArrayForPrevEncounter, setObsArrayForPrevEncounter] = useState([]);

  const regimenType = [
    {
      display: 'Use standard regimen',
      uuid: 'uuid',
    },
    {
      display: 'Use non standard regimen',
      uuid: 'uuid',
    },
  ];
  const addObjectOrUpdate = (objectToAdd) => {
    if (doesObjectExistInArray(obsArray, objectToAdd)) {
      setObsArray((prevObsArrayForPrevEncounter) =>
        prevObsArrayForPrevEncounter.map((obs) => (obs.concept === objectToAdd.concept ? objectToAdd : obs)),
      );
    } else {
      setObsArray((prevObsArray) => [...prevObsArray, objectToAdd]);
    }
  };

  const addObjectToUpdatePreviousEnc = (objectToAdd) => {
    if (doesObjectExistInArray(obsArrayForPrevEncounter, objectToAdd)) {
      setObsArrayForPrevEncounter((prevObsArrayForPrevEncounter) =>
        prevObsArrayForPrevEncounter.map((obs) => (obs.concept === objectToAdd.concept ? objectToAdd : obs)),
      );
    } else {
      setObsArrayForPrevEncounter((prevObsArrayForPrevEncounter) => [...prevObsArrayForPrevEncounter, objectToAdd]);
    }
  };

  const doesObjectExistInArray = (obsArray, objectToCheck) =>
    obsArray.some((obs) => obs.concept === objectToCheck.concept);

  useEffect(() => {
    if (standRegimenLine && regimenEvent !== Regimen.stopRegimenConcept) {
      const regimenLineObs = {
        concept: Regimen.RegimenLineConcept,
        value: standRegimenLine,
      };
      addObjectOrUpdate(regimenLineObs);
    }

    if (standRegimen && regimenEvent !== Regimen.stopRegimenConcept) {
      const standRegimenObs = {
        concept: Regimen.standardRegimenConcept,
        value: standRegimen,
      };
      addObjectOrUpdate(standRegimenObs);
    }

    if (
      regimenReason &&
      (regimenEvent === Regimen.stopRegimenConcept || regimenEvent === Regimen.changeRegimenConcept)
    ) {
      const regimenReasonObs = {
        concept: Regimen.reasonCodedConcept,
        value: regimenReason,
      };
      addObjectToUpdatePreviousEnc(regimenReasonObs);
    }
    if (visitDate && (regimenEvent === Regimen.stopRegimenConcept || regimenEvent === Regimen.changeRegimenConcept)) {
      const dateStoppedRegObs = {
        concept: Regimen.dateDrugStoppedCon,
        value: toDateObjectStrict(
          toOmrsIsoString(new Date(dayjs(visitDate).year(), dayjs(visitDate).month(), dayjs(visitDate).date())),
        ),
      };
      addObjectToUpdatePreviousEnc(dateStoppedRegObs);
    }
    if (regimenEvent && category === 'ARV') {
      const categoryObs = {
        concept: Regimen.arvCategoryConcept,
        value: regimenEvent,
      };
      addObjectOrUpdate(categoryObs);
    }
  }, [standRegimenLine, regimenReason, standRegimen, category, regimenEvent, visitDate]);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();

      setIsSubmitting(true);

      const encounterToSave: Encounter = {
        encounterDatetime: toDateObjectStrict(
          toOmrsIsoString(new Date(dayjs(visitDate).year(), dayjs(visitDate).month(), dayjs(visitDate).date())),
        ),
        patient: patientUuid,
        encounterType: Regimen.regimenEncounterType,
        location: sessionUser?.sessionLocation?.uuid,
        encounterProviders: [
          {
            provider: sessionUser?.currentProvider?.uuid,
            encounterRole: config.regimenObs.encounterProviderRoleUuid,
          },
        ],
        form: Regimen.regimenForm,
        obs: obsArray,
      };
      const encounterToUpdate: UpdateObs = {
        obs: obsArrayForPrevEncounter,
      };
      if (regimenEncounter.uuid) {
        updateEncounter(encounterToUpdate, regimenEncounter.uuid);
      }
      if (obsArray.length > 0) {
        saveEncounter(encounterToSave).then(
          (response) => {
            if (response.status === 201) {
              showToast({
                kind: 'success',
                title: t('regimenUpdated', 'Regimen updated'),
                description: t('regimenUpdatedSuccessfully', `Regimen updated successfully.`),
              });
              setIsSubmitting(false);
              mutate(`/ws/rest/v1/kenyaemr/currentProgramDetails?patientUuid=${patientUuid}`);
              mutate(`/ws/rest/v1/kenyaemr/patientSummary?patientUuid=${patientUuid}`);
              mutate(`/ws/rest/v1/kenyaemr/regimenHistory?patientUuid=${patientUuid}&category=${category}`);
              closeOverlay();
            }
          },
          (error) => {
            showNotification({
              title: t('regimenError', 'Error updating regimen'),
              kind: 'error',
              critical: true,
              description: error?.message,
            });
          },
        );
      }
    },
    [
      patientUuid,
      t,
      category,
      visitDate,
      obsArray,
      obsArrayForPrevEncounter,
      sessionUser?.currentProvider?.uuid,
      regimenEncounter.uuid,
      sessionUser?.sessionLocation?.uuid,
      config.regimenObs.encounterProviderRoleUuid,
    ],
  );

  const handleOnChange = () => {
    // setIgnoreChanges((prevState) => !prevState);
  };
  const launchCancelAppointmentDialog = () => {
    const dispose = showModal('delete-regimen-confirmation-dialog', {
      closeCancelModal: () => dispose(),
      regimenEncounterUuid: regimenEncounter.uuid,
      patientUuid: patientUuid,
      category: category,
    });
  };

  return (
    <Form className={styles.form} onChange={handleOnChange} onSubmit={handleSubmit}>
      <div>
        <Stack gap={8} className={styles.container}>
          <section className={styles.section}>
            <div className={styles.sectionTitle}>{t('regimenEvent', 'Regimen event')}</div>
            <RadioButtonGroup
              className={styles.radioButtonWrapper}
              name="regimenEvent"
              onChange={(uuid) => {
                setRegimenEvent(uuid);
              }}>
              <RadioButton
                key={'start-regimen'}
                labelText={t('startRegimen', 'Start')}
                value={Regimen.startOrRestartConcept}
              />

              <RadioButton
                key={'restart-regimen'}
                labelText={t('restartRegimen', 'Restart')}
                value={Regimen.startOrRestartConcept}
              />

              <RadioButton
                key={'change-regimen'}
                labelText={t('changeRegimen', 'Change')}
                value={Regimen.changeRegimenConcept}
              />
              <RadioButton
                key={'stop-regimen'}
                labelText={t('stopRegimen', 'Stop')}
                value={Regimen.stopRegimenConcept}
              />
              <RadioButton
                key={'undo-regimen'}
                labelText={t('undoRegimen', 'Undo')}
                value={'undo'}
                onClick={launchCancelAppointmentDialog}
              />
            </RadioButtonGroup>
            {regimenEvent ? (
              <>
                {regimenEvent !== 'undo' ? (
                  <DatePicker
                    dateFormat="d/m/Y"
                    datePickerType="single"
                    id="regimenDate"
                    style={{ paddingBottom: '1rem' }}
                    maxDate={new Date().toISOString()}
                    onChange={([date]) => setVisitDate(date)}
                    value={visitDate}>
                    <DatePickerInput
                      id="regimenDateInput"
                      labelText={t('date', 'Date')}
                      placeholder="dd/mm/yyyy"
                      style={{ width: '100%' }}
                    />
                  </DatePicker>
                ) : null}

                {regimenEvent && regimenEvent !== Regimen.stopRegimenConcept && regimenEvent !== 'undo' ? (
                  <>
                    <RadioButtonGroup
                      className={styles.radioButtonWrapper}
                      name="regimenType"
                      onChange={(uuid) => {
                        // setRegimenType(uuid);
                      }}>
                      {regimenType?.length > 0 &&
                        regimenType.map(({ uuid, display }) => (
                          <RadioButton key={uuid} labelText={display} value={uuid} />
                        ))}
                    </RadioButtonGroup>
                    <StandardRegimen
                      category={category}
                      setStandardRegimen={setStandardRegimen}
                      setStandardRegimenLine={setStandardRegimenLine}
                    />
                  </>
                ) : null}

                {regimenEvent !== 'undo' ? (
                  <RegimenReason category={category} setRegimenReason={setRegimenReason} />
                ) : null}
              </>
            ) : null}
          </section>
        </Stack>
      </div>
      <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
        <Button className={styles.button} kind="secondary" onClick={closeOverlay}>
          {t('discard', 'Discard')}
        </Button>
        <Button className={styles.button} disabled={isSubmitting} kind="primary" type="submit">
          {t('save', 'Save')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default RegimenForm;
