import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { Button, Modal, Grid, Column, Dropdown } from '@carbon/react';
import styles from '../partography.scss';
import { CONTRACTION_STRONG_UUID } from '../types';

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

  const contractionLevelOptions = [
    {
      value: 'none',
      label: t('noContractions', 'No Contractions'),
      concept: '1107AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // None concept
      visual: '0',
      visualClass: 'none',
      title: t('none', 'None'),
    },
    {
      value: 'mild',
      label: t('mildContractions', 'Mild Contractions'),
      concept: '1498AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // Mild concept from user
      visual: '1',
      visualClass: 'mild',
      title: t('mild', 'Mild'),
    },
    {
      value: 'moderate',
      label: t('moderateContractions', 'Moderate Contractions'),
      concept: '1499AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // Moderate concept from user
      visual: '2',
      visualClass: 'moderate',
      title: t('moderate', 'Moderate'),
    },
    {
      value: 'strong',
      label: t('strongContractions', 'Strong Contractions'),
      concept: CONTRACTION_STRONG_UUID,
      visual: '3',
      visualClass: 'strong',
      title: 'Strong',
    },
  ];

  const handleFormSubmit = (data: CervicalContractionsFormData) => {
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

    onSubmit({
      contractionLevel: data.contractionLevel,
      contractionCount: data.contractionCount,
      timeSlot: currentTime, // Auto-generate current time
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
      primaryButtonText={t('save', 'Save')}
      secondaryButtonText={t('cancel', 'Cancel')}
      onRequestSubmit={handleSubmit(handleFormSubmit)}
      onSecondarySubmit={handleClose}
      className={styles.cervixModal}
      size="lg">
      <div className={styles.contractionsFormContainer}>
        <div className={styles.formMainSection}>
          <div className={styles.formSectionLeft}>
            <h3 className={styles.sectionTitle}>{t('cervicalContractionsData', 'Cervical Contractions')}</h3>
            <h4 className={styles.sectionTitle}>{t('contractionLevel', 'Select Contraction Level')}</h4>
            <p className={styles.sectionDescription}>
              {t('contractionLevelDescription', 'Choose the intensity of uterine contractions observed')}
            </p>

            <Controller
              name="contractionLevel"
              control={control}
              rules={{ required: t('contractionLevelRequired', 'Please select contraction level') }}
              render={({ field, fieldState }) => (
                <>
                  <div className={styles.contractionLevelSelector}>
                    {contractionLevelOptions.map((option) => (
                      <div
                        key={option.value}
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
                        title={option.label}>
                        <div className={styles.contractionLevelTitle}>{option.title}</div>
                        <div className={`${styles.contractionLevelButton} ${styles[option.visualClass]}`}>
                          {option.visual}
                        </div>
                      </div>
                    ))}
                  </div>
                  {fieldState.error && <div className={styles.errorMessage}>{fieldState.error.message}</div>}
                </>
              )}
            />
          </div>

          <div className={styles.formSectionRight}>
            <Controller
              name="contractionCount"
              control={control}
              rules={{ required: t('contractionCountRequired', 'Please select number of contractions') }}
              render={({ field, fieldState }) => (
                <>
                  <Dropdown
                    id="contraction-count-dropdown"
                    titleText={t('chooseCount', 'Number of Contractions')}
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
                  />
                  {fieldState.error && <div className={styles.errorMessage}>{fieldState.error.message}</div>}
                </>
              )}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CervicalContractionsForm;
