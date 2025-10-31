import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { Button, Modal, Grid, Column, NumberInput, Select, SelectItem } from '@carbon/react';
import TimePickerDropdown from './time-picker-dropdown.component';
import styles from '../partography-data-form.scss';

type CervixFormData = {
  hour: string;
  time: string;
  cervicalDilation: string;
  descent: string;
};

type CervixFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { hour: number; time: string; cervicalDilation: number; descentOfHead: number }) => void;
  onDataSaved?: () => void;
  selectedHours?: number[];
  existingTimeEntries?: Array<{ hour: number; time: string }>;
  existingCervixData?: Array<{ cervicalDilation: number; descentOfHead: number }>;
  patient?: {
    uuid: string;
    name: string;
    gender: string;
    age: string;
  };
};

const CervixForm: React.FC<CervixFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onDataSaved,
  selectedHours = [],
  existingTimeEntries = [],
  existingCervixData = [],
  patient,
}) => {
  const { t } = useTranslation();

  const { control, handleSubmit, reset, setError, clearErrors } = useForm<CervixFormData>({
    defaultValues: {
      hour: '',
      time: '',
      cervicalDilation: '',
      descent: '',
    },
  });

  const validationLimits = useMemo(() => {
    if (!existingCervixData || existingCervixData.length === 0) {
      return {
        cervicalDilationMin: 0,
        descentOfHeadMax: 5,
      };
    }

    const maxCervicalDilation = Math.max(...existingCervixData.map((data) => data.cervicalDilation));
    const minDescentOfHead = Math.min(...existingCervixData.map((data) => data.descentOfHead));

    return {
      cervicalDilationMin: maxCervicalDilation,
      descentOfHeadMax: minDescentOfHead,
    };
  }, [existingCervixData]);

  const usedHours = useMemo(() => {
    if (!selectedHours || selectedHours.length === 0) {
      return [];
    }
    return selectedHours;
  }, [selectedHours]);

  const hourOptions = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const hourValue = String(i).padStart(2, '0');
      const isDisabled = usedHours.includes(i);
      const displayText = isDisabled ? `${hourValue} (used)` : hourValue;
      return {
        value: hourValue,
        text: displayText,
        disabled: isDisabled,
      };
    });
  }, [usedHours]);

  const onSubmitForm = async (data: CervixFormData) => {
    if (!data.hour || data.hour === '') {
      setError('hour', {
        type: 'manual',
        message: 'Hour selection is required',
      });
      return;
    }

    if (!data.time || data.time === '') {
      setError('time', {
        type: 'manual',
        message: 'Time selection is required',
      });
      console.warn('[CervixForm] Attempted to submit with empty time value:', data);
      return;
    }

    if (!data.cervicalDilation || data.cervicalDilation === '') {
      setError('cervicalDilation', {
        type: 'manual',
        message: 'Cervical dilation is required',
      });
      return;
    }

    if (!data.descent || data.descent === '') {
      setError('descent', {
        type: 'manual',
        message: 'Descent of head is required',
      });
      return;
    }

    const hourValue = parseInt(data.hour);
    const cervicalDilation = parseFloat(data.cervicalDilation);
    const descentOfHead = parseInt(data.descent);

    if (isNaN(hourValue)) {
      setError('hour', {
        type: 'manual',
        message: 'Invalid hour value',
      });
      return;
    }

    if (isNaN(cervicalDilation)) {
      setError('cervicalDilation', {
        type: 'manual',
        message: 'Invalid cervical dilation value',
      });
      return;
    }

    if (isNaN(descentOfHead)) {
      setError('descent', {
        type: 'manual',
        message: 'Invalid descent of head value',
      });
      return;
    }

    if (cervicalDilation < validationLimits.cervicalDilationMin) {
      setError('cervicalDilation', {
        type: 'manual',
        message: `Cervical dilation cannot be less than previous measurement (${validationLimits.cervicalDilationMin}cm)`,
      });
      return;
    }

    if (cervicalDilation > 10) {
      setError('cervicalDilation', {
        type: 'manual',
        message: 'Cervical dilation cannot exceed 10cm',
      });
      return;
    }

    if (descentOfHead < 1) {
      setError('descent', {
        type: 'manual',
        message: 'Descent of head cannot be less than 1 (most descended)',
      });
      return;
    }
    if (descentOfHead > 5) {
      setError('descent', {
        type: 'manual',
        message: 'Descent of head cannot exceed 5',
      });
      return;
    }

    clearErrors();
    if (!data.time || data.time.trim() === '') {
      alert('Time cannot be empty. Please select a valid time.');
      return;
    }
    onSubmit({
      hour: hourValue,
      time: data.time,
      cervicalDilation: cervicalDilation,
      descentOfHead: descentOfHead,
    });

    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const patientLabel = useMemo(
    () => (patient ? `${patient.name}, ${patient.gender}, ${patient.age}` : 'Patient Information'),
    [patient],
  );

  return (
    <Modal
      open={isOpen}
      onRequestClose={handleClose}
      modalHeading="Cervical Dilation & Descent of Head"
      modalLabel={patientLabel}
      primaryButtonText={t('save', 'Save')}
      secondaryButtonText={t('cancel', 'Cancel')}
      onRequestSubmit={handleSubmit(onSubmitForm)}
      onSecondarySubmit={handleClose}
      size="md">
      <div className={styles.modalContent}>
        <div className={styles.requiredFieldsNote}>
          <p>* All fields are required</p>
        </div>
        <Grid>
          <Column sm={4} md={4} lg={8}>
            <Controller
              name="hour"
              control={control}
              rules={{
                required: 'Hour selection is required',
              }}
              render={({ field, fieldState }) => (
                <Select
                  id="hour-select"
                  labelText="Hour *"
                  value={field.value}
                  onChange={(e) => field.onChange((e.target as HTMLSelectElement).value)}
                  invalid={!!fieldState.error}
                  invalidText={fieldState.error?.message}>
                  <SelectItem value="" text="Select hour" />
                  {hourOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} text={option.text} disabled={option.disabled} />
                  ))}
                </Select>
              )}
            />
          </Column>
          <Column sm={4} md={4} lg={8}>
            <Controller
              name="time"
              control={control}
              rules={{
                required: 'Time selection is required',
              }}
              render={({ field, fieldState }) => (
                <TimePickerDropdown
                  id="time-input"
                  labelText="Time *"
                  value={field.value}
                  onChange={(value) => field.onChange(value)}
                  invalid={!!fieldState.error}
                  invalidText={fieldState.error?.message}
                  existingTimeEntries={existingTimeEntries}
                />
              )}
            />
          </Column>

          <Column sm={4} md={8} lg={16}>
            <Controller
              name="cervicalDilation"
              control={control}
              rules={{
                required: 'Cervical dilation is required',
                validate: {
                  isNumber: (value) => !isNaN(parseFloat(value)) || 'Must be a valid number',
                  minValue: (value) => {
                    const numValue = parseFloat(value);
                    return (
                      numValue >= validationLimits.cervicalDilationMin ||
                      `Cannot be less than previous measurement (${validationLimits.cervicalDilationMin}cm)`
                    );
                  },
                  maxValue: (value) => {
                    const numValue = parseFloat(value);
                    return numValue <= 10 || 'Cannot exceed 10cm';
                  },
                },
              }}
              render={({ field, fieldState }) => (
                <>
                  <NumberInput
                    id="cervical-dilation-input"
                    label="Cervical Dilation (cm) *"
                    placeholder="Enter dilation (min: 4cm, max: 10cm)"
                    value={field.value || ''}
                    onChange={(e, { value }) => {
                      // Only allow whole numbers
                      const intValue = String(value).replace(/[^\d]/g, '');
                      field.onChange(intValue);
                    }}
                    min={4}
                    max={10}
                    step={1}
                    invalid={!!fieldState.error}
                    invalidText={fieldState.error?.message}
                  />
                  {existingCervixData.length > 0 && (
                    <div className={styles.validationHint}>
                      Previous highest: {validationLimits.cervicalDilationMin}cm (cannot go below this value)
                    </div>
                  )}
                </>
              )}
            />
          </Column>

          <Column sm={4} md={8} lg={16}>
            <Controller
              name="descent"
              control={control}
              rules={{
                required: 'Descent of head is required',
                validate: {
                  isNumber: (value) => !isNaN(parseInt(value)) || 'Must be a valid number',
                  minValue: (value) => {
                    const numValue = parseInt(value);
                    return numValue >= 1 || 'Descent of head cannot be less than 1 (most descended)';
                  },
                  maxValue: (value) => {
                    const numValue = parseInt(value);
                    return numValue <= 5 || 'Descent of head cannot exceed 5';
                  },
                },
              }}
              render={({ field, fieldState }) => (
                <>
                  <NumberInput
                    id="descent-input"
                    label="Descent of Head *"
                    placeholder={
                      existingCervixData.length === 0
                        ? `Default: 5 (high position), can decrement to lower values`
                        : `Enter descent (1=most descended, 5=high position)`
                    }
                    value={field.value || ''}
                    onChange={(e, { value }) => field.onChange(String(value))}
                    min={1}
                    max={5}
                    step={1}
                    invalid={!!fieldState.error}
                    invalidText={fieldState.error?.message}
                  />
                </>
              )}
            />
          </Column>
        </Grid>
      </div>
    </Modal>
  );
};

export default CervixForm;
