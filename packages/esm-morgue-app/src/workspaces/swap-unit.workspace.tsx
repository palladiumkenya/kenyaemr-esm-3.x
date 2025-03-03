import { Button, ButtonSet, Form, Stack, Column, Dropdown, InlineLoading, InlineNotification } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import DeceasedInfo from '../component/deceasedInfo/deceased-info.component';
import styles from './swap-unit.scss';
import { useAdmissionLocation } from '../hook/useMortuaryAdmissionLocation';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useVisit, showSnackbar, navigate } from '@openmrs/esm-framework';
import { useMortuaryOperation } from '../hook/useAdmitPatient';

interface SwapFormProps {
  closeWorkspace: () => void;
  patientUuid: string;
}

const schema = z.object({
  availableCompartment: z.number().min(1, 'Please select an available compartment'),
});
const SwapForm: React.FC<SwapFormProps> = ({ closeWorkspace, patientUuid }) => {
  const { t } = useTranslation();
  const { admissionLocation, isLoading: isLoadingAdmissionLocation } = useAdmissionLocation();
  const { currentVisit } = useVisit(patientUuid);
  const { assignDeceasedToCompartment, removeDeceasedFromCompartment, createEncounterForCompartmentSwap } =
    useMortuaryOperation();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      availableCompartment: '',
    },
  });

  const currentBed = admissionLocation?.bedLayouts?.find((bed) =>
    bed.patients.some((patient) => patient.uuid === patientUuid),
  );

  const currentBedNumber = currentBed?.bedNumber;

  const dropdownItems =
    admissionLocation?.bedLayouts?.map((bed) => ({
      bedId: bed.bedId,
      display:
        bed.status === 'OCCUPIED'
          ? `${bed.bedNumber} . ${bed.patients.map((patient) => patient?.person?.display).join(' . ')}`
          : `${bed.bedNumber} . ${bed.status}`,
      disabled: bed.bedId === currentBed?.bedId,
    })) || [];

  const onSubmit = async (data: any) => {
    const { availableCompartment } = data;
    const bedSelected = admissionLocation?.bedLayouts?.find((bed) => bed.bedId === availableCompartment);
    const bedAssignedToPatient = admissionLocation?.bedLayouts?.find((bed) =>
      bed.patients.some((patient) => patient.uuid === patientUuid),
    );

    try {
      const encounterResponse = await createEncounterForCompartmentSwap(patientUuid, currentVisit?.uuid);

      if (encounterResponse.ok) {
        if (bedSelected) {
          const compartmentResponse = await assignDeceasedToCompartment(
            patientUuid,
            availableCompartment,
            encounterResponse.data.uuid,
          );

          if (compartmentResponse.ok) {
            showSnackbar({
              kind: 'success',
              title: t('deceasedPatientAssignedNewBed', 'Deceased patient assigned to new compartment'),
              subtitle: t(
                'deceasedPatientAssignedNewBedDetail',
                '{{patientName}} assigned to compartment {{bedNumber}}',
                {
                  patientName: currentVisit?.patient?.person?.display,
                  bedNumber: bedSelected.bedNumber,
                },
              ),
            });
          }
        } else if (bedAssignedToPatient) {
          const unassignResponse = await removeDeceasedFromCompartment(patientUuid, bedAssignedToPatient.bedId);

          if (unassignResponse.ok) {
            showSnackbar({
              kind: 'success',
              title: t('patientUnassignedFromBed', 'Deceased patient unassigned from bed'),
              subtitle: t('patientUnassignedFromBedDetail', '{{patientName}} is now unassigned from bed', {
                patientName: currentVisit?.patient?.person?.display,
              }),
            });
          }
        }
      } else {
        <InlineNotification
          kind="error"
          title={t('errorCreatingEncounter', 'Error assigning deceased to compartment')}
        />;
      }
    } catch (error) {
      showSnackbar({
        kind: 'error',
        title: t('errorChangingPatientBedAssignment', 'Error changing patient bed assignment'),
        subtitle: error?.message,
      });
    } finally {
      closeWorkspace();
      navigate({ to: window.getOpenmrsSpaBase() + `home/morgue` });
    }
  };

  if (isLoadingAdmissionLocation) {
    return <InlineLoading status="active" iconDescription="Loading" description="Loading admission location..." />;
  }

  return (
    <Form className={styles.formContainer} onSubmit={handleSubmit(onSubmit)}>
      <Stack gap={4} className={styles.formGrid}>
        <DeceasedInfo patientUuid={patientUuid} />

        {currentBedNumber && (
          <Column className={styles.searchContainer}>
            <p>
              {t('currentCompartment', 'Current Compartment')}: {currentBedNumber}
            </p>
          </Column>
        )}

        <Column className={styles.searchContainer}>
          <Controller
            name="availableCompartment"
            control={control}
            render={({ field }) => (
              <Dropdown
                {...field}
                id="avail-compartment"
                className={styles.sectionField}
                items={dropdownItems}
                itemToString={(item) => item?.display || ''}
                titleText={t('availableCompartment', 'Available Compartment')}
                label={t('ChooseOptions', 'Choose option')}
                onChange={({ selectedItem }) => field.onChange(selectedItem?.bedId)}
                invalid={!!errors.availableCompartment}
                invalidText={errors.availableCompartment?.message}
              />
            )}
          />
        </Column>

        <ButtonSet className={styles.buttonSet}>
          <Button size="lg" kind="secondary" onClick={closeWorkspace}>
            {t('discard', 'Discard')}
          </Button>
          <Button kind="primary" size="lg" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <InlineLoading description={t('swapping', 'Swapping...')} /> : t('swap', 'Swap Unit')}
          </Button>
        </ButtonSet>
      </Stack>
    </Form>
  );
};
export default SwapForm;
