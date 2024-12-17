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
import { z } from 'zod';
import { LabManifestConfig } from '../config-schema';
import { useLabManifest } from '../hooks';
import {
  addOrderToManifest,
  labManifestOrderToManifestFormSchema,
  mutateManifestLinks,
} from '../lab-manifest.resources';
import { ActiveRequestOrder } from '../types';
import ActiveOrdersSelectionPreview from './active-order-selection-preview';
import styles from './lab-manifest-form.scss';

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
    resolver: zodResolver(labManifestOrderToManifestFormSchema),
  });
  const { sampleTypes } = useConfig<LabManifestConfig>();

  const { error, isLoading, manifest } = useLabManifest(selectedOrders[0]?.labManifest?.uuid);
  const onSubmit = async (values: OrderToManifestFormType) => {
    try {
      const results = await Promise.allSettled(
        selectedOrders.map((order) => addOrderToManifest({ ...order, ...values })),
      );
      results.forEach((res, index) => {
        if (res.status === 'fulfilled') {
          showSnackbar({
            title: 'Success',
            kind: 'success',
            subtitle: t('manifestorderAddSuccess', 'Order added succesfully'),
          });
        } else {
          showSnackbar({
            title: t('manifestOrderError', 'Error adding order {{order}} for {{patient}} to the manifest', {
              order: orders.find((order) => selectedOrders[index]?.order?.uuid === order.orderUuid)?.orderId,
              patient: orders.find((order) => selectedOrders[index]?.order?.uuid === order.orderUuid)?.patientName,
            }),
            kind: 'error',
            subtitle: `${res.reason?.responseBody?.error?.message ?? res?.reason?.message}`,
          });
        }
      });
      mutateManifestLinks(manifest?.uuid, manifest?.manifestStatus);
      onClose();
    } catch (error) {
      showSnackbar({
        title: t('manifestOrderError', 'Error adding order to the manifest'),
        kind: 'error',
        subtitle: ` ${error.reason?.responseBody?.error?.message ?? error?.reason?.message}`,
      });
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
              <Column className={styles.inputRow}>
                <Controller
                  control={form.control}
                  name="sampleCollectionDate"
                  render={({ field }) => (
                    <DatePicker
                      className={styles.datePickerInput}
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
                        size="xl"
                      />
                    </DatePicker>
                  )}
                />
              </Column>
              <Column className={styles.inputRow}>
                <Controller
                  control={form.control}
                  name="sampleSeparationDate"
                  render={({ field }) => (
                    <DatePicker
                      className={styles.datePickerInput}
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
                        size="xl"
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
