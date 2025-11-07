import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { contractionLevelOptions as baseContractionLevelOptions } from '../types';
import { Modal, Select, SelectItem } from '@carbon/react';
import styles from '../partography.scss';

type CervicalContractionsFormData = {
  contractionLevel: string;
  contractionCount: string;
};

type CervicalContractionsFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { contractionLevel: string; contractionCount: string; timeSlot: string }) => void;
  onDataSaved?: () => void;
  patient?: {
    uuid: string;
    name: string;
    gender: string;
    age: string;
  };
};

const CervicalContractionsForm: React.FC<CervicalContractionsFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onDataSaved,
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
  } = useForm<CervicalContractionsFormData>({
    defaultValues: {
      contractionLevel: '',
      contractionCount: '',
    },
  });

  const contractionLevelOptions = baseContractionLevelOptions.map((opt) => ({
    ...opt,
    label: t(opt.labelKey, opt.defaultLabel),
    title: opt.titleKey ? t(opt.titleKey, opt.defaultTitle) : opt.defaultTitle || opt.title,
  }));

  const [isSaving, setIsSaving] = useState(false);

  const handleFormSubmit = async (data: CervicalContractionsFormData) => {
    clearErrors();
    let hasErrors = false;

    // Validate contraction level
    if (!data.contractionLevel || data.contractionLevel.trim() === '') {
      setError('contractionLevel', {
        type: 'manual',
        message: t('contractionLevelRequired', 'Please select contraction level'),
      });
      hasErrors = true;
    }

    // Validate contraction count
    if (!data.contractionCount || data.contractionCount.trim() === '') {
      setError('contractionCount', {
        type: 'manual',
        message: t('contractionCountRequired', 'Please select number of contractions'),
      });
      hasErrors = true;
    } else {
      const countValue = parseInt(data.contractionCount);
      if (isNaN(countValue) || countValue < 1 || countValue > 5) {
        setError('contractionCount', {
          type: 'manual',
          message: t('contractionCountRange', 'Contraction count must be between 1 and 5'),
        });
        hasErrors = true;
      }
    }

    // Clinical validation warnings
    if (!hasErrors) {
      const countValue = parseInt(data.contractionCount);

      // Warning for high contraction frequency
      if (countValue >= 5) {
        const proceedWithHighFrequency = window.confirm(
          t(
            'highContractionWarning',
            'High contraction frequency (5 per 10 minutes) detected. This may indicate hyperstimulation. Do you want to proceed?',
          ),
        );
        if (!proceedWithHighFrequency) {
          return;
        }
      }

      // Warning for strong contractions with high frequency
      if (data.contractionLevel === 'strong' && countValue >= 4) {
        const proceedWithIntensePattern = window.confirm(
          t(
            'intenseContractionWarning',
            'Strong contractions with high frequency detected. This requires close monitoring. Do you want to proceed?',
          ),
        );
        if (!proceedWithIntensePattern) {
          return;
        }
      }
    }

    if (hasErrors) {
      alert(t('formValidationError', 'Please correct the validation errors before submitting.'));
      return;
    }
    const currentTime = new Date().toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
    setIsSaving(true);
    try {
      await onSubmit({
        contractionLevel: data.contractionLevel,
        contractionCount: data.contractionCount,
        timeSlot: currentTime,
      });
      reset();
    } finally {
      setIsSaving(false);
    }
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
      className={styles.cervixModal}
      size="sm"
      primaryButtonText={isSaving ? t('saving', 'Saving...') : t('save', 'Save')}
      secondaryButtonText={t('cancel', 'Cancel')}
      onRequestSubmit={handleSubmit(handleFormSubmit)}
      onSecondarySubmit={handleClose}
      primaryButtonDisabled={isSaving}
      preventCloseOnClickOutside={isSaving}>
      <div className={styles.contractionsFormContainer} style={{ maxWidth: 600, margin: 0, padding: '0 8px' }}>
        <h3 className={styles.sectionTitle} style={{ marginBottom: 0 }}>
          {t('cervicalContractionsData', 'Contractions')}
        </h3>

        <Controller
          name="contractionLevel"
          control={control}
          rules={{ required: t('contractionLevelRequired', 'Please select contraction level') }}
          render={({ field, fieldState }) => (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24, marginBottom: 8 }}>
              {contractionLevelOptions.map((option) => (
                <div key={option.value} style={{ flex: 1, minWidth: 100, margin: '0 12px' }}>
                  <div style={{ textAlign: 'center', fontWeight: 600, marginBottom: 8 }}>{option.title}</div>
                  <div
                    className={`${styles.contractionLevelOption} ${
                      field.value === option.value ? styles.contractionLevelSelected : ''
                    }`}
                    onClick={() => field.onChange(option.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        field.onChange(option.value);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-pressed={field.value === option.value}
                    title={option.label}
                    style={{ minWidth: 80 }}>
                    <div className={`${styles.contractionLevelButton} ${styles[option.visualClass]}`}>
                      {option.visual}
                    </div>
                  </div>

                  {option.value === contractionLevelOptions[contractionLevelOptions.length - 1].value &&
                    fieldState.error && <div className={styles.errorMessage}>{fieldState.error.message}</div>}
                </div>
              ))}
            </div>
          )}
        />

        <div style={{ margin: '32px 0 0 0', textAlign: 'left', fontWeight: 500 }}>
          {t('chooseCount', 'Choose count')}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 16 }}>
          <Controller
            name="contractionCount"
            control={control}
            rules={{ required: t('contractionCountRequired', 'Please select number of contractions') }}
            render={({ field, fieldState }) => (
              <>
                <Select
                  id="contraction-count-select"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  invalid={!!fieldState.error}
                  invalidText={fieldState.error?.message}
                  style={{ minWidth: 280 }}
                  helperText={t('contractionCountHelper', 'Normal range: 2-4 contractions per 10 minutes')}>
                  <SelectItem value="" text={t('chooseAnOption', 'Choose an option')} />
                  <SelectItem value="1" text={t('oneContraction', '1 contraction')} />
                  <SelectItem value="2" text={t('twoContractions', '2 contractions')} />
                  <SelectItem value="3" text={t('threeContractions', '3 contractions')} />
                  <SelectItem value="4" text={t('fourContractions', '4 contractions')} />
                  <SelectItem value="5" text={t('fiveContractions', '5 contractions (High - Monitor closely)')} />
                </Select>
              </>
            )}
          />
        </div>
      </div>
    </Modal>
  );
};

export default CervicalContractionsForm;
