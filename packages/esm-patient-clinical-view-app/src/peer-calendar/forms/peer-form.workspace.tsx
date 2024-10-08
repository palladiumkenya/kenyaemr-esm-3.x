import { Button, ButtonSet, Column, DatePicker, DatePickerInput, Dropdown, Form, Stack } from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { DefaultWorkspaceProps, showSnackbar, useConfig, useSession } from '@openmrs/esm-framework';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { mutate } from 'swr';
import { z } from 'zod';
import { Autosuggest } from '../../autosuggest/autosuggest.component';
import { ConfigObject } from '../../config-schema';
import { createRelationship, fetchPerson, peerFormSchema } from '../peer-calendar.resources';
import styles from './peer-form.scss';

interface PeerFormProps extends DefaultWorkspaceProps {}

type PeerFormType = z.infer<typeof peerFormSchema>;

const PeerForm: React.FC<PeerFormProps> = ({ closeWorkspace }) => {
  const { t } = useTranslation();
  const {
    user: { person: peerEducatorPerson },
  } = useSession();
  const { peerEducatorRelationship, kvpProgramUuid } = useConfig<ConfigObject>();
  const form = useForm<PeerFormType>({
    defaultValues: {
      personA: peerEducatorPerson.uuid,
      relationshipType: peerEducatorRelationship,
    },
    resolver: zodResolver(peerFormSchema),
  });

  const onSubmit = async (values: PeerFormType) => {
    try {
      await createRelationship(values);
      closeWorkspace();
      showSnackbar({ title: 'Success', subtitle: 'Peer added succesfully!', kind: 'success' });
      mutate((key) => {
        return typeof key === 'string' && key.startsWith('/ws/rest/v1/relationship');
      });
    } catch (error) {
      showSnackbar({ title: 'Success', subtitle: 'Failure adding peer !' + JSON.stringify(error), kind: 'error' });
    }
  };

  const searchPatient = async (query: string) => {
    const abortController = new AbortController();
    return await fetchPerson(query, abortController, kvpProgramUuid);
  };
  return (
    <Form onSubmit={form.handleSubmit(onSubmit)}>
      <Stack gap={4} className={styles.grid}>
        <Column>
          <Controller
            control={form.control}
            name="personB"
            render={({ field }) => (
              <Autosuggest
                className={styles.input}
                labelText={t('peer', 'Peer')}
                placeholder={t('patientPlaceHolder', 'Search patient')}
                invalid={Boolean(form.formState.errors[field.name]?.message)}
                invalidText={form.formState.errors[field.name]?.message}
                getDisplayValue={(item) => item.display}
                getFieldValue={(item) => item.uuid}
                getSearchResults={searchPatient}
                onClear={() => field.onChange('')}
                onSuggestionSelected={(field_, value) => {
                  if (value) {
                    field.onChange(value);
                  }
                }}
              />
            )}
          />
        </Column>
        <Column>
          <Controller
            control={form.control}
            name="relationshipType"
            render={({ field }) => (
              <Dropdown
                ref={field.ref}
                invalid={form.formState.errors[field.name]?.message}
                invalidText={form.formState.errors[field.name]?.message}
                id="relationship"
                titleText={t('relationshipType', 'RelationshipbType')}
                onChange={(e) => {
                  field.onChange(e.selectedItem);
                }}
                initialSelectedItem={field.value}
                label="Choose option"
                items={[field.value]}
                itemToString={(item) =>
                  [{ label: 'Peer Educator/Peer', value: peerEducatorRelationship }].find((r) => r.value === item)
                    ?.label ?? ''
                }
              />
            )}
          />
        </Column>
        <Column>
          <Controller
            control={form.control}
            name="personA"
            render={({ field }) => (
              <Dropdown
                ref={field.ref}
                invalid={form.formState.errors[field.name]?.message}
                invalidText={form.formState.errors[field.name]?.message}
                id="peerEducator"
                titleText={t('peerEducator', 'Peer Educator')}
                onChange={(e) => {
                  field.onChange(e.selectedItem);
                }}
                initialSelectedItem={field.value}
                label="Choose option"
                items={[field.value]}
                itemToString={(item) =>
                  [{ label: peerEducatorPerson.display, value: peerEducatorPerson.uuid }].find((r) => r.value === item)
                    ?.label ?? ''
                }
              />
            )}
          />
        </Column>
        <Column>
          <Controller
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                dateFormat="d/m/Y"
                id="startDate"
                datePickerType="single"
                invalid={form.formState.errors[field.name]?.message}
                invalidText={form.formState.errors[field.name]?.message}>
                <DatePickerInput
                  invalid={form.formState.errors[field.name]?.message}
                  invalidText={form.formState.errors[field.name]?.message}
                  placeholder="mm/dd/yyyy"
                  labelText={t('startDate', 'Start Date')}
                  size={'xl'}
                />
              </DatePicker>
            )}
          />
        </Column>
        <Column>
          <Controller
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                dateFormat="d/m/Y"
                id="endDate"
                datePickerType="single"
                invalid={form.formState.errors[field.name]?.message}
                invalidText={form.formState.errors[field.name]?.message}>
                <DatePickerInput
                  invalid={form.formState.errors[field.name]?.message}
                  invalidText={form.formState.errors[field.name]?.message}
                  placeholder="mm/dd/yyyy"
                  labelText={t('endDate', 'End Date')}
                  size="xl"
                />
              </DatePicker>
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
  );
};

export default PeerForm;
