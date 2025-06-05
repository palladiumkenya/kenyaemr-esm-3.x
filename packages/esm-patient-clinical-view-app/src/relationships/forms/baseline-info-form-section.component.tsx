import { Column, Dropdown, RadioButton, RadioButtonGroup, SelectSkeleton } from '@carbon/react';
import { useConfig } from '@openmrs/esm-framework';
import React, { useEffect, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { ConfigObject } from '../../config-schema';
import { contactListConceptMap } from '../../contact-list/contact-list-concept-map';
import {
  contactIPVOutcomeOptions,
  getHivStatusBasedOnEnrollmentAndHTSEncounters,
} from '../../contact-list/contact-list.resource';
import usePersonAttributes from '../../hooks/usePersonAttributes';
import { BOOLEAN_NO, BOOLEAN_YES, relationshipFormSchema } from '../relationship.resources';
import {
  LIVING_WITH_PATIENT_CONCEPT_UUID,
  PARTNER_HIV_STATUS_CONCEPT_UUID,
  PNS_APROACH_CONCEPT_UUID,
} from '../relationships-constants';
import styles from './form.scss';
import useRelativeHivEnrollment from '../../hooks/useRelativeHivEnrollment';
import useRelativeHTSEncounter from '../../hooks/useRelativeHTSEncounter';

const RelationshipBaselineInfoFormSection = () => {
  const form = useFormContext<z.infer<typeof relationshipFormSchema>>();
  const {
    enrollment,
    isLoading: enrollmentLoading,
    error: enrollmentError,
  } = useRelativeHivEnrollment(form.watch('personB'));
  const {
    encounters,
    isLoading: encounterLoading,
    error: encounterError,
  } = useRelativeHTSEncounter(form.watch('personB'));
  const hivStatusPersonB = getHivStatusBasedOnEnrollmentAndHTSEncounters(encounters, enrollment);

  const { t } = useTranslation();
  const personUuid = form.watch('personB');
  const config = useConfig<ConfigObject>();
  const { setValue } = form;
  const { attributes, isLoading } = usePersonAttributes(personUuid);

  const hivStatus = useMemo(
    () =>
      Object.entries(contactListConceptMap[PARTNER_HIV_STATUS_CONCEPT_UUID].answers).map(([uuid, display]) => ({
        label: display,
        value: uuid,
      })),
    [],
  );

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

  const observableRelationship = form.watch('relationshipType');
  const observablePhysicalAssault = form.watch('physicalAssault');
  const observableThreatened = form.watch('threatened');
  const observableSexualAssault = form.watch('sexualAssault');
  const showIPVRelatedFields =
    config.relationshipTypesList.findIndex(
      (r) => r.uuid === observableRelationship && r.category.some((c) => c === 'sexual'),
    ) !== -1;

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
  }, [
    observablePhysicalAssault,
    observableThreatened,
    observableSexualAssault,
    observableRelationship,
    form,
    showIPVRelatedFields,
  ]);

  useEffect(() => {
    if (attributes.length) {
      const hivStatusAttribute = attributes.find(
        (a) => a.attributeType.uuid === config.contactPersonAttributesUuid.baselineHIVStatus,
      );
      if (hivStatusAttribute) {
        const value = hivStatus.find((r) => r.value.startsWith(hivStatusAttribute.value))?.value;
        if (value) {
          setValue('baselineStatus', value);
        }
      } else if (hivStatusPersonB) {
        const value = hivStatus.find((r) => r.label.toLowerCase().includes(hivStatusPersonB.toLowerCase()))?.value;
        if (value) {
          setValue('baselineStatus', value);
        }
      }

      const pnsAproachAttribute = attributes.find(
        (a) => a.attributeType.uuid === config.contactPersonAttributesUuid.preferedPnsAproach,
      );
      if (pnsAproachAttribute) {
        const value = pnsAproach.find((r) => r.value.startsWith(pnsAproachAttribute.value))?.value;
        if (value) {
          setValue('preferedPNSAproach', value);
        }
      }

      const livingWithPatientAttribute = attributes.find(
        (a) => a.attributeType.uuid === config.contactPersonAttributesUuid.livingWithContact,
      );
      if (livingWithPatientAttribute) {
        const value = contactLivingWithPatient.find((r) => r.value.startsWith(livingWithPatientAttribute.value))?.value;
        if (value) {
          setValue('livingWithClient', value);
        }
      }

      const ipvAttr = attributes.find(
        (a) => a.attributeType.uuid === config.contactPersonAttributesUuid.contactIPVOutcome,
      );
      if (ipvAttr) {
        const value = contactIPVOutcomeOptions.find((r) => r.value.startsWith(ipvAttr.value))?.value;
        if (value) {
          setValue('ipvOutCome', value as any);
        }
      }
    } else if (hivStatusPersonB) {
      const value = hivStatus.find((r) => r.label.toLowerCase().includes(hivStatusPersonB.toLowerCase()))?.value;
      if (value) {
        setValue('baselineStatus', value);
      }
    }
  }, [attributes, setValue, config, hivStatus, pnsAproach, contactLivingWithPatient, hivStatusPersonB]);

  return (
    <>
      <Column>
        <Controller
          control={form.control}
          name="livingWithClient"
          render={({ field, fieldState: { error } }) => (
            <>
              {isLoading || encounterLoading || enrollmentLoading ? (
                <SelectSkeleton />
              ) : (
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
            </>
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
                  invalid={error?.message}
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
                  invalid={error?.message}
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
                  invalid={error?.message}
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
                <>
                  {isLoading || encounterLoading || enrollmentLoading ? (
                    <SelectSkeleton />
                  ) : (
                    <Dropdown
                      ref={field.ref}
                      invalid={error?.message}
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
                </>
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
            <>
              {isLoading || encounterLoading || enrollmentLoading ? (
                <SelectSkeleton />
              ) : (
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
            </>
          )}
        />
      </Column>
      <Column>
        <Controller
          control={form.control}
          name="preferedPNSAproach"
          render={({ field, fieldState: { error } }) => (
            <>
              {isLoading || encounterLoading || enrollmentLoading ? (
                <SelectSkeleton />
              ) : (
                <Dropdown
                  ref={field.ref}
                  invalid={!!error?.message}
                  invalidText={error?.message}
                  id="preferedPNSAproach"
                  titleText={t('preferedPNSAproach', 'Prefered PNS Aproach')}
                  onChange={(e: { selectedItem: string }) => {
                    field.onChange(e.selectedItem);
                  }}
                  selectedItem={field.value}
                  label="Select Aproach"
                  items={pnsAproach.map((r) => r.value)}
                  itemToString={(item: string) => pnsAproach.find((r) => r.value === item)?.label ?? ''}
                />
              )}
            </>
          )}
        />
      </Column>
    </>
  );
};

export default RelationshipBaselineInfoFormSection;
