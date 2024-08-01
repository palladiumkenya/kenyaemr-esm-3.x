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
import { showSnackbar } from '@openmrs/esm-framework';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { mutate } from 'swr';
import { z } from 'zod';
import { addOrderToManifest, labManifestOrderToManifestFormSchema, sampleTypes } from '../lab-manifest.resources';
import styles from './lab-manifest-form.scss';

interface LabManifestOrdersToManifestFormProps {
  onClose: () => void;
  props: {
    title?: string;
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
  props: { title, selectedOrders },
}) => {
  const { t } = useTranslation();
  const form = useForm<OrderToManifestFormType>({
    defaultValues: {},
    resolver: zodResolver(labManifestOrderToManifestFormSchema),
  });

  const onSubmit = async (values: OrderToManifestFormType) => {
    try {
      const results = await Promise.allSettled(
        selectedOrders.map((order) => addOrderToManifest({ ...order, ...values })),
      );
      results.forEach((res) => {
        if (res.status === 'fulfilled') {
          showSnackbar({ title: 'Success', kind: 'success', subtitle: JSON.stringify(res.value) });
        } else {
          showSnackbar({ title: 'Success', kind: 'error', subtitle: JSON.stringify(res.reason) });
        }
      });
      mutate((key) => {
        return typeof key === 'string' && key.startsWith(`/ws/rest/v1/labmanifest?status`);
      });
      onClose();
      showSnackbar({ title: 'Success', kind: 'success', subtitle: 'Lab manifest created successfully!' });
    } catch (error) {
      showSnackbar({ title: 'Failure', kind: 'error', subtitle: 'Error adding orders to the manifest' });
    }
  };

  return (
    <React.Fragment>
      <Form onSubmit={form.handleSubmit(onSubmit)}>
        <ModalHeader closeModal={onClose} className={styles.heading}>
          {title ?? t('updateSampleDetails', 'Update Sample Details')}
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
                    items={sampleTypes.map((r) => r.value)}
                    itemToString={(item) => sampleTypes.find((r) => r.value === item)?.label ?? ''}
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
          </Stack>
        </ModalBody>
        <ModalFooter>
          <ButtonSet className={styles.buttonSet}>
            <Button className={styles.button} kind="primary" disabled={form.formState.isSubmitting} type="submit">
              Submit
            </Button>
            <Button className={styles.button} kind="secondary" onClick={onClose}>
              Cancel
            </Button>
          </ButtonSet>
        </ModalFooter>
      </Form>
    </React.Fragment>
  );
};

export default LabManifestOrdersToManifestForm;
