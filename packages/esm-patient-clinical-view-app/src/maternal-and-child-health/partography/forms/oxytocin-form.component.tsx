import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { Button, Modal, Grid, Column, NumberInput, Dropdown } from '@carbon/react';
import TimePickerDropdown from './time-picker-dropdown.component';
import styles from '../partography-data-form.scss';

type OxytocinFormData = {
  time: string;
  oxytocinUsed: string;
  dropsPerMinute: string;
};

type OxytocinFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { oxytocinUsed: 'yes' | 'no'; dropsPerMinute: number; timeSlot: string }) => void;
  onDataSaved?: () => void;
  existingTimeEntries?: Array<{ hour: number; time: string }>;
  patient?: {
    uuid: string;
    name: string;
    gender: string;
    age: string;
  };
};

const OxytocinForm: React.FC<OxytocinFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onDataSaved,
  existingTimeEntries = [],
  patient,
}) => {
  const { t } = useTranslation();

  const { control, handleSubmit, reset, setError, clearErrors, watch } = useForm<OxytocinFormData>({
    defaultValues: {
      time: '',
      oxytocinUsed: '',
      dropsPerMinute: '',
    },
  });

  const watchOxytocinUsed = watch('oxytocinUsed');

  const oxytocinOptions = [
    { id: 'yes', text: t('yes', 'Yes') },
    { id: 'no', text: t('no', 'No') },
  ];

  const onSubmitForm = async (data: OxytocinFormData) => {
    if (!data.time || data.time === '') {
      setError('time', {
        type: 'manual',
        message: 'Time selection is required',
      });
      return;
    }
    if (!data.oxytocinUsed || data.oxytocinUsed === '') {
      setError('oxytocinUsed', {
        type: 'manual',
        message: 'Oxytocin usage selection is required',
      });
      return;
    }
    if (data.oxytocinUsed === 'yes' && (!data.dropsPerMinute || data.dropsPerMinute === '')) {
      setError('dropsPerMinute', {
        type: 'manual',
        message: 'Drops per minute is required when oxytocin is used',
      });
      return;
    }
    const dropsPerMinute = data.oxytocinUsed === 'yes' ? parseInt(data.dropsPerMinute) : 0;

    if (data.oxytocinUsed === 'yes' && isNaN(dropsPerMinute)) {
      setError('dropsPerMinute', {
        type: 'manual',
        message: 'Invalid drops per minute value',
      });
      return;
    }
    if (data.oxytocinUsed === 'yes' && (dropsPerMinute < 0 || dropsPerMinute > 60)) {
      setError('dropsPerMinute', {
        type: 'manual',
        message: 'Drops per minute must be between 0 and 60',
      });
      return;
    }
    clearErrors();
    const timeSlot = data.time;
    onSubmit({
      oxytocinUsed: data.oxytocinUsed as 'yes' | 'no',
      dropsPerMinute: dropsPerMinute,
      timeSlot: timeSlot,
    });

    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const patientLabel = patient ? `${patient.name}, ${patient.gender}, ${patient.age}` : 'Patient Information';

  return (
    <Modal
      open={isOpen}
      onRequestClose={handleClose}
      modalHeading="Oxytocin"
      modalLabel={patientLabel}
      primaryButtonText={t('save', 'Save')}
      secondaryButtonText={t('cancel', 'Cancel')}
      onRequestSubmit={handleSubmit(onSubmitForm)}
      onSecondarySubmit={handleClose}
      size="md">
      <div className={styles.modalContent}>
        <Grid>
          <Column sm={4} md={8} lg={16}>
            <Controller
              name="time"
              control={control}
              rules={{
                required: 'Time selection is required',
              }}
              render={({ field, fieldState }) => (
                <TimePickerDropdown
                  id="time-input"
                  labelText={t('chooseTime', 'Choose a time')}
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
              name="oxytocinUsed"
              control={control}
              rules={{
                required: 'Oxytocin usage selection is required',
              }}
              render={({ field, fieldState }) => (
                <Dropdown
                  id="oxytocin-usage-dropdown"
                  titleText={t('oxytocin', 'Oxytocin')}
                  label="Select if oxytocin is used"
                  items={oxytocinOptions}
                  itemToString={(item) => (item ? item.text : '')}
                  selectedItem={field.value ? oxytocinOptions.find((opt) => opt.id === field.value) : null}
                  onChange={({ selectedItem }) => field.onChange(selectedItem?.id || '')}
                  invalid={!!fieldState.error}
                  invalidText={fieldState.error?.message}
                />
              )}
            />
          </Column>
          {watchOxytocinUsed === 'yes' && (
            <Column sm={4} md={8} lg={16}>
              <Controller
                name="dropsPerMinute"
                control={control}
                rules={{
                  required: watchOxytocinUsed === 'yes' ? 'Drops per minute is required when oxytocin is used' : false,
                  validate: {
                    isNumber: (value) => !isNaN(parseInt(value)) || 'Must be a valid number',
                    minValue: (value) => {
                      const numValue = parseInt(value);
                      return numValue >= 0 || 'Cannot be less than 0';
                    },
                    maxValue: (value) => {
                      const numValue = parseInt(value);
                      return numValue <= 60 || 'Cannot exceed 60 drops per minute';
                    },
                  },
                }}
                render={({ field, fieldState }) => (
                  <NumberInput
                    id="drops-per-minute-input"
                    label={t('dropsPerMinute', 'Drops per minute')}
                    placeholder="Enter drops per minute"
                    value={field.value || ''}
                    onChange={(e, { value }) => field.onChange(String(value))}
                    min={0}
                    max={60}
                    step={1}
                    invalid={!!fieldState.error}
                    invalidText={fieldState.error?.message}
                  />
                )}
              />
            </Column>
          )}
        </Grid>
      </div>
    </Modal>
  );
};

export default OxytocinForm;
