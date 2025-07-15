import { Button, ButtonSet, FilterableMultiSelect, Form, FormGroup, InlineLoading, Stack } from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  type DefaultWorkspaceProps,
  ResponsiveWrapper,
  restBaseUrl,
  showSnackbar,
  useLayoutType,
} from '@openmrs/esm-framework';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { mutate } from 'swr';
import { z } from 'zod';
import { LocationAutosuggest } from '../../auto-suggest/location-autosuggest.component';
import ResultsTile from '../../common/results-tile.component';
import { extractErrorMessagesFromResponse } from '../../helpers';
import { saveOrUpdateLocation } from '../../hooks/useLocation';
import { useLocationTags } from '../../hooks/useLocationTags';
import { LocationResponse } from '../../types';
import styles from './search-location.workspace.scss';

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
    .array(),
});

type LocationFormType = z.infer<typeof locationFormSchema>;

const SearchLocationWorkspace: React.FC<AddLocationWorkspaceProps> = ({
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  promptBeforeClosing,
  location,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { locationTagList: Tags } = useLocationTags();
  const [selectedLocation, setSelectedLocation] = useState<LocationResponse | null>(null);

  const handleMutation = () => {
    const url = `${restBaseUrl}/location`;
    mutate((key) => typeof key === 'string' && key.startsWith(url), undefined, { revalidate: true });
  };

  const {
    handleSubmit,
    control,
    getValues,
    setValue,
    reset,
    formState: { isSubmitting, isDirty, errors },
  } = useForm<LocationFormType>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      name: location?.name || '',
      tags: location?.tags || [],
    },
  });

  const onSubmit = async (data: LocationFormType) => {
    try {
      const locationUuid = selectedLocation?.uuid || location?.uuid;

      const locationTagsUuid = data.tags.map((tag) => tag.uuid);

      const locationPayload = {
        tags: locationTagsUuid,
      };

      await saveOrUpdateLocation(locationUuid, locationPayload);

      showSnackbar({
        title: t('success', 'Success'),
        kind: 'success',
        subtitle: t('locationUpdated', 'Location {{locationName}} was updated successfully.', {
          locationName: selectedLocation?.name || location?.name || data.name,
        }),
      });

      handleMutation();
      closeWorkspaceWithSavedChanges();
    } catch (error: any) {
      console.error('Error saving location:', error);
      const errorMessages = extractErrorMessagesFromResponse(error);
      showSnackbar({
        title: t('error', 'Error'),
        kind: 'error',
        subtitle: errorMessages.join(', ') || t('locationSaveError', 'Error saving location'),
      });
    }
  };

  const handleLocationSelected = (locationUuid: string, locationData: LocationResponse) => {
    setSelectedLocation(locationData);

    setValue('name', locationData.name || '', { shouldDirty: true });

    if (locationData?.tags && locationData.tags.length > 0) {
      const formattedTags = locationData.tags.map((tag) => ({
        uuid: tag.uuid,
        display: tag.display || tag.name || '',
      }));
      if (formattedTags.length > 0) {
        setValue('tags', formattedTags as [(typeof formattedTags)[0], ...typeof formattedTags], { shouldDirty: true });
      }
    } else {
      setValue('tags', [], { shouldDirty: true });
    }
  };

  const handleClearSelection = () => {
    setSelectedLocation(null);
    reset();
  };

  const renderSelectedLocationTile = () => {
    if (!selectedLocation) {
      return null;
    }

    return (
      <div>
        <ResultsTile location={selectedLocation} onClose={handleClearSelection} />
      </div>
    );
  };

  useEffect(() => {
    promptBeforeClosing(() => isDirty);
  }, [isDirty, promptBeforeClosing]);

  const isFormReady = (selectedLocation || location) && isDirty;

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.formContainer}>
        <Stack gap={3}>
          <ResponsiveWrapper>
            <FormGroup legendText="">
              {!selectedLocation ? (
                <LocationAutosuggest
                  onLocationSelected={handleLocationSelected}
                  labelText={t('searchForLocation', 'Search for location')}
                  placeholder={t('searchParentLocation', 'Search for location...')}
                />
              ) : (
                renderSelectedLocationTile()
              )}
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
        <Button className={styles.buttonContainer} disabled={isSubmitting || !isFormReady} kind="primary" type="submit">
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

export default SearchLocationWorkspace;
