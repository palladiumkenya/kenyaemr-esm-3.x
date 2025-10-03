import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { Button, Modal, Grid, Column, Dropdown, InlineNotification, TextInput, ButtonSkeleton } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { launchWorkspace } from '@openmrs/esm-framework';
import { saveDrugOrderData } from '../partography.resource';
import styles from '../partography-data-form.scss';

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

  // Handle launching the drug order workspace (like greencard)
  const handleLaunchDrugOrderWorkspace = useCallback(() => {
    if (patient?.uuid) {
      launchWorkspace('add-drug-order', {
        patientUuid: patient.uuid,
        workspaceTitle: 'Add Drug Order',
        onOrderSaved: (savedOrder) => {
          // Callback when drug order is saved successfully
          // console.log('Drug order saved:', savedOrder);
          if (onDataSaved) {
            onDataSaved();
          }
          // Close the modal since the order was placed through the workspace
          onClose();
        },
      });
    }
  }, [patient?.uuid, onDataSaved, onClose]);

  // Route options for drug administration
  const routeOptions = [
    { id: 'oral', text: 'Oral' },
    { id: 'iv', text: 'Intravenous (IV)' },
    { id: 'im', text: 'Intramuscular (IM)' },
    { id: 'sc', text: 'Subcutaneous (SC)' },
    { id: 'topical', text: 'Topical' },
    { id: 'inhalation', text: 'Inhalation' },
    { id: 'other', text: 'Other' },
  ];

  // Frequency options for drug administration
  const frequencyOptions = [
    { id: 'stat', text: 'STAT (immediately)' },
    { id: 'od', text: 'Once daily (OD)' },
    { id: 'bd', text: 'Twice daily (BD)' },
    { id: 'tds', text: 'Three times daily (TDS)' },
    { id: 'qds', text: 'Four times daily (QDS)' },
    { id: 'q4h', text: 'Every 4 hours' },
    { id: 'q6h', text: 'Every 6 hours' },
    { id: 'q8h', text: 'Every 8 hours' },
    { id: 'q12h', text: 'Every 12 hours' },
    { id: 'prn', text: 'As needed (PRN)' },
    { id: 'other', text: 'Other' },
  ];

  const onSubmitForm = async (data: DrugsIVFluidsFormData) => {
    // Clear any previous errors
    clearErrors();
    setSaveError(null);
    setSaveSuccess(false);

    // Validate required fields
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

    // Save to OpenMRS if patient UUID is available
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
          // Call the onDataSaved callback to refresh data
          if (onDataSaved) {
            onDataSaved();
          }
          // Call the original onSubmit for local state updates
          onSubmit({
            drugName: data.drugName,
            dosage: data.dosage,
            route: data.route,
            frequency: data.frequency,
          });
          // Reset the form after successful save
          reset();
          // Close the modal after a brief delay to show success message
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
      // Fallback to local submission if no patient UUID
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
      {/* Success notification */}
      {saveSuccess && (
        <InlineNotification
          kind="success"
          title={t('saveSuccess', 'Data saved successfully')}
          subtitle={t('drugOrderDataSaved', 'Drug order data has been saved to OpenMRS')}
          hideCloseButton
        />
      )}

      {/* Error notification */}
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
          {/* Drug Order Workspace Launcher - Like greencard */}
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

          {/* Manual Entry Section */}
          <Column sm={4} md={8} lg={16}>
            <div className={styles.manualEntrySection}>
              <h4>{t('manualEntry', 'Manual Entry')}</h4>
              <p className={styles.helperText}>
                {t('manualEntryDescription', 'Or enter drug information manually for quick documentation.')}
              </p>
            </div>
          </Column>

          {/* Drug Name */}
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

          {/* Dosage */}
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

          {/* Route */}
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

          {/* Frequency */}
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
