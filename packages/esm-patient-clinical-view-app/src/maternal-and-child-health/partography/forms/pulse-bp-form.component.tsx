import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { Modal, Grid, Column, NumberInput } from '@carbon/react';
import styles from '../partography-data-form.scss';

type PulseBPFormData = {
  pulse: string;
  systolicBP: string;
  diastolicBP: string;
};

type PulseBPFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { pulse: number; systolicBP: number; diastolicBP: number }) => void;
  onDataSaved?: () => void;
  patient?: {
    uuid: string;
    name: string;
    gender: string;
    age: string;
  };
};

const PulseBPForm: React.FC<PulseBPFormProps> = ({ isOpen, onClose, onSubmit, onDataSaved, patient }) => {
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<PulseBPFormData>({
    defaultValues: {
      pulse: '',
      systolicBP: '',
      diastolicBP: '',
    },
  });

  const onSubmitForm = async (data: PulseBPFormData) => {
    const pulseValue = parseInt(data.pulse);
    const systolicValue = parseInt(data.systolicBP);
    const diastolicValue = parseInt(data.diastolicBP);

    clearErrors();

    if (!data.pulse || isNaN(pulseValue) || pulseValue < 0 || pulseValue > 230) {
      setError('pulse', {
        type: 'manual',
        message: 'Please enter a valid pulse rate (0-230 bpm)',
      });
      return;
    }

    if (!data.systolicBP || isNaN(systolicValue) || systolicValue < 0 || systolicValue > 250) {
      setError('systolicBP', {
        type: 'manual',
        message: 'Please enter a valid systolic BP (0-250 mmHg)',
      });
      return;
    }

    if (!data.diastolicBP || isNaN(diastolicValue) || diastolicValue < 0 || diastolicValue > 150) {
      setError('diastolicBP', {
        type: 'manual',
        message: 'Please enter a valid diastolic BP (0-150 mmHg)',
      });
      return;
    }

    if (systolicValue <= diastolicValue) {
      setError('systolicBP', {
        type: 'manual',
        message: 'Systolic BP must be higher than diastolic BP',
      });
      return;
    }

    onSubmit({
      pulse: pulseValue,
      systolicBP: systolicValue,
      diastolicBP: diastolicValue,
    });

    reset();
    onClose();
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
      modalHeading={t('addPulseBpData', 'Pulse & BP')}
      modalLabel={patient ? `${patient.name}, ${patient.gender}, ${patient.age}` : 'Patient Information'}
      primaryButtonText={t('save', 'Save')}
      secondaryButtonText={t('cancel', 'Cancel')}
      onRequestSubmit={handleSubmit(onSubmitForm)}
      className={styles.modal}>
      <form>
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <Controller
              name="pulse"
              control={control}
              render={({ field, fieldState }) => (
                <NumberInput
                  id="pulse"
                  label={t('pulse', 'Pulse Rate')}
                  helperText="Normal: 0-230 bpm"
                  min={0}
                  max={230}
                  step={1}
                  value={field.value || ''}
                  onChange={(e, { value }) => field.onChange(String(value))}
                  invalid={!!fieldState.error}
                  invalidText={fieldState.error?.message}
                  allowEmpty
                />
              )}
            />
          </Column>
          <Column lg={8} md={4} sm={4}>
            <Controller
              name="systolicBP"
              control={control}
              render={({ field, fieldState }) => (
                <NumberInput
                  id="systolicBP"
                  label={t('systolicBP', 'BP Systolic')}
                  helperText="Normal: 0-250 mmHg"
                  min={0}
                  max={250}
                  step={1}
                  value={field.value || ''}
                  onChange={(e, { value }) => field.onChange(String(value))}
                  invalid={!!fieldState.error}
                  invalidText={fieldState.error?.message}
                  allowEmpty
                />
              )}
            />
          </Column>
          <Column lg={8} md={4} sm={4}>
            <Controller
              name="diastolicBP"
              control={control}
              render={({ field, fieldState }) => (
                <NumberInput
                  id="diastolicBP"
                  label={t('diastolicBP', 'BP Diastolic')}
                  helperText="Normal: 0-150 mmHg"
                  min={0}
                  max={150}
                  step={1}
                  value={field.value || ''}
                  onChange={(e, { value }) => field.onChange(String(value))}
                  invalid={!!fieldState.error}
                  invalidText={fieldState.error?.message}
                  allowEmpty
                />
              )}
            />
          </Column>
        </Grid>
      </form>
    </Modal>
  );
};

export default PulseBPForm;
