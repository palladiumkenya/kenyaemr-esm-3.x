import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { Button, Modal, Grid, Column, Select, SelectItem, NumberInput } from '@carbon/react';
import TimePickerDropdown from './time-picker-dropdown.component';
import styles from '../partography-data-form.scss';

type UrineTestFormData = {
  protein: string;
  acetone: string;
  volume: string;
  timeSampleCollected: string;
  timeResultsReturned: string;
};

type UrineTestFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    timeSlot: string;
    exactTime: string;
    protein: string;
    acetone: string;
    volume: number;
    timeSampleCollected: string;
    timeResultsReturned: string;
  }) => void;
  onDataSaved?: () => void;
  existingTimeEntries?: Array<{ hour: number; time: string }>;
  patient?: {
    uuid: string;
    name: string;
    gender: string;
    age: string;
  };
};

const UrineTestForm: React.FC<UrineTestFormProps> = ({
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
  } = useForm<UrineTestFormData>({
    defaultValues: {
      protein: '',
      acetone: '',
      volume: '',
      timeSampleCollected: '',
      timeResultsReturned: '',
    },
  });

  const onSubmitForm = async (data: UrineTestFormData) => {
    const volumeValue = parseFloat(data.volume);
    clearErrors();
    if (!data.protein) {
      setError('protein', {
        type: 'manual',
        message: t('proteinRequired', 'Please select protein level'),
      });
      return;
    }
    if (!data.acetone) {
      setError('acetone', {
        type: 'manual',
        message: t('acetoneRequired', 'Please select acetone level'),
      });
      return;
    }
    if (!data.volume || isNaN(volumeValue) || volumeValue < 0) {
      setError('volume', {
        type: 'manual',
        message: t('volumeValidation', 'Please enter a valid volume'),
      });
      return;
    }
    if (!data.timeSampleCollected) {
      setError('timeSampleCollected', {
        type: 'manual',
        message: t('timeSampleCollectedRequired', 'Please enter sample collection time'),
      });
      return;
    }
    if (!data.timeResultsReturned) {
      setError('timeResultsReturned', {
        type: 'manual',
        message: t('timeResultsReturnedRequired', 'Please enter results return time'),
      });
      return;
    }

    // Submit the form data (using timeSampleCollected as the main time reference)
    // Add the correct concept UUID for urine volume in the payload for backend compatibility
    onSubmit({
      timeSlot: data.timeSampleCollected,
      exactTime: data.timeSampleCollected,
      protein: data.protein,
      acetone: data.acetone,
      volume: volumeValue,
      timeSampleCollected: data.timeSampleCollected,
      timeResultsReturned: data.timeResultsReturned,
    });

    // Call the onDataSaved callback if provided
    if (onDataSaved) {
      onDataSaved();
    }

    // Reset the form
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // Protein and Acetone options based on the provided data
  const proteinOptions = [
    { value: '0', label: '0' },
    { value: '+', label: '+' },
    { value: '++', label: '++' },
    { value: '+++', label: '+++' },
  ];

  const acetoneOptions = [
    { value: '0', label: '0' },
    { value: '+', label: '+' },
    { value: '++', label: '++' },
    { value: '+++', label: '+++' },
  ];

  return (
    <Modal
      open={isOpen}
      onRequestClose={handleClose}
      modalHeading={t('addUrineTestData', 'Urine Test')}
      modalLabel={patient ? `${patient.name}, ${patient.gender}, ${patient.age}` : 'Patient Information'}
      primaryButtonText={t('save', 'Save')}
      secondaryButtonText={t('cancel', 'Cancel')}
      onRequestSubmit={handleSubmit(onSubmitForm)}
      className={styles.modal}>
      <form>
        <Grid>
          {/* First Row: Protein and Time Sample Collected */}
          <Column lg={8} md={4} sm={4}>
            <Controller
              name="protein"
              control={control}
              render={({ field }) => (
                <Select
                  id="protein"
                  labelText={t('protein', 'Protein')}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  invalid={!!errors.protein}
                  invalidText={errors.protein?.message}>
                  <SelectItem value="" text={t('selectProtein', 'Select protein level')} />
                  {proteinOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} text={option.label} />
                  ))}
                </Select>
              )}
            />
          </Column>

          <Column lg={8} md={4} sm={4}>
            <Controller
              name="timeSampleCollected"
              control={control}
              render={({ field }) => (
                <TimePickerDropdown
                  id="timeSampleCollected"
                  labelText={t('timeSampleCollected', 'Time Sample Collected')}
                  value={field.value}
                  onChange={field.onChange}
                  invalid={!!errors.timeSampleCollected}
                  invalidText={errors.timeSampleCollected?.message}
                  existingTimeEntries={existingTimeEntries}
                />
              )}
            />
          </Column>

          {/* Second Row: Acetone (spanning full width) */}
          <Column lg={16} md={8} sm={4}>
            <Controller
              name="acetone"
              control={control}
              render={({ field }) => (
                <Select
                  id="acetone"
                  labelText={t('acetone', 'Acetone')}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  invalid={!!errors.acetone}
                  invalidText={errors.acetone?.message}>
                  <SelectItem value="" text={t('selectAcetone', 'Pull from Lab module')} />
                  {acetoneOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} text={option.label} />
                  ))}
                </Select>
              )}
            />
          </Column>

          {/* Third Row: Volume and Time Results Returned */}
          <Column lg={8} md={4} sm={4}>
            <Controller
              name="volume"
              control={control}
              render={({ field }) => (
                <NumberInput
                  id="volume"
                  label={t('volume', 'Volume Produced ml')}
                  helperText={t('volumeHelper', 'Enter the Dilation')}
                  min={0}
                  step={1}
                  value={field.value}
                  onChange={(e, { value }) => field.onChange(value)}
                  invalid={!!errors.volume}
                  invalidText={errors.volume?.message}
                />
              )}
            />
          </Column>

          <Column lg={8} md={4} sm={4}>
            <Controller
              name="timeResultsReturned"
              control={control}
              render={({ field }) => (
                <TimePickerDropdown
                  id="timeResultsReturned"
                  labelText={t('timeResultsReturned', 'Time Results Returned')}
                  value={field.value}
                  onChange={field.onChange}
                  invalid={!!errors.timeResultsReturned}
                  invalidText={errors.timeResultsReturned?.message}
                  existingTimeEntries={existingTimeEntries}
                />
              )}
            />
          </Column>
        </Grid>
      </form>
    </Modal>
  );
};

export default UrineTestForm;
