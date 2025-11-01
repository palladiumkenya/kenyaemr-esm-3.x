import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { Button, Modal, Grid, Column, Dropdown, TextInput, ButtonSkeleton } from '@carbon/react';
import { launchWorkspace, useSession, openmrsFetch, showSnackbar } from '@openmrs/esm-framework';
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
  const session = useSession();
  const [isSaving, setIsSaving] = useState(false);
  const [providerUuid, setProviderUuid] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchProviderData = async () => {
      if (session?.user?.person?.uuid && !providerUuid) {
        try {
          const providerResp = await openmrsFetch(`/ws/rest/v1/provider?person=${session.user.person.uuid}&v=default`);
          const providerData = await providerResp.json();
          if (providerData.results && providerData.results.length > 0) {
            setProviderUuid(providerData.results[0].uuid);
          }
        } catch (e) {
          console.warn('Failed to fetch provider data:', e);
        }
      }
    };

    fetchProviderData();
  }, [session?.user?.person?.uuid, providerUuid]);

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

    if (!patient) {
      showSnackbar({
        title: t('validationError', 'Validation Error'),
        subtitle: t('noPatientSelected', 'No patient selected'),
        kind: 'error',
      });
      return;
    }
    if (!patient.uuid) {
      showSnackbar({
        title: t('validationError', 'Validation Error'),
        subtitle: t('patientMissingUuid', 'Patient is missing a UUID'),
        kind: 'error',
      });
      return;
    }

    setIsSaving(true);

    const abortController = new AbortController();

    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, 30000);
    try {
      const locationUuid = session?.sessionLocation?.uuid;

      const result = await saveDrugOrderData(
        patient.uuid,
        {
          drugName: data.drugName,
          dosage: data.dosage,
          route: data.route,
          frequency: data.frequency,
        },
        locationUuid,
        providerUuid,
        abortController.signal,
      );

      clearTimeout(timeoutId);

      if (result.success) {
        // Show success notification
        showSnackbar({
          title: t('drugOrderSaved', 'Drug order saved'),
          subtitle: t('drugOrderSavedSuccessfully', 'Drug order has been saved successfully'),
          kind: 'success',
          isLowContrast: true,
        });

        // Call callbacks
        if (onDataSaved) {
          onDataSaved();
        }
        onSubmit({
          drugName: data.drugName,
          dosage: data.dosage,
          route: data.route,
          frequency: data.frequency,
        });

        // Reset form and close modal
        reset();
        onClose();
      } else {
        showSnackbar({
          title: t('errorSavingDrugOrder', 'Error saving drug order'),
          subtitle: result.message || t('saveError', 'Failed to save data'),
          kind: 'error',
        });
      }
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle request cancellation (timeout or manual abort)
      if (error.name === 'AbortError') {
        showSnackbar({
          title: t('requestCancelled', 'Request cancelled'),
          subtitle: t('saveTimeout', 'Request was cancelled due to timeout. Please try again.'),
          kind: 'warning',
        });
        return;
      }

      // Handle other errors
      showSnackbar({
        title: t('errorSavingDrugOrder', 'Error saving drug order'),
        subtitle:
          error?.message ||
          error?.responseBody?.error?.message ||
          error?.response?.data?.error?.message ||
          t('saveError', 'Failed to save data'),
        kind: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    reset();
    clearErrors();
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
      <div className={styles.modalContent}>
        <Grid>
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
