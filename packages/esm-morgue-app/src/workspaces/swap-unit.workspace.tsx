import { Button, ButtonSet, Form, Stack, Column, Dropdown, InlineLoading } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import DeceasedInfo from '../component/deceasedInfo/deceased-info.component';
import styles from './swap-unit.scss';
import { useAdmissionLocation } from '../hook/useMortuaryAdmissionLocation';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface SwapFormProps {
  closeWorkspace: () => void;
  patientUuid: string;
}

const schema = z.object({
  availableCompartment: z.string().nonempty('Please select an available compartment'),
});

const SwapForm: React.FC<SwapFormProps> = ({ closeWorkspace, patientUuid }) => {
  const { t } = useTranslation();
  const { admissionLocation, isLoading: isLoadingAdmissionLocation } = useAdmissionLocation();

  const {
    control,
    handleSubmit,
    formState: { errors },
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
    closeWorkspace();
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
          <Button kind="primary" size="lg" type="submit">
            {t('swap', 'Swap Unit')}
          </Button>
        </ButtonSet>
      </Stack>
    </Form>
  );
};

export default SwapForm;
