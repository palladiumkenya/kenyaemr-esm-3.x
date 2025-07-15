import React, { useEffect, useMemo } from 'react';
import {
  type DefaultWorkspaceProps,
  ResponsiveWrapper,
  useLayoutType,
  showSnackbar,
  useConfig,
  restBaseUrl,
} from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { Controller, useForm } from 'react-hook-form';
import {
  ButtonSet,
  Button,
  InlineLoading,
  TextInput,
  FormGroup,
  Stack,
  Form,
  FilterableMultiSelect,
} from '@carbon/react';
import classNames from 'classnames';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import styles from './add-location.workspace.scss';
import { type LocationResponse } from '../../types';
import { extractErrorMessagesFromResponse } from '../../helpers';
import { useLocationTags } from '../../hooks/useLocationTags';
import { mutate } from 'swr';
import { saveOrUpdateLocation } from '../../hooks/useLocation';

type AddLocationWorkspaceProps = DefaultWorkspaceProps & {
  location?: LocationResponse;
};

const locationFormSchema = z.object({
  name: z.string().min(1, { message: 'Location name is required' }),
  tags: z
    .object({
      uuid: z.string().uuid(),
      display: z.string(),
    })
    .array()
    .nonempty('At least one tag is required'),
});

type LocationFormType = z.infer<typeof locationFormSchema>;

const AddLocationWorkspace: React.FC<AddLocationWorkspaceProps> = ({
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  promptBeforeClosing,
  location,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { locationTagList: Tags } = useLocationTags();

  const hasLocationAttributes = useMemo(() => {
    return location?.attributes && location.attributes.length > 0;
  }, [location?.attributes]);

  const handleMutation = () => {
    const url = `${restBaseUrl}/location`;
    mutate((key) => typeof key === 'string' && key.startsWith(url), undefined, { revalidate: true });
  };

  const {
    handleSubmit,
    control,
    getValues,
    formState: { isSubmitting, isDirty, errors },
  } = useForm<LocationFormType>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      name: location?.name || '',
      tags: location?.tags || [],
    },
  });

  const onSubmit = async (data: LocationFormType) => {
    const formDataFormSubmission = getValues();

    const locationTagsUuid = formDataFormSubmission?.tags?.map((tag) => tag.uuid) || [];

    const locationPayload = {
      name: formDataFormSubmission.name,
      tags: locationTagsUuid,
    };

    try {
      await saveOrUpdateLocation(locationPayload, location?.uuid);

      showSnackbar({
        title: t('success', 'Success'),
        kind: 'success',
        subtitle: location?.uuid
          ? t('locationUpdated', 'Location {{locationName}} was updated successfully.', {
              locationName: data.name,
            })
          : t('locationCreated', 'Location {{locationName}} was created successfully.', {
              locationName: data.name,
            }),
      });
      handleMutation();
      closeWorkspaceWithSavedChanges();
    } catch (error: any) {
      const errorMessages = extractErrorMessagesFromResponse(error);
      showSnackbar({
        title: t('error', 'Error'),
        kind: 'error',
        subtitle: errorMessages.join(', ') || t('locationSaveError', 'Error saving location'),
      });
    }
  };

  useEffect(() => {
    promptBeforeClosing(() => isDirty);
  }, [isDirty, promptBeforeClosing]);

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.formContainer}>
        <Stack gap={3}>
          <ResponsiveWrapper>
            <FormGroup legendText="">
              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <TextInput
                    id="locationName"
                    placeholder={t('locationPlaceholder', 'Add a location')}
                    labelText={t('locationName', 'Location Name')}
                    value={field.value}
                    onChange={field.onChange}
                    invalid={!!errors.name?.message}
                    invalidText={errors.name?.message}
                    disabled={hasLocationAttributes}
                  />
                )}
              />
            </FormGroup>
          </ResponsiveWrapper>

          <ResponsiveWrapper>
            <FormGroup legendText="">
              <Controller
                control={control}
                name="tags"
                render={({ field: { onChange, value, ref } }) => (
                  <FilterableMultiSelect
                    id="locationTags"
                    titleText={t('selectTags', 'Select tag(s)')}
                    placeholder={t('selectTagPlaceholder', 'Select a tag')}
                    items={Tags || []}
                    selectedItems={(value || []).map(
                      (selected) => Tags?.find((tag) => tag.uuid === selected.uuid) || selected,
                    )}
                    onChange={({ selectedItems }) => onChange(selectedItems || [])}
                    itemToString={(item) => (item && typeof item === 'object' ? item.display : '')}
                    selectionFeedback="top-after-reopen"
                    invalid={!!errors.tags?.message}
                    invalidText={errors.tags?.message}
                    disabled={!Tags?.length}
                    ref={ref}
                  />
                )}
              />
            </FormGroup>
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

export default AddLocationWorkspace;
