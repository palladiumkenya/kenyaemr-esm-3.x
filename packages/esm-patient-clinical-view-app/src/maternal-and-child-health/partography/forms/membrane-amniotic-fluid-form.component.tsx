import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { Button, Modal, Grid, Column, Select, SelectItem, TimePicker } from '@carbon/react';
import TimePickerDropdown from './time-picker-dropdown.component';
import styles from '../partography-data-form.scss';
import { MEMBRANE_TIME_SLOT_OPTIONS } from '../types';
import {
  AMNIOTIC_MEMBRANE_INTACT_CONCEPT,
  AMNIOTIC_CLEAR_LIQUOR_CONCEPT,
  AMNIOTIC_MECONIUM_STAINED_CONCEPT,
  AMNIOTIC_ABSENT_CONCEPT,
  AMNIOTIC_BLOOD_STAINED_CONCEPT,
  MOULDING_NONE_CONCEPT,
  MOULDING_SLIGHT_CONCEPT,
  MOULDING_MODERATE_CONCEPT,
  MOULDING_SEVERE_CONCEPT,
} from '../../../config-schema';

type MembraneAmnioticFluidFormData = {
  timeSlot: string;
  exactTime: string;
  amnioticFluid: string;
  moulding: string;
};

type MembraneAmnioticFluidFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { timeSlot: string; exactTime: string; amnioticFluid: string; moulding: string }) => void;
  onDataSaved?: () => void;
  existingTimeEntries?: Array<{ timeSlot: string; exactTime: string }>;
  patient?: {
    uuid: string;
    name: string;
    gender: string;
    age: string;
  };
};

