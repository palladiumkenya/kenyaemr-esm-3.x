import React, { useEffect, useState, useMemo, useCallback } from 'react';
import dayjs from 'dayjs';
import { first } from 'rxjs/operators';
import {
  Button,
  ButtonSet,
  DatePicker,
  DatePickerInput,
  Form,
  Layer,
  SelectItem,
  Stack,
  TimePicker,
  TimePickerSelect,
  RadioButtonGroup,
  RadioButton,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import {
  useLocations,
  useSession,
  useLayoutType,
  saveVisit,
  toOmrsIsoString,
  toDateObjectStrict,
  showNotification,
  showToast,
  useConfig,
  ConfigObject,
} from '@openmrs/esm-framework';
import styles from './standard-regimen.scss';
import { amPm, convertTime12to24 } from '@openmrs/esm-patient-common-lib';
import { closeOverlay } from '../hooks/useOverlay';
import StandardRegimen from './standard-regimen.component';
import RegimenReason from './regimen-reason.component';

interface RegimenFormProps {
  patientUuid: string;
  //closePanel?: () => void;
  category: string;
}
export interface NewVisitPayload {
  uuid?: string;
  location: string;
  patient?: string;
  startDatetime: Date;
  visitType: string;
  stopDatetime?: Date;
  attributes?: Array<{
    attributeType: string;
    value: string;
  }>;
}

const RegimenForm: React.FC<RegimenFormProps> = ({ patientUuid, category }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const locations = useLocations();
  const sessionUser = useSession();

  const config = useConfig() as ConfigObject;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeFormat, setTimeFormat] = useState<amPm>(new Date().getHours() >= 12 ? 'PM' : 'AM');
  const [visitDate, setVisitDate] = useState(new Date());
  const [visitTime, setVisitTime] = useState(dayjs(new Date()).format('hh:mm'));
  const state = useMemo(() => ({ patientUuid }), [patientUuid]);
  const [regimenEvent, setRegimenEvent] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
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

  const regimenEvents = [
    {
      display: 'Change regimen',
      uuid: 'uuid',
    },
    {
      display: 'Stop regimen',
      uuid: 'uuid',
    },
    {
      display: 'Start regimen',
      uuid: 'uuid',
    },
    {
      display: 'Restart regimen',
      uuid: 'uuid',
    },
    {
      display: 'Stop regimen',
      uuid: 'uuid',
    },
  ];

  useEffect(() => {}, [locations, sessionUser]);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();

      setIsSubmitting(true);

      const [hours, minutes] = convertTime12to24(visitTime, timeFormat);

      const payload: NewVisitPayload = {
        patient: patientUuid,
        startDatetime: toDateObjectStrict(
          toOmrsIsoString(
            new Date(dayjs(visitDate).year(), dayjs(visitDate).month(), dayjs(visitDate).date(), hours, minutes),
          ),
        ),
        location: selectedLocation,
        attributes: [],
        visitType: '',
      };

      const abortController = new AbortController();

      saveVisit(payload, abortController)
        .pipe(first())
        .subscribe(
          (response) => {},
          (error) => {
            showNotification({
              title: t('startVisitError', 'Error starting visit'),
              kind: 'error',
              critical: true,
              description: error?.message,
            });
          },
        );
    },
    [patientUuid, selectedLocation, t, timeFormat, visitDate, visitTime],
  );

  const handleOnChange = () => {
    // setIgnoreChanges((prevState) => !prevState);
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
              <RadioButton key={'start-regimen'} labelText={t('startRegimen', 'Start')} value={'uuid'} />
              <RadioButton key={'restart-regimen'} labelText={t('restartRegimen', 'Restart')} value={''} />
              <RadioButton key={'change-regimen'} labelText={t('changeRegimen', 'Change')} value={'uuid'} />
              <RadioButton key={'stop-regimen'} labelText={t('stopRegimen', 'Stop')} value={'stop'} />
            </RadioButtonGroup>
            {regimenEvent ? (
              <>
                <div className={styles.sectionTitle}>{t('dateAndTimeOfVisit', 'Date and time')}</div>
                <div className={styles.dateTimeSection}>
                  <DatePicker
                    dateFormat="d/m/Y"
                    datePickerType="single"
                    id="visitDate"
                    style={{ paddingBottom: '1rem' }}
                    maxDate={new Date().toISOString()}
                    onChange={([date]) => setVisitDate(date)}
                    value={visitDate}>
                    <DatePickerInput
                      id="visitStartDateInput"
                      labelText={t('date', 'Date')}
                      placeholder="dd/mm/yyyy"
                      style={{ width: '100%' }}
                    />
                  </DatePicker>
                  <ResponsiveWrapper isTablet={isTablet}>
                    <TimePicker
                      id="visitStartTime"
                      labelText={t('time', 'Time')}
                      onChange={(event) => setVisitTime(event.target.value as amPm)}
                      pattern="^(1[0-2]|0?[1-9]):([0-5]?[0-9])$"
                      style={{ marginLeft: '0.125rem', flex: 'none' }}
                      value={visitTime}>
                      <TimePickerSelect
                        id="visitStartTimeSelect"
                        onChange={(event) => setTimeFormat(event.target.value as amPm)}
                        value={timeFormat}
                        labelText={t('time', 'Time')}
                        aria-label={t('time', 'Time')}>
                        <SelectItem value="AM" text="AM" />
                        <SelectItem value="PM" text="PM" />
                      </TimePickerSelect>
                    </TimePicker>
                  </ResponsiveWrapper>
                </div>
                {regimenEvent && regimenEvent !== 'stop' ? (
                  <>
                    <RadioButtonGroup
                      className={styles.radioButtonWrapper}
                      name="priority"
                      onChange={(uuid) => {
                        // setPriority(uuid);
                      }}>
                      {regimenType?.length > 0 &&
                        regimenType.map(({ uuid, display }) => (
                          <RadioButton key={uuid} labelText={display} value={uuid} />
                        ))}
                    </RadioButtonGroup>
                    <StandardRegimen category={'ARV'} />
                  </>
                ) : null}

                <RegimenReason category={'ARV'} />
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

function ResponsiveWrapper({ children, isTablet }) {
  return isTablet ? <Layer>{children}</Layer> : <div>{children}</div>;
}

export default RegimenForm;
