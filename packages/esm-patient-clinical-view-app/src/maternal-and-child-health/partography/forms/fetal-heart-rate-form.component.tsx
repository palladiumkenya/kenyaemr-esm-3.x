import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { Modal, Grid, Column, NumberInput, Select, SelectItem, InlineNotification } from '@carbon/react';
import { saveFetalHeartRateData } from '../resources/fetal-heart-rate.resource';
import TimePickerDropdown from './time-picker-dropdown.component';
import styles from '../partography-data-form.scss';

type FetalHeartRateFormData = {
  hour: string;
  time: string;
  fetalHeartRate: string;
};

type FetalHeartRateFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { hour: number; time: string; fetalHeartRate: number }) => void;
  onDataSaved?: () => void;
  selectedHours?: number[];
  existingTimeEntries?: Array<{ hour: number; time: string }>;
  patient?: {
    uuid: string;
    name: string;
    gender: string;
    age: string;
  };
};

const FetalHeartRateForm: React.FC<FetalHeartRateFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onDataSaved,
  selectedHours = [],
  existingTimeEntries = [],
  patient,
}) => {
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FetalHeartRateFormData>({
    defaultValues: {
      hour: '',
      time: '',
      fetalHeartRate: '',
    },
  });
  const generateHourOptions = () => {
    const options = [];
    // Add 00 hour option first
    options.push({ value: '0', label: '0hr' });
    // Start from 0.5hr, then 1hr, 1.5hr, ... up to 24hr (in 0.5 increments)
    for (let i = 1; i <= 48; i++) {
      const value = (i * 0.5).toString();
      const label = i % 2 === 0 ? `${i / 2}hr` : `${i * 0.5}hr`;
      options.push({ value, label });
    }
    return options;
  };

  const latestHour = React.useMemo(() => {
    if (!existingTimeEntries || existingTimeEntries.length === 0) {
      return null;
    }
    // Find the max hour value from existingTimeEntries (hour is already a number)
    return Math.max(...existingTimeEntries.map((e) => e.hour));
  }, [existingTimeEntries]);

  // Generate hour options, disabling those before the latest entered hour (float comparison)
  const hourOptionsWithDisabled = React.useMemo(() => {
    return generateHourOptions().map((option) => {
      const hourValue = parseFloat(option.value);
      return {
        ...option,
        disabled: latestHour !== null && hourValue <= latestHour,
      };
    });
  }, [latestHour]);

  const handleFormSubmit = async (data: FetalHeartRateFormData) => {
    const hourValue = parseFloat(data.hour);
    const fetalHeartRateValue = parseInt(data.fetalHeartRate);

    clearErrors();
    setSaveError(null);
    setSaveSuccess(false);

    if (!data.hour || isNaN(hourValue) || hourValue < 0 || hourValue > 24) {
      setError('hour', { type: 'manual', message: t('hourRequired', 'Please select a valid hour') });
      return;
    }
    if (!data.time || data.time.trim() === '') {
      setError('time', { type: 'manual', message: t('timeRequired', 'Time is required') });
      return;
    }
    if (!data.fetalHeartRate || isNaN(fetalHeartRateValue)) {
      setError('fetalHeartRate', {
        type: 'manual',
        message: t('fetalHeartRateRequired', 'Fetal heart rate is required'),
      });
      return;
    }
    if (fetalHeartRateValue < 80) {
      setError('fetalHeartRate', {
        type: 'manual',
        message: t('fetalHeartRateTooLow', 'Fetal heart rate is too low. Minimum is 80 bpm'),
      });
      return;
    }

    if (fetalHeartRateValue > 200) {
      setError('fetalHeartRate', {
        type: 'manual',
        message: t('fetalHeartRateTooHigh', 'Fetal heart rate is too high. Maximum is 200 bpm'),
      });
      return;
    }

    if (patient?.uuid) {
      setIsSaving(true);
      try {
        const result = await saveFetalHeartRateData(
          patient.uuid,
          {
            hour: hourValue,
            time: data.time,
            fetalHeartRate: fetalHeartRateValue,
          },
          t,
        );

        if (result.success) {
          setSaveSuccess(true);
          if (onDataSaved) {
            onDataSaved();
          }
          onSubmit({
            hour: hourValue,
            time: data.time,
            fetalHeartRate: fetalHeartRateValue,
          });
          reset();
          setTimeout(() => {
            setSaveSuccess(false);
            onClose();
          }, 1500);
        } else {
          setSaveError(result.message || t('saveError', 'Failed to save data'));
        }
      } catch (error) {
        setSaveError(error?.message || t('saveError', 'Failed to save data'));
      } finally {
        setIsSaving(false);
      }
    } else {
      onSubmit({
        hour: hourValue,
        time: data.time,
        fetalHeartRate: fetalHeartRateValue,
      });
      reset();
    }
  };

  const handleClose = () => {
    reset();
    clearErrors();
    setSaveError(null);
    setSaveSuccess(false);
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onRequestClose={handleClose}
      modalHeading={t('fetalHeartRateData', 'Foetal Heart Rate Data')}
      modalLabel=""
      primaryButtonText={isSaving ? t('saving', 'Saving...') : t('save', 'Save')}
      primaryButtonDisabled={isSaving}
      secondaryButtonText={t('cancel', 'Cancel')}
      onRequestSubmit={handleSubmit(handleFormSubmit)}
      onSecondarySubmit={handleClose}
      className={styles.cervixModal}
      size="md">
      {saveSuccess && (
        <InlineNotification
          kind="success"
          title={t('saveSuccess', 'Data saved successfully')}
          subtitle={t('fetalHeartRateDataSaved', 'Fetal heart rate data has been saved')}
          hideCloseButton
        />
      )}

      {saveError && (
        <InlineNotification
          kind="error"
          title={t('saveError', 'Error saving data')}
          subtitle={saveError}
          onCloseButtonClick={() => setSaveError(null)}
        />
      )}

      <Grid className={styles.formGrid}>
        <Column lg={8} md={4} sm={2}>
          <div className={styles.formField}>
            <Controller
              name="hour"
              control={control}
              render={({ field, fieldState }) => (
                <Select
                  id="hour-select"
                  labelText={t('hour', 'Hour')}
                  invalid={!!fieldState.error}
                  invalidText={fieldState.error?.message}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}>
                  <SelectItem value="" text={t('admissionTime', 'Admission')} />
                  {hourOptionsWithDisabled.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      text={option.label}
                      disabled={option.disabled}
                    />
                  ))}
                </Select>
              )}
            />
          </div>
        </Column>

        <Column lg={8} md={4} sm={2}>
          <div className={styles.formField}>
            <Controller
              name="time"
              control={control}
              render={({ field, fieldState }) => (
                <div>
                  <label className={styles.fieldLabel}>{t('time', 'Time')}</label>
                  <TimePickerDropdown
                    id="time-picker"
                    labelText=""
                    value={field.value}
                    onChange={field.onChange}
                    existingTimeEntries={existingTimeEntries}
                    invalid={!!fieldState.error}
                    invalidText={fieldState.error?.message}
                  />
                </div>
              )}
            />
          </div>
        </Column>

        <Column lg={16} md={8} sm={4}>
          <div className={styles.formField}>
            <Controller
              name="fetalHeartRate"
              control={control}
              render={({ field, fieldState }) => (
                <NumberInput
                  id="fetal-heart-rate-input"
                  label={t('fetalHeartRate', 'Foetal Heart Rate')}
                  min={80}
                  max={200}
                  step={1}
                  value={field.value}
                  onChange={(e) => {
                    let val = (e.target as HTMLInputElement).value;
                    val = val.replace(/[^\d]/g, '');
                    field.onChange(val);
                  }}
                  invalid={!!fieldState.error}
                  invalidText={fieldState.error?.message}
                  size="lg"
                  allowEmpty
                />
              )}
            />
          </div>
        </Column>
      </Grid>
    </Modal>
  );
};

export default FetalHeartRateForm;
