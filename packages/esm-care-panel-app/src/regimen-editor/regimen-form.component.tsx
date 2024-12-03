import React, { useEffect, useState, useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import {
  Button,
  ButtonSet,
  DatePicker,
  DatePickerInput,
  Form,
  Stack,
  RadioButtonGroup,
  RadioButton,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import {
  useSession,
  useLayoutType,
  toOmrsIsoString,
  toDateObjectStrict,
  showNotification,
  useConfig,
  showModal,
  showSnackbar,
} from '@openmrs/esm-framework';
import styles from './standard-regimen.scss';
import StandardRegimen from './standard-regimen.component';
import RegimenReason from './regimen-reason.component';
import { Encounter, Regimen, UpdateObs } from '../types';
import { saveEncounter, updateEncounter } from './regimen.resource';
import { useRegimenEncounter } from '../hooks/useRegimenEncounter';
import { CarePanelConfig } from '../config-schema';
import { mutate } from 'swr';
import NonStandardRegimen from './non-standard-regimen.component';
import { addOrUpdateObsObject } from './utils';
import { z } from 'zod';

interface RegimenFormProps {
  patientUuid: string;
  category: string;
  onRegimen: string;
  lastRegimenEncounter: {
    uuid: string;
    startDate: string;
    endDate: string;
    event: string;
  };
  closeWorkspace: () => void;
}
// Base schema with common fields
const baseSchema = z.object({
  regimenEvent: z.string().min(1, { message: 'Please select a regimen event' }),
  visitDate: z.date({ required_error: 'Please select a visit date' }),
});

// Schema for standard regimen fields
const standardRegimenSchema = z.object({
  standardRegimenLine: z.string().min(1, { message: 'Please select a regimen line' }),
  standardRegimen: z.string().min(1, { message: 'Please select a regimen' }),
});

// Schema for regimen type selection
const regimenTypeSchema = z.object({
  selectedRegimenType: z.string().min(1, 'Please select a regimen type'),
});

// Schema for regimen reason
const regimenReasonSchema = z.object({
  regimenReason: z.string().min(1, { message: 'Please provide a reason for regimen change/stop' }),
});

// Schema for non standard regimen fields
const nonStandardRegimenSchema = z.object({
  standardRegimenLine: z.string().min(1, { message: 'Please select a regimen line' }),
  nonStandardRegimens: z.array(z.string()).min(1, { message: 'Please select at least one drug regimen' }),
});

// Function to get dynamic schema based on regimen event and type
const getRegimenFormSchema = (regimenEvent: string, selectedRegimenType: string) => {
  let schema = baseSchema;

  if (regimenEvent === Regimen.stopRegimenConcept) {
    schema = schema.merge(regimenReasonSchema);
  } else if (regimenEvent === Regimen.changeRegimenConcept) {
    schema = schema.merge(regimenReasonSchema).merge(regimenTypeSchema);
    if (selectedRegimenType === 'standardUuid') {
      schema = schema.merge(standardRegimenSchema);
    } else if (selectedRegimenType === 'nonStandardUuid') {
      schema = schema.merge(nonStandardRegimenSchema);
    }
  } else if (regimenEvent === Regimen.startOrRestartConcept) {
    schema = schema.merge(regimenTypeSchema);
    if (selectedRegimenType === 'standardUuid') {
      schema = schema.merge(standardRegimenSchema);
    } else if (selectedRegimenType === 'nonStandardUuid') {
      schema = schema.merge(nonStandardRegimenSchema);
    }
  }

  return schema;
};

const RegimenForm: React.FC<RegimenFormProps> = ({
  patientUuid,
  category,
  onRegimen,
  lastRegimenEncounter,
  closeWorkspace,
}) => {
  const { t } = useTranslation();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isTablet = useLayoutType() === 'tablet';
  const sessionUser = useSession();
  const config = useConfig() as CarePanelConfig;
  const { regimenEncounter, isLoading, error } = useRegimenEncounter(category, patientUuid);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visitDate, setVisitDate] = useState(new Date());
  const [regimenEvent, setRegimenEvent] = useState('');
  const [standardRegimen, setStandardRegimen] = useState('');
  const [standardRegimenLine, setStandardRegimenLine] = useState('');
  const [nonStandardRegimens, setNonStandardRegimens] = useState([]);
  const [regimenReason, setRegimenReason] = useState('');
  const [selectedRegimenType, setSelectedRegimenType] = useState('');
  const [obsArray, setObsArray] = useState([]);
  const [obsArrayForPrevEncounter, setObsArrayForPrevEncounter] = useState([]);

  useEffect(() => {
    const regimenLineObs = {
      concept: Regimen.RegimenLineConcept,
      value: standardRegimenLine,
    };
    const standardRegimenObs = {
      concept: Regimen.standardRegimenConcept,
      value: standardRegimen,
    };
    const regimenReasonObs = {
      concept: Regimen.reasonCodedConcept,
      value: regimenReason,
    };
    const dateStoppedRegObs = {
      concept: Regimen.dateDrugStoppedCon,
      value: toDateObjectStrict(
        toOmrsIsoString(new Date(dayjs(visitDate).year(), dayjs(visitDate).month(), dayjs(visitDate).date())),
      ),
    };
    const categoryObs = {
      concept: category === 'ARV' ? Regimen.arvCategoryConcept : Regimen.tbCategoryConcept,
      value: regimenEvent,
    };

    if (standardRegimenLine && regimenEvent !== Regimen.stopRegimenConcept) {
      addOrUpdateObsObject(regimenLineObs, obsArray, setObsArray);
    }

    if (standardRegimen && regimenEvent !== Regimen.stopRegimenConcept) {
      addOrUpdateObsObject(standardRegimenObs, obsArray, setObsArray);
    }

    if (
      regimenReason &&
      (regimenEvent === Regimen.stopRegimenConcept || regimenEvent === Regimen.changeRegimenConcept)
    ) {
      addOrUpdateObsObject(regimenReasonObs, obsArrayForPrevEncounter, setObsArrayForPrevEncounter);
    }

    if (visitDate && (regimenEvent === Regimen.stopRegimenConcept || regimenEvent === Regimen.changeRegimenConcept)) {
      addOrUpdateObsObject(dateStoppedRegObs, obsArrayForPrevEncounter, setObsArrayForPrevEncounter);
    }

    if (regimenEvent && category) {
      if (regimenEvent === Regimen.stopRegimenConcept) {
        addOrUpdateObsObject(categoryObs, obsArrayForPrevEncounter, setObsArrayForPrevEncounter);
      } else {
        addOrUpdateObsObject(categoryObs, obsArray, setObsArray);
      }
    }
  }, [
    standardRegimenLine,
    regimenReason,
    standardRegimen,
    category,
    regimenEvent,
    visitDate,
    obsArray,
    obsArrayForPrevEncounter,
  ]);

  useEffect(() => {
    if (
      selectedRegimenType === 'nonStandardUuid' &&
      nonStandardRegimens.length > 0 &&
      regimenEvent !== Regimen.stopRegimenConcept
    ) {
      setObsArray((prevObsArray) => {
        const distinctValuesMap = new Map();
        prevObsArray.forEach((item) => {
          distinctValuesMap.set(item.value, item);
        });
        nonStandardRegimens.forEach((item) => {
          distinctValuesMap.set(item.value, item);
        });
        const uniqueObsArray = Array.from(distinctValuesMap.values());
        return uniqueObsArray;
      });
    }
  }, [selectedRegimenType, nonStandardRegimens, regimenEvent]);

  const validateForm = useCallback(() => {
    const formData = {
      regimenEvent,
      selectedRegimenType,
      standardRegimenLine,
      standardRegimen,
      regimenReason,
      visitDate,
      nonStandardRegimens: nonStandardRegimens.map((reg) => reg.value),
    };

    try {
      const schema = getRegimenFormSchema(regimenEvent, selectedRegimenType);
      schema.parse(formData);
      setErrors({});
      return true;
    } catch (validationError) {
      const errorMap = validationError.errors.reduce((acc: Record<string, string>, err) => {
        acc[err.path[0]] = err.message;
        return acc;
      }, {});
      setErrors(errorMap);
      return false;
    }
  }, [
    regimenEvent,
    selectedRegimenType,
    standardRegimenLine,
    standardRegimen,
    regimenReason,
    visitDate,
    nonStandardRegimens,
  ]);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      if (!validateForm()) {
        return;
      }
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
        closeWorkspace();
      }

      if (obsArray.length > 0) {
        saveEncounter(encounterToSave).then(
          (response) => {
            if (response.status === 201) {
              showSnackbar({
                title: t('regimenUpdated', 'Regimen updated'),
                subtitle: t('regimenUpdatedSuccessfully', 'Regimen updated successfully'),
                kind: 'success',
                timeoutInMs: 3500,
                isLowContrast: true,
              });
              setIsSubmitting(false);
              mutate(`/ws/rest/v1/kenyaemr/currentProgramDetails?patientUuid=${patientUuid}`);
              mutate(`/ws/rest/v1/kenyaemr/patientSummary?patientUuid=${patientUuid}`);
              mutate(`/ws/rest/v1/kenyaemr/regimenHistory?patientUuid=${patientUuid}&category=${category}`);
              mutate(`/ws/rest/v1/kenyaemr/lastRegimenEncounter?patientUuid=${patientUuid}&category=${category}`);

              closeWorkspace();
            }
          },
          (error) => {
            showNotification({
              title: t('regimenError', 'Error updating regimen'),
              kind: 'error',
              critical: true,
              description: error?.message,
            });
            setIsSubmitting(false);
          },
        );
      } else {
        setIsSubmitting(false);
      }
    },
    [
      validateForm,
      visitDate,
      patientUuid,
      sessionUser?.sessionLocation?.uuid,
      sessionUser?.currentProvider?.uuid,
      config.regimenObs.encounterProviderRoleUuid,
      obsArray,
      obsArrayForPrevEncounter,
      regimenEncounter.uuid,
      closeWorkspace,
      t,
      category,
    ],
  );

  const launchDeleteRegimenDialog = () => {
    const dispose = showModal('delete-regimen-confirmation-dialog', {
      closeCancelModal: () => dispose(),
      regimenEncounterUuid: regimenEncounter.uuid,
      patientUuid,
      category,
      closeWorkspace,
    });
  };

  const regimenDatePicker = useMemo(
    () => (
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
          invalid={!!errors.visitDate}
          invalidText={errors.visitDate}
        />
      </DatePicker>
    ),
    [visitDate, t, errors.visitDate],
  );

  return (
    <Form className={styles.form} onSubmit={handleSubmit}>
      <div>
        <Stack gap={8} className={styles.container}>
          <h4 className={styles.regimenTitle}>Current Regimen: {onRegimen}</h4>
          <section className={styles.section}>
            <div className={styles.sectionTitle}>{t('regimenEvent', 'Regimen event')}</div>
            <RadioButtonGroup
              className={styles.radioButtonWrapper}
              name="regimenEvent"
              onChange={(uuid) => setRegimenEvent(uuid)}>
              <RadioButton
                key={'start-regimen'}
                labelText={t('startRegimen', 'Start')}
                value={Regimen.startOrRestartConcept}
                disabled={lastRegimenEncounter.uuid}
              />
              <RadioButton
                key={'restart-regimen'}
                labelText={t('restartRegimen', 'Restart')}
                value={Regimen.startOrRestartConcept}
                disabled={!lastRegimenEncounter.endDate && lastRegimenEncounter.event !== 'STOP ALL'}
              />
              <RadioButton
                key={'change-regimen'}
                labelText={t('changeRegimen', 'Change')}
                value={Regimen.changeRegimenConcept}
                disabled={!lastRegimenEncounter.startDate || lastRegimenEncounter.event === 'STOP ALL'}
              />
              <RadioButton
                key={'stop-regimen'}
                labelText={t('stopRegimen', 'Stop')}
                value={Regimen.stopRegimenConcept}
                disabled={lastRegimenEncounter.endDate || (!lastRegimenEncounter.uuid && !lastRegimenEncounter.endDate)}
              />
              <RadioButton
                key={'undo-regimen'}
                labelText={t('undoRegimen', 'Undo')}
                value={'undo'}
                disabled={!lastRegimenEncounter.uuid}
                onClick={launchDeleteRegimenDialog}
              />
            </RadioButtonGroup>
            {errors.regimenEvent && <div className={styles.errorText}>{errors.regimenEvent}</div>}
            {regimenEvent ? (
              <>
                {regimenEvent !== 'undo' && regimenDatePicker}
                {regimenEvent && regimenEvent !== Regimen.stopRegimenConcept && regimenEvent !== 'undo' ? (
                  <>
                    <RadioButtonGroup
                      className={styles.radioButtonWrapper}
                      name="regimenType"
                      onChange={(uuid) => setSelectedRegimenType(uuid)}>
                      <RadioButton key={'standardUuid'} labelText={'Use standard regimen'} value={'standardUuid'} />
                      <RadioButton
                        key={'nonStandardUuid'}
                        labelText={'Use non standard regimen'}
                        value={'nonStandardUuid'}
                        disabled={category !== 'ARV'}
                      />
                    </RadioButtonGroup>
                    {errors.selectedRegimenType && <div className={styles.errorText}>{errors.selectedRegimenType}</div>}
                    {selectedRegimenType === 'standardUuid' ? (
                      <StandardRegimen
                        category={category}
                        setStandardRegimen={setStandardRegimen}
                        setStandardRegimenLine={setStandardRegimenLine}
                        selectedRegimenType={selectedRegimenType}
                        visitDate={visitDate}
                        errors={errors}
                      />
                    ) : (
                      <NonStandardRegimen
                        category={category}
                        setNonStandardRegimens={setNonStandardRegimens}
                        setStandardRegimenLine={setStandardRegimenLine}
                        selectedRegimenType={selectedRegimenType}
                        visitDate={visitDate}
                        errors={errors}
                      />
                    )}
                  </>
                ) : null}
                {(regimenEvent === Regimen.stopRegimenConcept ||
                  (regimenEvent === Regimen.changeRegimenConcept && selectedRegimenType)) && (
                  <RegimenReason category={category} setRegimenReason={setRegimenReason} errors={errors} />
                )}
              </>
            ) : null}
          </section>
        </Stack>
      </div>
      <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
        <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
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
