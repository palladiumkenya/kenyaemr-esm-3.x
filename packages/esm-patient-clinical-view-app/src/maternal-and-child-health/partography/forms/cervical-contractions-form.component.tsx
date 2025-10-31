import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { contractionLevelOptions as baseContractionLevelOptions } from '../types';
import { Modal, Dropdown } from '@carbon/react';
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
    if (!data.contractionLevel || data.contractionLevel.trim() === '') {
      setError('contractionLevel', {
        type: 'manual',
        message: t('contractionLevelRequired', 'Please select contraction level'),
      });
      hasErrors = true;
    }
    if (!data.contractionCount || data.contractionCount.trim() === '') {
      setError('contractionCount', {
        type: 'manual',
        message: t('contractionCountRequired', 'Please select number of contractions'),
      });
      hasErrors = true;
    }
    if (hasErrors) {
      alert(t('formValidationError', 'Please select both contraction level and count before submitting.'));
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
          {t('cervicalContractionsData', 'Cervical Contractions')}
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
                <Dropdown
                  id="contraction-count-dropdown"
                  titleText=""
                  label={t('chooseCount', 'Choose count')}
                  items={[
                    { id: '1', text: t('oneContraction', '1 contraction') },
                    { id: '2', text: t('twoContractions', '2 contractions') },
                    { id: '3', text: t('threeContractions', '3 contractions') },
                    { id: '4', text: t('fourContractions', '4 contractions') },
                    { id: '5', text: t('fiveContractions', '5 contractions') },
                  ]}
                  itemToString={(item) => (item ? item.text : '')}
                  selectedItem={
                    field.value
                      ? {
                          id: field.value,
                          text: `${field.value} contraction${field.value === '1' ? '' : 's'}`,
                        }
                      : null
                  }
                  onChange={({ selectedItem }) => field.onChange(selectedItem?.id || '')}
                  className={styles.contractionCountDropdown}
                  style={{ minWidth: 280, borderRadius: 24, background: '#eee', fontWeight: 600 }}
                />
                {fieldState.error && <div className={styles.errorMessage}>{fieldState.error.message}</div>}
              </>
            )}
          />
        </div>
      </div>
    </Modal>
  );
};

export default CervicalContractionsForm;
