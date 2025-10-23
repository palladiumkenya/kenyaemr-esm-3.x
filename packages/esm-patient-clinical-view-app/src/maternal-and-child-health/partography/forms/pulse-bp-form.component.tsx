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

    if (!data.pulse || isNaN(pulseValue) || pulseValue < 30 || pulseValue > 200) {
      setError('pulse', {
        type: 'manual',
        message: 'Please enter a valid pulse rate (30-200 bpm)',
      });
      return;
    }

    if (!data.systolicBP || isNaN(systolicValue) || systolicValue < 60 || systolicValue > 250) {
      setError('systolicBP', {
        type: 'manual',
        message: 'Please enter a valid systolic BP (60-250 mmHg)',
      });
      return;
    }

    if (!data.diastolicBP || isNaN(diastolicValue) || diastolicValue < 40 || diastolicValue > 150) {
      setError('diastolicBP', {
        type: 'manual',
        message: 'Please enter a valid diastolic BP (40-150 mmHg)',
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
              render={({ field }) => (
                <NumberInput
                  id="pulse"
                  label={t('pulse', 'Pulse Rate')}
                  helperText="Normal: 60-100 bpm"
                  min={30}
                  max={200}
                  value={field.value}
                  onChange={(e, { value }) => field.onChange(value)}
                  invalid={!!errors.pulse}
                  invalidText={errors.pulse?.message}
                />
              )}
            />
          </Column>
          <Column lg={8} md={4} sm={4}>
            <Controller
              name="systolicBP"
              control={control}
              render={({ field }) => (
                <NumberInput
                  id="systolicBP"
                  label={t('systolicBP', 'BP Systolic')}
                  helperText="Normal: 90-149 mmHg"
                  min={60}
                  max={250}
                  value={field.value}
                  onChange={(e, { value }) => field.onChange(value)}
                  invalid={!!errors.systolicBP}
                  invalidText={errors.systolicBP?.message}
                />
              )}
            />
          </Column>
          <Column lg={8} md={4} sm={4}>
            <Controller
              name="diastolicBP"
              control={control}
              render={({ field }) => (
                <NumberInput
                  id="diastolicBP"
                  label={t('diastolicBP', 'BP Diastolic')}
                  helperText="Normal: 60-80 mmHg"
                  min={40}
                  max={150}
                  value={field.value}
                  onChange={(e, { value }) => field.onChange(value)}
                  invalid={!!errors.diastolicBP}
                  invalidText={errors.diastolicBP?.message}
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
