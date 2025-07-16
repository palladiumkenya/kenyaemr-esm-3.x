import {
  Button,
  ButtonSet,
  Form,
  Stack,
  Column,
  InlineLoading,
  InlineNotification,
  Search,
  RadioButton,
  RadioButtonGroup,
  Tag,
  Layer,
  Tile,
  FormGroup,
} from '@carbon/react';
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import DeceasedInfo from '../../deceased-patient-header/deceasedInfo/deceased-info.component';
import styles from './swap-unit.scss';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useVisit,
  showSnackbar,
  navigate,
  restBaseUrl,
  ResponsiveWrapper,
  useLayoutType,
} from '@openmrs/esm-framework';
import { EmptyDataIllustration } from '@openmrs/esm-patient-common-lib';
import classNames from 'classnames';
import { type MortuaryLocationResponse } from '../../types';
import { useMortuaryOperation } from '../admit-deceased-person-workspace/admit-deceased-person.resource';

interface SwapFormProps {
  closeWorkspace: () => void;
  patientUuid: string;
  mortuaryLocation: MortuaryLocationResponse;
  mutate?: () => void;
}

const schema = z.object({
  availableCompartment: z
    .union([z.number(), z.string()])
    .refine((val) => {
      if (typeof val === 'string') {
        return val.length > 0 && !isNaN(Number(val)) && Number(val) > 0;
      }
      return typeof val === 'number' && !isNaN(val) && val > 0;
    }, 'Please select an available compartment')
    .transform((val) => (typeof val === 'string' ? Number(val) : val)),
});

const SwapForm: React.FC<SwapFormProps> = ({ closeWorkspace, patientUuid, mortuaryLocation, mutate }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { currentVisit } = useVisit(patientUuid);
  const { assignDeceasedToCompartment, removeDeceasedFromCompartment, createEncounterForCompartmentSwap } =
    useMortuaryOperation();

  const [searchTerm, setSearchTerm] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      availableCompartment: '',
    },
  });

  const currentBed = mortuaryLocation?.bedLayouts?.find((bed) =>
    bed.patients?.some((patient) => patient.uuid === patientUuid),
  );

  const currentBedNumber = currentBed?.bedNumber;

  const filteredBeds = useMemo(() => {
    if (!mortuaryLocation?.bedLayouts) {
      return [];
    }

    let beds = mortuaryLocation.bedLayouts;

    if (searchTerm) {
      beds = beds.filter(
        (bed) =>
          bed.bedNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bed.bedType?.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bed.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bed.patients?.some((patient) => patient.person?.display?.toLowerCase().includes(searchTerm.toLowerCase())),
      );
    }

    return beds;
  }, [mortuaryLocation?.bedLayouts, searchTerm]);

  const onSubmit = async (data: any) => {
    const { availableCompartment } = data;
    const bedSelected = mortuaryLocation?.bedLayouts?.find((bed) => bed.bedId === availableCompartment);
    const bedAssignedToPatient = mortuaryLocation?.bedLayouts?.find((bed) =>
      bed.patients?.some((patient) => patient.uuid === patientUuid),
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

        mutate();
        navigate({ to: window.getOpenmrsSpaBase() + `home/morgue` });
        closeWorkspace();
      } else {
        showSnackbar({
          kind: 'error',
          title: t('errorCreatingEncounter', 'Error assigning deceased to compartment'),
          subtitle: t('errorCreatingEncounterDetail', 'Please try again or contact system administrator'),
        });
      }
    } catch (error) {
      showSnackbar({
        kind: 'error',
        title: t('errorChangingPatientBedAssignment', 'Error changing patient bed assignment'),
        subtitle: error?.message,
      });
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.formContainer}>
        <Stack gap={3}>
          <DeceasedInfo patientUuid={patientUuid} />
          <ResponsiveWrapper>
            <Column>
              <FormGroup legendText="">
                <div className={classNames(styles.visitTypeOverviewWrapper)}>
                  <Search
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder={t('searchForCompartments', 'Search for a compartment')}
                    labelText=""
                    value={searchTerm}
                    className={styles.searchInput}
                  />
                  <div className={styles.compartmentListContainer}>
                    {filteredBeds.length > 0 ? (
                      <Controller
                        control={control}
                        name="availableCompartment"
                        render={({ field }) => (
                          <RadioButtonGroup
                            className={styles.radioButtonGroup}
                            orientation="vertical"
                            name="availableCompartment"
                            valueSelected={field.value ? field.value.toString() : ''}
                            onChange={(value) => {
                              field.onChange(value);
                            }}>
                            {filteredBeds.map((bed, index) => {
                              const isCurrentBed = bed.bedId === currentBed?.bedId;
                              const isOccupied = bed.status === 'OCCUPIED';

                              return (
                                <div key={index} className={styles.compartmentOption}>
                                  <div className={styles.radioButtonWrapper}>
                                    <RadioButton
                                      className={styles.radioButton}
                                      id={`compartment-${index}`}
                                      labelText={bed.bedNumber}
                                      value={bed.bedId.toString()}
                                      disabled={isCurrentBed}
                                    />
                                  </div>
                                  <div className={styles.compartmentInfo}>
                                    <div className={styles.compartmentTags}>
                                      <Tag type={bed.bedType?.displayName === 'VIP' ? 'green' : 'blue'} size="sm">
                                        {bed.bedType?.displayName || 'Standard'}
                                      </Tag>
                                      <Tag type={bed.status === 'AVAILABLE' ? 'green' : 'red'} size="sm">
                                        {bed.status || 'Unknown'}
                                      </Tag>
                                      {isCurrentBed && (
                                        <Tag type="purple" size="sm">
                                          {t('current', 'Current')}
                                        </Tag>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </RadioButtonGroup>
                        )}
                      />
                    ) : (
                      <Layer>
                        <Tile className={styles.emptyStateTile}>
                          <EmptyDataIllustration />
                          <p className={styles.emptyStateContent}>
                            {t('noCompartmentsFound', 'No compartments found')}
                          </p>
                        </Tile>
                      </Layer>
                    )}
                  </div>
                </div>
                {errors.availableCompartment && (
                  <div className={styles.invalidText}>
                    {typeof errors.availableCompartment?.message === 'string'
                      ? errors.availableCompartment.message
                      : ''}
                  </div>
                )}
              </FormGroup>
            </Column>
          </ResponsiveWrapper>
        </Stack>
      </div>
      <ButtonSet
        className={classNames({
          [styles.tablet]: isTablet,
          [styles.desktop]: !isTablet,
        })}>
        <Button className={styles.buttonContainer} kind="secondary" onClick={() => closeWorkspace()}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button className={styles.buttonContainer} disabled={isSubmitting || !isDirty} kind="primary" type="submit">
          {isSubmitting ? (
            <span className={styles.inlineLoading}>
              {t('submitting', 'Submitting' + '...')}
              <InlineLoading status="active" iconDescription="Loading" />
            </span>
          ) : (
            t('saveAndClose', 'Save & close')
          )}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default SwapForm;
