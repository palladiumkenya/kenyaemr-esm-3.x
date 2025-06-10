import {
  Button,
  ButtonSet,
  Column,
  DatePicker,
  DatePickerInput,
  Dropdown,
  Form,
  InlineLoading,
  Stack,
  Tile,
  RadioButtonGroup,
  RadioButton,
} from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { DefaultWorkspaceProps, parseDate, restBaseUrl, showSnackbar, useConfig } from '@openmrs/esm-framework';
import React, { useEffect, useMemo } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { mutate } from 'swr';
import { z } from 'zod';
import useRelationship from '../../hooks/useRelationship';
import useRelationshipTypes from '../../hooks/useRelationshipTypes';
import styles from './contact-list-update.scss';
import PatientInfo from '../../case-management/workspace/patient-info.component';
import usePerson, { contactIPVOutcomeOptions, updateContactAttributes } from '../../contact-list/contact-list.resource';
import {
  BOOLEAN_NO,
  BOOLEAN_YES,
  relationshipFormSchema,
  relationshipUpdateFormSchema,
  updateRelationship,
  usePatientBirthdate,
} from '../../relationships/relationship.resources';
import { type Contact } from '../../types';
import { ConfigObject } from '../../config-schema';
import { contactListConceptMap } from '../../contact-list/contact-list-concept-map';
import {
  LIVING_WITH_PATIENT_CONCEPT_UUID,
  PARTNER_HIV_STATUS_CONCEPT_UUID,
  PNS_APROACH_CONCEPT_UUID,
} from '../../relationships/relationships-constants';

interface ContactListUpdateFormProps extends DefaultWorkspaceProps {
  relation: Contact;
  closeWorkspace: () => void;
  patientUuid: string;
}

type ContactListUpdateFormType = z.infer<typeof relationshipFormSchema>;