const MembraneAmnioticFluidForm: React.FC<MembraneAmnioticFluidFormProps> = ({
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
    formState: { errors },
  } = useForm<MembraneAmnioticFluidFormData>({
    defaultValues: {
      timeSlot: '',
      exactTime: '',
      amnioticFluid: '',
      moulding: '',
    },
  });

  const timeSlotOptions = MEMBRANE_TIME_SLOT_OPTIONS as unknown as { value: string; label: string }[];

  const getLatestUsedTimeSlot = () => {
    if (existingTimeEntries.length === 0) {
      return null;
    }

    const sortedTimeSlots = existingTimeEntries
      .map((entry) => entry.timeSlot)
      .sort((a, b) => {
        const getMinutes = (time: string) => {
          const [hours, minutes] = time.split(':').map(Number);

          const adjustedHours = hours <= 5 ? hours + 24 : hours;
          return adjustedHours * 60 + minutes;
        };
        return getMinutes(a) - getMinutes(b);
      });

    return sortedTimeSlots[sortedTimeSlots.length - 1];
  };

  const latestUsedTimeSlot = getLatestUsedTimeSlot();

  const isTimeSlotDisabled = (timeSlot: string) => {
    if (!latestUsedTimeSlot) {
      return false;
    }

    const getMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);

      const adjustedHours = hours <= 5 ? hours + 24 : hours;
      return adjustedHours * 60 + minutes;
    };

    return getMinutes(timeSlot) <= getMinutes(latestUsedTimeSlot);
  };

  const amnioticFluidOptions = [
    {
      value: 'Membrane intact',
      label: t('membraneIntact', 'Membrane intact'),
      concept: AMNIOTIC_MEMBRANE_INTACT_CONCEPT,
    },
    { value: 'Clear liquor', label: t('clearLiquor', 'Clear liquor'), concept: AMNIOTIC_CLEAR_LIQUOR_CONCEPT },
    {
      value: 'Meconium Stained',
      label: t('meconiumStained', 'Meconium Stained'),
      concept: AMNIOTIC_MECONIUM_STAINED_CONCEPT,
    },
    { value: 'Absent', label: t('absent', 'Absent'), concept: AMNIOTIC_ABSENT_CONCEPT },
    {
      value: 'Blood Stained',
      label: t('bloodStained', 'Blood Stained'),
      concept: AMNIOTIC_BLOOD_STAINED_CONCEPT,
    },
  ];

  const mouldingOptions = [
    { value: '0', label: '0', concept: MOULDING_NONE_CONCEPT },
    { value: '+', label: '+', concept: MOULDING_SLIGHT_CONCEPT },
    { value: '++', label: '++', concept: MOULDING_MODERATE_CONCEPT },
    { value: '+++', label: '+++', concept: MOULDING_SEVERE_CONCEPT },
  ];

  const handleFormSubmit = (data: MembraneAmnioticFluidFormData) => {
    clearErrors();

    let hasErrors = false;

    if (!data.timeSlot || data.timeSlot.trim() === '') {
      setError('timeSlot', { type: 'manual', message: t('timeSlotRequired', 'Please select a time slot') });
      hasErrors = true;
    }

    if (!data.exactTime || data.exactTime.trim() === '') {
      setError('exactTime', { type: 'manual', message: t('exactTimeRequired', 'Exact time is required') });
      hasErrors = true;
    }

    if (!data.amnioticFluid || data.amnioticFluid.trim() === '') {
      setError('amnioticFluid', {
        type: 'manual',
        message: t('amnioticFluidRequired', 'Please select amniotic fluid status'),
      });
      hasErrors = true;
    }

    if (!data.moulding || data.moulding.trim() === '') {
      setError('moulding', {
        type: 'manual',
        message: t('mouldingRequired', 'Please select moulding status'),
      });
      hasErrors = true;
    }

    if (hasErrors) {
      alert(t('formValidationError', 'Please fill in all required fields before submitting.'));
      return;
    }

    if (isTimeSlotDisabled(data.timeSlot)) {
      setError('timeSlot', {
        type: 'manual',
        message: t('timeSlotDisabled', 'Selected time slot is not available. Please select a later time.'),
      });
      alert(t('timeSlotValidationError', 'Please select a valid time slot that comes after the previous entry.'));
      return;
    }

    onSubmit({
      timeSlot: data.timeSlot,
      exactTime: data.exactTime,
      amnioticFluid: data.amnioticFluid,
      moulding: data.moulding,
    });

    reset();
  };

  const handleClose = () => {
    reset();
    clearErrors();
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onRequestClose={handleClose}
      modalHeading={t('membraneAmnioticFluidData', 'Membrane Amniotic Fluid & Moulding')}
      modalLabel={patient ? `${patient.name}, ${patient.gender}, ${patient.age}` : ''}
      primaryButtonText={t('save', 'Save')}
      secondaryButtonText={t('cancel', 'Cancel')}
      onRequestSubmit={handleSubmit(handleFormSubmit)}
      onSecondarySubmit={handleClose}
      className={styles.cervixModal}
      size="md">
      <Grid className={styles.formGrid}>
        <Column lg={8} md={4} sm={2}>
          <div className={styles.formField}>
            <Controller
              name="timeSlot"
              control={control}
              rules={{ required: t('timeSlotRequired', 'Please select a time slot') }}
              render={({ field, fieldState }) => (
                <Select
                  id="time-slot-select"
                  labelText={t('timeSlot', 'Time Slot')}
                  invalid={!!fieldState.error}
                  invalidText={fieldState.error?.message}
                  helperText={
                    latestUsedTimeSlot
                      ? t('timeSlotInfo', `Select a time after ${latestUsedTimeSlot}`)
                      : t('timeSlotInfoInitial', 'Select a time slot')
                  }
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}>
                  <SelectItem value="" text={t('chooseAnOption', 'Choose an option')} />
                  {timeSlotOptions.map((option) => {
                    const isDisabled = isTimeSlotDisabled(option.value);
                    return (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        text={option.label}
                        disabled={isDisabled}
                        className={isDisabled ? styles.disabledOption : undefined}
                      />
                    );
                  })}
                </Select>
              )}
            />
          </div>
        </Column>

        <Column lg={8} md={4} sm={2}>
          <div className={styles.formField}>
            <Controller
              name="exactTime"
              control={control}
              rules={{ required: t('exactTimeRequired', 'Exact time is required') }}
              render={({ field, fieldState }) => (
                <div>
                  <label className={styles.fieldLabel}>{t('exactTime', 'Exact Time')}</label>
                  <TimePickerDropdown
                    id="exact-time-picker"
                    labelText=""
                    value={field.value}
                    onChange={field.onChange}
                    existingTimeEntries={[]}
                    invalid={!!fieldState.error}
                    invalidText={fieldState.error?.message}
                  />
                </div>
              )}
            />
          </div>
        </Column>

        <Column lg={8} md={4} sm={2}>
          <div className={styles.formField}>
            <Controller
              name="amnioticFluid"
              control={control}
              rules={{ required: t('amnioticFluidRequired', 'Please select amniotic fluid status') }}
              render={({ field, fieldState }) => (
                <Select
                  id="amniotic-fluid-select"
                  labelText={t('amnioticFluid', 'Amniotic Fluid')}
                  invalid={!!fieldState.error}
                  invalidText={fieldState.error?.message}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}>
                  <SelectItem value="" text={t('chooseAnOption', 'Choose an option')} />
                  {amnioticFluidOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} text={option.label} />
                  ))}
                </Select>
              )}
            />
          </div>
        </Column>

        <Column lg={8} md={4} sm={2}>
          <div className={styles.formField}>
            <Controller
              name="moulding"
              control={control}
              rules={{ required: t('mouldingRequired', 'Please select moulding status') }}
              render={({ field, fieldState }) => (
                <Select
                  id="moulding-select"
                  labelText={t('moulding', 'Moulding')}
                  invalid={!!fieldState.error}
                  invalidText={fieldState.error?.message}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}>
                  <SelectItem value="" text={t('chooseAnOption', 'Choose an option')} />
                  {mouldingOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} text={option.label} />
                  ))}
                </Select>
              )}
            />
          </div>
        </Column>
      </Grid>
    </Modal>
  );
};

export default MembraneAmnioticFluidForm;
