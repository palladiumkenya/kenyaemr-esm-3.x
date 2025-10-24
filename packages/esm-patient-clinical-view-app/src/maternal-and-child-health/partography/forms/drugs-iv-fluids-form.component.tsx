import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { Button, Modal, Grid, Column, Dropdown, InlineNotification, TextInput, ButtonSkeleton } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { launchWorkspace } from '@openmrs/esm-framework';
import { saveDrugOrderData } from '../partography.resource';
import styles from '../partography-data-form.scss';
import { ROUTE_OPTIONS, FREQUENCY_OPTIONS } from '../types';

type DrugsIVFluidsFormData = {
  drugName: string;
  dosage: string;
  route: string;
  frequency: string;
};

type DrugsIVFluidsFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { drugName: string; dosage: string; route: string; frequency: string }) => void;
  onDataSaved?: () => void;
  patient?: {
    uuid: string;
    name: string;
    gender: string;
    age: string;
  };
};

const DrugsIVFluidsForm: React.FC<DrugsIVFluidsFormProps> = ({ isOpen, onClose, onSubmit, onDataSaved, patient }) => {
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<DrugsIVFluidsFormData>({
    defaultValues: {
      drugName: '',
      dosage: '',
      route: '',
      frequency: '',
    },
  });

  const handleLaunchDrugOrderWorkspace = useCallback(() => {
    if (patient?.uuid) {
      launchWorkspace('add-drug-order', {
        patientUuid: patient.uuid,
        workspaceTitle: 'Add Drug Order',
        onOrderSaved: (savedOrder) => {
          if (onDataSaved) {
            onDataSaved();
          }

          onClose();
        },
      });
    }
  }, [patient?.uuid, onDataSaved, onClose]);

  const routeOptions = ROUTE_OPTIONS as unknown as { id: string; text: string }[];
  const frequencyOptions = FREQUENCY_OPTIONS as unknown as { id: string; text: string }[];

  const onSubmitForm = async (data: DrugsIVFluidsFormData) => {
    clearErrors();
    setSaveError(null);
    setSaveSuccess(false);

    if (!data.drugName || data.drugName === '') {
      setError('drugName', {
        type: 'manual',
        message: t('drugNameRequired', 'Drug name is required'),
      });
      return;
    }

    if (!data.dosage || data.dosage === '') {
      setError('dosage', {
        type: 'manual',
        message: t('dosageRequired', 'Dosage is required'),
      });
      return;
    }

    if (!data.route || data.route === '') {
      setError('route', {
        type: 'manual',
        message: t('routeRequired', 'Route is required'),
      });
      return;
    }

    if (!data.frequency || data.frequency === '') {
      setError('frequency', {
        type: 'manual',
        message: t('frequencyRequired', 'Frequency is required'),
      });
      return;
    }

    if (patient?.uuid) {
      setIsSaving(true);
      try {
        const result = await saveDrugOrderData(
          patient.uuid,
          {
            drugName: data.drugName,
            dosage: data.dosage,
            route: data.route,
            frequency: data.frequency,
          },
          t,
        );

        if (result.success) {
          setSaveSuccess(true);

          if (onDataSaved) {
            onDataSaved();
          }

          onSubmit({
            drugName: data.drugName,
            dosage: data.dosage,
            route: data.route,
            frequency: data.frequency,
          });

          reset();

          setTimeout(() => {
            setSaveSuccess(false);
            onClose();
          }, 1500);
        } else {
          setSaveError(result.message || t('saveError', 'Failed to save data'));
        }
      } catch (error) {
        console.error('Save error details:', error);
        setSaveError(
          error?.message ||
            error?.responseBody?.error?.message ||
            error?.response?.data?.error?.message ||
            t('saveError', 'Failed to save data'),
        );
      } finally {
        setIsSaving(false);
      }
    } else {
      onSubmit({
        drugName: data.drugName,
        dosage: data.dosage,
        route: data.route,
        frequency: data.frequency,
      });
      reset();
      onClose();
    }
  };

  const handleClose = () => {
    reset();
    clearErrors();
    setSaveError(null);
    setSaveSuccess(false);
    onClose();
  };

  const patientLabel = patient ? `${patient.name}, ${patient.gender}, ${patient.age}` : 'Patient Information';

  return (
    <Modal
      open={isOpen}
      onRequestClose={handleClose}
      modalHeading={t('drugsIVFluids', 'Drugs and IV Fluids Given')}
      modalLabel={patientLabel}
      primaryButtonText={isSaving ? t('saving', 'Saving...') : t('save', 'Save')}
      primaryButtonDisabled={isSaving}
      secondaryButtonText={t('cancel', 'Cancel')}
      onRequestSubmit={handleSubmit(onSubmitForm)}
      onSecondarySubmit={handleClose}
      size="md">
      {saveSuccess && (
        <InlineNotification
          kind="success"
          title={t('saveSuccess', 'Data saved successfully')}
          subtitle={t('drugOrderDataSaved', 'Drug order data has been saved to OpenMRS')}
          hideCloseButton
        />
      )}

      {saveError && (
        <InlineNotification
          kind="error"
          title={t('saveError', 'Error saving data')}
          subtitle={saveError}
          onCloseButtonClick={() => setSaveError(null)}
        />
      )}

      <div className={styles.modalContent}>
        <Grid>
          <Column sm={4} md={8} lg={16}>
            <div className={styles.workspaceLauncherSection}>
              <h4>{t('selectFromDrugList', 'Select from Drug List')}</h4>
              <p className={styles.helperText}>
                {t(
                  'drugOrderDescription',
                  'Use the drug order workspace to select from the complete list of available drugs with proper dosing and administration details.',
                )}
              </p>
              <Button
                kind="tertiary"
                renderIcon={Add}
                onClick={handleLaunchDrugOrderWorkspace}
                disabled={!patient?.uuid}
                className={styles.workspaceLauncherButton}>
                {t('addDrugOrder', 'Add drug order')}
              </Button>
            </div>
          </Column>

          <Column sm={4} md={8} lg={16}>
            <div className={styles.manualEntrySection}>
              <h4>{t('manualEntry', 'Manual Entry')}</h4>
              <p className={styles.helperText}>
                {t('manualEntryDescription', 'Or enter drug information manually for quick documentation.')}
              </p>
            </div>
          </Column>

          <Column sm={4} md={8} lg={16}>
            <Controller
              name="drugName"
              control={control}
              render={({ field, fieldState }) => (
                <TextInput
                  id="drug-name-input"
                  labelText={t('drugName', 'Drug Name')}
                  placeholder={t('enterDrugName', 'Enter drug name...')}
                  value={field.value}
                  onChange={field.onChange}
                  invalid={!!fieldState.error}
                  invalidText={fieldState.error?.message}
                />
              )}
            />
          </Column>

          <Column sm={4} md={4} lg={8}>
            <Controller
              name="dosage"
              control={control}
              render={({ field, fieldState }) => (
                <TextInput
                  id="dosage-input"
                  labelText={t('dosage', 'Dosage')}
                  placeholder={t('enterDosage', 'e.g., 250mg, 500ml')}
                  value={field.value}
                  onChange={field.onChange}
                  invalid={!!fieldState.error}
                  invalidText={fieldState.error?.message}
                />
              )}
            />
          </Column>

          <Column sm={4} md={4} lg={8}>
            <Controller
              name="route"
              control={control}
              render={({ field, fieldState }) => (
                <Dropdown
                  id="route-dropdown"
                  titleText={t('route', 'Route')}
                  label={t('selectRoute', 'Select route')}
                  items={routeOptions}
                  itemToString={(item) => (item ? item.text : '')}
                  selectedItem={field.value ? routeOptions.find((opt) => opt.id === field.value) : null}
                  onChange={({ selectedItem }) => field.onChange(selectedItem?.id || '')}
                  invalid={!!fieldState.error}
                  invalidText={fieldState.error?.message}
                />
              )}
            />
          </Column>

          <Column sm={4} md={8} lg={16}>
            <Controller
              name="frequency"
              control={control}
              render={({ field, fieldState }) => (
                <Dropdown
                  id="frequency-dropdown"
                  titleText={t('frequency', 'Frequency')}
                  label={t('selectFrequency', 'Select frequency')}
                  items={frequencyOptions}
                  itemToString={(item) => (item ? item.text : '')}
                  selectedItem={field.value ? frequencyOptions.find((opt) => opt.id === field.value) : null}
                  onChange={({ selectedItem }) => field.onChange(selectedItem?.id || '')}
                  invalid={!!fieldState.error}
                  invalidText={fieldState.error?.message}
                />
              )}
            />
          </Column>
        </Grid>
      </div>
    </Modal>
  );
};

export default DrugsIVFluidsForm;