const ContactListUpdateForm: React.FC<ContactListUpdateFormProps> = ({ closeWorkspace, relation, patientUuid }) => {
  const { error, isLoading, relationship } = useRelationship(relation?.uuid);
  const { isLoading: typesLoading, error: typesError, relationshipTypes } = useRelationshipTypes();
  const { person } = usePerson(relationship?.personB?.uuid);
  const config = useConfig<ConfigObject>();

  const { t } = useTranslation();

  const pnsAproach = useMemo(
    () =>
      Object.entries(contactListConceptMap[PNS_APROACH_CONCEPT_UUID].answers).map(([uuid, display]) => ({
        label: display,
        value: uuid,
      })),
    [],
  );

  const contactLivingWithPatient = useMemo(
    () =>
      Object.entries(contactListConceptMap[LIVING_WITH_PATIENT_CONCEPT_UUID].answers).map(([uuid, display]) => ({
        label: display,
        value: uuid,
      })),
    [],
  );

  const form = useForm<ContactListUpdateFormType>({
    defaultValues: {
      endDate: undefined,
      startDate: undefined,
      relationshipType: undefined,
      baselineStatus: undefined,
      preferedPNSAproach: undefined,
      livingWithClient: undefined,
      ipvOutCome: undefined,
      physicalAssault: undefined,
      threatened: undefined,
      sexualAssault: undefined,
    },
    resolver: zodResolver(relationshipUpdateFormSchema),
  });

  const observableRelationship = form.watch('relationshipType');
  const showIPVRelatedFields = useMemo(() => {
    if (!observableRelationship || !config.relationshipTypesList) {
      return false;
    }
    return (
      config.relationshipTypesList.findIndex(
        (r) => r.uuid === observableRelationship && r.category.some((c) => c === 'sexual'),
      ) !== -1
    );
  }, [observableRelationship, config.relationshipTypesList]);
  const { isLoading: isPatientloading, birthdate } = usePatientBirthdate(relationship?.personB?.uuid);

  const patientMonths = useMemo(() => {
    let birthDate = birthdate ? parseDate(birthdate) : undefined;
    if (birthDate) {
      return Math.floor((new Date().getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
    }
  }, [birthdate]);

  const hivStatus = useMemo(
    () =>
      Object.entries(contactListConceptMap[PARTNER_HIV_STATUS_CONCEPT_UUID].answers).reduce((prev, [uuid, display]) => {
        if (display === 'HIV exposed Infant' && (patientMonths === undefined || patientMonths > 24)) {
          return prev;
        }
        return [
          ...prev,
          {
            label: display,
            value: uuid,
          },
        ];
      }, []),
    [patientMonths],
  );

  useEffect(() => {
    if (relationship && relationshipTypes.length > 0) {
      if (relationship.endDate) {
        form.setValue('endDate', new Date(relationship.endDate));
      }
      if (relationship.startDate) {
        form.setValue('startDate', new Date(relationship.startDate));
      }
      if (relationship.relationshipType) {
        form.setValue('relationshipType', relationship.relationshipType.uuid);
      }
    }
  }, [relationship, relationshipTypes, form]);

  useEffect(() => {
    if (relation && hivStatus.length > 0 && pnsAproach.length > 0 && contactLivingWithPatient.length > 0) {
      if (relation.baselineHIVStatus) {
        const hivStatusValue = hivStatus.find(
          (status) =>
            typeof status.label === 'string' &&
            status.label.toLowerCase().includes(relation.baselineHIVStatus.toLowerCase()),
        )?.value;
        if (hivStatusValue) {
          form.setValue('baselineStatus', hivStatusValue);
        }
      }

      if (relation.pnsAproach) {
        const pnsValue = pnsAproach.find((approach) =>
          (approach.label as string).toLowerCase().includes((relation.pnsAproach as string).toLowerCase()),
        )?.value;
        if (pnsValue) {
          form.setValue('preferedPNSAproach', pnsValue);
        }
      }

      if (relation.livingWithClient) {
        const livingValue = contactLivingWithPatient.find((living) => {
          const relationLiving = (relation.livingWithClient as string).toLowerCase();
          const livingLabel = (living.label as string).toLowerCase();

          return (
            livingLabel === relationLiving ||
            livingLabel.includes(relationLiving) ||
            relationLiving.includes(livingLabel)
          );
        })?.value;

        if (livingValue) {
          form.setValue('livingWithClient', livingValue);
        }
      }

      if (relation.ipvOutcome) {
        const ipvValue = contactIPVOutcomeOptions.find(
          (outcome) =>
            outcome.value === relation.ipvOutcome ||
            outcome.label.toLowerCase().includes(relation.ipvOutcome.toLowerCase()),
        )?.value;
        if (ipvValue) {
          form.setValue('ipvOutCome', ipvValue as any);
        }
      }

      if (relation.startDate) {
        try {
          const startDate = new Date(relation.startDate);
          form.setValue('startDate', startDate);
        } catch (e) {
          console.warn('Invalid start date format:', relation.startDate);
        }
      }

      if (relation.endDate) {
        try {
          const endDate = new Date(relation.endDate);
          form.setValue('endDate', endDate);
        } catch (e) {
          console.warn('Invalid end date format:', relation.endDate);
        }
      }

      if (relation.relationshipType && relationshipTypes.length > 0) {
        const relType = relationshipTypes.find(
          (type) =>
            type.displayBIsToA === relation.relationshipType || type.displayAIsToB === relation.relationshipType,
        );
        if (relType) {
          form.setValue('relationshipType', relType.uuid);
        }
      }
    }
  }, [relation, hivStatus, pnsAproach, contactLivingWithPatient, relationshipTypes, form]);

  const observablePhysicalAssault = form.watch('physicalAssault');
  const observableThreatened = form.watch('threatened');
  const observableSexualAssault = form.watch('sexualAssault');

  useEffect(() => {
    if ([observablePhysicalAssault, observableThreatened, observableSexualAssault].includes(BOOLEAN_YES)) {
      form.setValue('ipvOutCome', 'True');
    } else if (
      [observablePhysicalAssault, observableThreatened, observableSexualAssault].every((v) => v === BOOLEAN_NO)
    ) {
      form.setValue('ipvOutCome', 'False');
    }
    if (!showIPVRelatedFields) {
      form.setValue('ipvOutCome', undefined);
    }
  }, [observablePhysicalAssault, observableThreatened, observableSexualAssault, showIPVRelatedFields, form]);

  const onSubmit = async (values: ContactListUpdateFormType) => {
    try {
      const data = form.getValues();

      await updateRelationship(relationship.uuid, values);

      await updateContactAttributes(
        person?.uuid,
        {
          baselineStatus: data?.baselineStatus,
          preferedPNSAproach: data?.preferedPNSAproach,
          livingWithClient: data?.livingWithClient,
          ipvOutCome: data?.ipvOutCome,
        },
        config,
        person?.attributes?.map((attr) => ({
          uuid: attr.uuid,
          display: attr.display ?? '',
          value: attr.value,
          attributeType: {
            uuid: attr.attributeType.uuid,
            display: attr.attributeType.display ?? '',
          },
        })),
      );

      showSnackbar({
        title: 'Success',
        kind: 'success',
        subtitle: t('relationshipUpdated', ' Relationship updated successfully'),
      });

      mutate((key) => {
        return typeof key === 'string' && key.startsWith(`${restBaseUrl}/relationship`);
      });

      closeWorkspace();
    } catch (error) {
      showSnackbar({
        title: 'Error',
        subtitle: 'Failure updating relationship! ' + JSON.stringify(error),
        kind: 'error',
      });
    }
  };

  if (isLoading || typesLoading) {
    return (
      <div className={styles.loading}>
        <InlineLoading status="active" iconDescription="Loading" description="Loading form..." />
      </div>
    );
  }

  if (error || typesError) {
    return (
      <div className={styles.error}>
        <Tile id="error">
          <strong>Error:</strong>
          <p>{error?.message ?? typesError?.message ?? t('errorLoadingForm', 'Failed to load form')}</p>
        </Tile>
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <Form onSubmit={form.handleSubmit(onSubmit)}>
        <Stack gap={4} className={styles.grid}>
          <Column>
            <PatientInfo patientUuid={relationship?.personB?.uuid || relation?.relativeUuid} />
          </Column>

          <span className={styles.sectionHeader}>{t('relationship', 'Relationship')}</span>
          <Column>
            <Controller
              control={form.control}
              name="startDate"
              render={({ field, fieldState: { error } }) => (
                <DatePicker
                  className={styles.datePickerInput}
                  dateFormat="d/m/Y"
                  id="startDate"
                  datePickerType="single"
                  {...field}
                  ref={undefined}
                  invalid={!!error?.message}
                  invalidText={error?.message}>
                  <DatePickerInput
                    id={`startdate-input`}
                    name="startdate-input"
                    invalid={!!error?.message}
                    invalidText={error?.message}
                    placeholder="mm/dd/yyyy"
                    labelText={t('startDate', 'Start Date')}
                    size="xl"
                  />
                </DatePicker>
              )}
            />
          </Column>

          <Column>
            <Controller
              control={form.control}
              name="endDate"
              render={({ field, fieldState: { error } }) => (
                <DatePicker
                  className={styles.datePickerInput}
                  dateFormat="d/m/Y"
                  id="endDate"
                  datePickerType="single"
                  {...field}
                  ref={undefined}
                  invalid={!!error?.message}
                  invalidText={error?.message}>
                  <DatePickerInput
                    id="enddate-input"
                    name="enddate-input"
                    invalid={!!error?.message}
                    invalidText={error?.message}
                    placeholder="mm/dd/yyyy"
                    labelText={t('endDate', 'End Date')}
                    size="xl"
                  />
                </DatePicker>
              )}
            />
          </Column>

          <Column>
            <Controller
              control={form.control}
              name="relationshipType"
              render={({ field, fieldState: { error } }) => (
                <Dropdown
                  ref={field.ref}
                  invalid={!!error?.message}
                  invalidText={error?.message}
                  id="relationshipToPatient"
                  titleText={t('relationToPatient', 'Relation to patient')}
                  onChange={(e) => {
                    field.onChange(e.selectedItem);
                  }}
                  selectedItem={field.value}
                  label="Select Relationship"
                  items={relationshipTypes.map((r) => r.uuid)}
                  itemToString={(item) => relationshipTypes.find((r) => r.uuid === item)?.displayBIsToA ?? ''}
                />
              )}
            />
          </Column>

          <Column>
            <Controller
              control={form.control}
              name="livingWithClient"
              render={({ field, fieldState: { error } }) => (
                <Dropdown
                  ref={field.ref}
                  invalid={!!error?.message}
                  invalidText={error?.message}
                  id="livingWithClient"
                  titleText={t('livingWithClient', 'Living with client')}
                  onChange={(e: { selectedItem: string }) => {
                    field.onChange(e.selectedItem);
                  }}
                  selectedItem={field.value}
                  label="Select"
                  items={contactLivingWithPatient.map((r) => r.value)}
                  itemToString={(item: string) => contactLivingWithPatient.find((r) => r.value === item)?.label ?? ''}
                />
              )}
            />
          </Column>

          {showIPVRelatedFields && (
            <>
              <span className={styles.sectionHeader}>{t('ipvQuestions', 'IPV Questions')}</span>
              <Column>
                <Controller
                  control={form.control}
                  name="physicalAssault"
                  render={({ field, fieldState: { error } }) => (
                    <RadioButtonGroup
                      id="physicalAssault"
                      legendText={t(
                        'physicalAssault',
                        '1. Has he/she ever hit, kicked, slapped, or otherwise physically hurt you?',
                      )}
                      {...field}
                      invalid={!!error?.message}
                      invalidText={error?.message}
                      className={styles.billingItem}>
                      <RadioButton labelText={t('yes', 'Yes')} value={BOOLEAN_YES} id="physicalAssault_yes" />
                      <RadioButton labelText={t('no', 'No')} value={BOOLEAN_NO} id="physicalAssault_no" />
                    </RadioButtonGroup>
                  )}
                />
              </Column>
              <Column>
                <Controller
                  control={form.control}
                  name="threatened"
                  render={({ field, fieldState: { error } }) => (
                    <RadioButtonGroup
                      id="threatened"
                      legendText={t('threatened', '2. Has he/she ever threatened to hurt you?')}
                      {...field}
                      invalid={!!error?.message}
                      invalidText={error?.message}
                      className={styles.billingItem}>
                      <RadioButton labelText={t('yes', 'Yes')} value={BOOLEAN_YES} id="threatened_yes" />
                      <RadioButton labelText={t('no', 'No')} value={BOOLEAN_NO} id="threatened_no" />
                    </RadioButtonGroup>
                  )}
                />
              </Column>
              <Column>
                <Controller
                  control={form.control}
                  name="sexualAssault"
                  render={({ field, fieldState: { error } }) => (
                    <RadioButtonGroup
                      id="sexualAssault"
                      legendText={t(
                        'sexualAssault',
                        '3.Has he/she ever forced you to do something sexually that made you feel uncomfortable?',
                      )}
                      {...field}
                      invalid={!!error?.message}
                      invalidText={error?.message}
                      className={styles.billingItem}>
                      <RadioButton labelText={t('yes', 'Yes')} value={BOOLEAN_YES} id="sexualAssault_yes" />
                      <RadioButton labelText={t('no', 'No')} value={BOOLEAN_NO} id="sexualAssault_no" />
                    </RadioButtonGroup>
                  )}
                />
              </Column>
              <span className={styles.sectionHeader}>{t('ipvOutcome', 'IPV Outcome')}</span>
              <Column>
                <Controller
                  control={form.control}
                  name="ipvOutCome"
                  render={({ field, fieldState: { error } }) => (
                    <Dropdown
                      ref={field.ref}
                      invalid={!!error?.message}
                      invalidText={error?.message}
                      id="ipvOutCome"
                      titleText={t('ipvOutCome', 'IPV Outcome')}
                      onChange={(e) => {
                        field.onChange(e.selectedItem);
                      }}
                      selectedItem={field.value}
                      label="Choose option"
                      items={contactIPVOutcomeOptions.map((r) => r.value)}
                      itemToString={(item) => {
                        return contactIPVOutcomeOptions.find((r) => r.value === item)?.label ?? '';
                      }}
                    />
                  )}
                />
              </Column>
            </>
          )}

          <span className={styles.sectionHeader}>{t('baselineInformation', 'Baseline Information')}</span>
          <Column>
            <Controller
              control={form.control}
              name="baselineStatus"
              render={({ field, fieldState: { error } }) => (
                <Dropdown
                  ref={field.ref}
                  invalid={!!error?.message}
                  invalidText={error?.message}
                  id="baselineStatus"
                  titleText={t('baselineStatus', 'HIV Status')}
                  onChange={(e: { selectedItem: string }) => {
                    field.onChange(e.selectedItem);
                  }}
                  selectedItem={field.value}
                  label="Select HIV Status"
                  items={hivStatus.map((r) => r.value)}
                  itemToString={(item: string) => hivStatus.find((r) => r.value === item)?.label ?? ''}
                />
              )}
            />
          </Column>

          <Column>
            <Controller
              control={form.control}
              name="preferedPNSAproach"
              render={({ field, fieldState: { error } }) => (
                <Dropdown
                  ref={field.ref}
                  invalid={!!error?.message}
                  invalidText={error?.message}
                  id="preferedPNSAproach"
                  titleText={t('preferedPNSAproach', 'Preferred PNS Approach')}
                  onChange={(e: { selectedItem: string }) => {
                    field.onChange(e.selectedItem);
                  }}
                  selectedItem={field.value}
                  className={styles.preferredPnsApproach}
                  label="Select Approach"
                  items={pnsAproach.map((r) => r.value)}
                  itemToString={(item: string) => pnsAproach.find((r) => r.value === item)?.label ?? ''}
                />
              )}
            />
          </Column>
        </Stack>

        <ButtonSet className={styles.buttonSet}>
          <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
            {t('discard', 'Discard')}
          </Button>
          <Button className={styles.button} kind="primary" type="submit" disabled={form.formState.isSubmitting}>
            {t('submit', 'Submit')}
          </Button>
        </ButtonSet>
      </Form>
    </FormProvider>
  );
};

export default ContactListUpdateForm;
