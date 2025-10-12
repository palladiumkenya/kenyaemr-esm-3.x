import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { Modal, Grid, Column, NumberInput } from '@carbon/react';
import TimePickerDropdown from './time-picker-dropdown.component';
import styles from '../partography-data-form.scss';

type TemperatureFormData = {
  time: string;
  temperature: string;
};

type TemperatureFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { timeSlot: string; exactTime: string; temperature: number }) => void;
  onDataSaved?: () => void;
  existingTimeEntries?: Array<{ hour: number; time: string }>;
  patient?: {
    uuid: string;
    name: string;
    gender: string;
    age: string;
  };
  initialTime?: string;
};

const TemperatureForm: React.FC<TemperatureFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onDataSaved,
  existingTimeEntries = [],
  patient,
}) => {
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm<TemperatureFormData>({
    defaultValues: {
      temperature: '',
    },
  });

  const watchedTime = watch('time');

  const onSubmitForm = async (data: TemperatureFormData) => {
    const temperatureValue = parseFloat(data.temperature);

    clearErrors();

    if (!data.time) {
      setError('time', {
        type: 'manual',
        message: t('timeRequired', 'Please select a time'),
      });
      return;
    }

    if (!data.temperature || isNaN(temperatureValue) || temperatureValue < 30 || temperatureValue > 45) {
      setError('temperature', {
        type: 'manual',
        message: t('temperatureValidation', 'Please enter a valid temperature (30-45°C)'),
      });
      return;
    }

    const isDuplicateTime = existingTimeEntries.some((entry) => entry.time === data.time);

    if (isDuplicateTime) {
      setError('time', {
        type: 'manual',
        message: t('duplicateTimeEntry', 'This time already exists'),
      });
      return;
    }

    onSubmit({
      timeSlot: data.time,
      exactTime: data.time,
      temperature: temperatureValue,
    });

    if (onDataSaved) {
      onDataSaved();
    }

    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    clearErrors();
    onClose();
  };

  const getTemperatureAdvice = (temp: string): { status: string; color: string; advice: string } => {
    const temperature = parseFloat(temp);
    if (isNaN(temperature)) {
      return { status: '', color: '', advice: '' };
    }

    if (temperature < 36.1) {
      return {
        status: 'Low',
        color: '#0043ce',
        advice: 'Temperature below normal range. Monitor closely.',
      };
    } else if (temperature >= 36.1 && temperature <= 37.2) {
      return {
        status: 'Normal',
        color: '#198038',
        advice: 'Temperature within normal range.',
      };
    } else if (temperature > 37.2) {
      return {
        status: 'High (Fever)',
        color: '#da1e28',
        advice: 'Elevated temperature. Consider fever management.',
      };
    }
    return { status: '', color: '', advice: '' };
  };

  const temperatureAdvice = getTemperatureAdvice(watch('temperature') || '');

  return (
    <Modal
      open={isOpen}
      onRequestClose={handleClose}
      modalHeading={t('addTemperatureData', 'Temperature')}
      modalLabel={patient ? `${patient.name}, ${patient.gender}, ${patient.age}` : 'Patient Information'}
      primaryButtonText={t('save', 'Save')}
      secondaryButtonText={t('cancel', 'Cancel')}
      onRequestSubmit={handleSubmit(onSubmitForm)}
      className={styles.modal}>
      <form>
        <Grid>
          <Column lg={8} md={4} sm={4}>
            <Controller
              name="time"
              control={control}
              render={({ field }) => (
                <TimePickerDropdown
                  id="time"
                  labelText={t('time', 'Time')}
                  value={field.value}
                  onChange={field.onChange}
                  invalid={!!errors.time}
                  invalidText={errors.time?.message}
                  existingTimeEntries={existingTimeEntries}
                />
              )}
            />
          </Column>
          <Column lg={16} md={8} sm={4}>
            <Controller
              name="temperature"
              control={control}
              render={({ field }) => (
                <NumberInput
                  id="temperature"
                  label={t('temperature', 'Temperature')}
                  helperText="Normal: 36.1-37.2°C"
                  min={30}
                  max={45}
                  step={0.1}
                  value={field.value}
                  onChange={(e, { value }) => field.onChange(value)}
                  invalid={!!errors.temperature}
                  invalidText={errors.temperature?.message}
                />
              )}
            />
          </Column>

          {temperatureAdvice.status && (
            <Column lg={16} md={8} sm={4}>
              <div className={styles.temperatureStatus}>
                <div
                  className={styles.statusIndicator}
                  style={{
                    backgroundColor: temperatureAdvice.color,
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    marginTop: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}>
                  <strong>{temperatureAdvice.status}</strong>
                  <br />
                  <span style={{ fontSize: '12px', opacity: '0.9' }}>{temperatureAdvice.advice}</span>
                </div>
              </div>
            </Column>
          )}
        </Grid>
      </form>
    </Modal>
  );
};

export default TemperatureForm;
