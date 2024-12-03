import {
  Button,
  ButtonSet,
  Column,
  DatePicker,
  DatePickerInput,
  Dropdown,
  Form,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Stack,
} from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { showSnackbar, useConfig } from '@openmrs/esm-framework';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { mutate } from 'swr';
import { z } from 'zod';
import { useLabManifest } from '../hooks';
import {
  addOrderToManifest,
  labManifestOrderToManifestFormSchema,
  mutateManifestLinks,
} from '../lab-manifest.resources';
import { ActiveRequestOrder } from '../types';
import ActiveOrdersSelectionPreview from './active-order-selection-preview';
import styles from './lab-manifest-form.scss';
import { LabManifestConfig } from '../config-schema';

interface LabManifestOrdersToManifestFormProps {
  onClose: () => void;
  props: {
    orders?: Array<ActiveRequestOrder>;
    selectedOrders: Array<{
      labManifest: {
        uuid: string;
      };
      order: {
        uuid: string;
      };
      payload: string;
    }>;
  };
}

type OrderToManifestFormType = z.infer<typeof labManifestOrderToManifestFormSchema>;

const LabManifestOrdersToManifestForm: React.FC<LabManifestOrdersToManifestFormProps> = ({
  onClose,
  props: { selectedOrders, orders },
}) => {
  const { t } = useTranslation();
  const form = useForm<OrderToManifestFormType>({
    defaultValues: {},
    resolver: zodResolver(labManifestOrderToManifestFormSchema),
  });
  const { sampleTypes } = useConfig<LabManifestConfig>();

  const { error, isLoading, manifest } = useLabManifest(selectedOrders[0]?.labManifest?.uuid);
  const onSubmit = async (values: OrderToManifestFormType) => {
    try {
      const results = await Promise.allSettled(
        selectedOrders.map((order) => addOrderToManifest({ ...order, ...values })),
      );
      results.forEach((res) => {
        if (res.status === 'fulfilled') {
          showSnackbar({ title: 'Success', kind: 'success', subtitle: 'Order added succesfully' });
        } else {
          showSnackbar({ title: 'Failure', kind: 'error', subtitle: 'Error adding order to the manifest' });
        }
      });
      mutateManifestLinks(manifest?.uuid, manifest?.manifestStatus);
      onClose();
    } catch (error) {
      showSnackbar({ title: 'Failure', kind: 'error', subtitle: 'Error adding orders to the manifest' });
    }
  };

  return (
    <React.Fragment>
      <Form onSubmit={form.handleSubmit(onSubmit)}>
        <ModalHeader closeModal={onClose} className={styles.heading}>
          {t('updateSampleDetails', 'Update Sample Details')}
        </ModalHeader>
        <ModalBody>
          <Stack gap={4} className={styles.grid}>
            <Column>
              <Controller
                control={form.control}
                name="sampleType"
                render={({ field }) => (
                  <Dropdown
                    ref={field.ref}
                    invalid={form.formState.errors[field.name]?.message}
                    invalidText={form.formState.errors[field.name]?.message}
                    id="manifestType"
                    titleText={t('sampleType', 'Sample Type')}
                    onChange={(e) => {
                      field.onChange(e.selectedItem);
                    }}
                    initialSelectedItem={field.value}
                    label="Choose option"
                    items={sampleTypes
                      .filter((type) => type.labManifestType.includes(`${manifest?.manifestType}`))
                      .map((r) => r.sampleType)}
                    itemToString={(item) => item ?? ''}
                  />
                )}
              />
            </Column>
            <Row className={styles.datePickersRow}>
              <Column className={styles.datePickerInput}>
                <Controller
                  control={form.control}
                  name="sampleCollectionDate"
                  render={({ field }) => (
                    <DatePicker
                      dateFormat="d/m/Y"
                      id="sampleCollectionDate"
                      datePickerType="single"
                      {...field}
                      invalid={form.formState.errors[field.name]?.message}
                      invalidText={form.formState.errors[field.name]?.message}>
                      <DatePickerInput
                        invalid={form.formState.errors[field.name]?.message}
                        invalidText={form.formState.errors[field.name]?.message}
                        placeholder="mm/dd/yyyy"
                        labelText={t('sampleCollectionDate', 'Sample collection date')}
                      />
                    </DatePicker>
                  )}
                />
              </Column>
              <Column className={styles.datePickerInput}>
                <Controller
                  control={form.control}
                  name="sampleSeparationDate"
                  render={({ field }) => (
                    <DatePicker
                      dateFormat="d/m/Y"
                      id="sampleSeparationDate"
                      datePickerType="single"
                      {...field}
                      invalid={form.formState.errors[field.name]?.message}
                      invalidText={form.formState.errors[field.name]?.message}>
                      <DatePickerInput
                        invalid={form.formState.errors[field.name]?.message}
                        invalidText={form.formState.errors[field.name]?.message}
                        placeholder="mm/dd/yyyy"
                        labelText={t('sampleSeparationDate', 'Sample seperation date')}
                      />
                    </DatePicker>
                  )}
                />
              </Column>
            </Row>
            <div className={styles.previewContainer}>
              <ActiveOrdersSelectionPreview orders={orders} />
            </div>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <ButtonSet className={styles.buttonSet}>
            <Button className={styles.button} kind="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button className={styles.button} kind="primary" disabled={form.formState.isSubmitting} type="submit">
              Add Samples
            </Button>
          </ButtonSet>
        </ModalFooter>
      </Form>
    </React.Fragment>
  );
};

export default LabManifestOrdersToManifestForm;
