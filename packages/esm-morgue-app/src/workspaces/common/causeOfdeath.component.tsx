import React, { useMemo, useState } from 'react';
import fuzzy from 'fuzzy';
import { useTranslation } from 'react-i18next';
import { FilterableMultiSelect, Search, StructuredListSkeleton, Tag, TextInput } from '@carbon/react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCausesOfDeath } from '../../hook/useMorgue.resource';
import { EmptyState } from '@openmrs/esm-patient-common-lib';
import styles from './causeOfdeath.scss';

const CauseOfDeath: React.FC = () => {
  const { t } = useTranslation();
  const { causesOfDeath, isLoading: isLoadingCausesOfDeath } = useCausesOfDeath();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCausesOfDeath = useMemo(() => {
    if (!searchTerm) {
      return causesOfDeath;
    }
    return fuzzy
      .filter(searchTerm, causesOfDeath, {
        extract: (causeOfDeathConcept) => causeOfDeathConcept.display,
      })
      .map((result) => result.original);
  }, [searchTerm, causesOfDeath]);

  const schema = z.object({
    causeOfDeath: z
      .array(z.string())
      .nonempty({ message: t('causeOfDeathIsRequired', 'Please select the cause of death') }),
    nonCodedCauseOfDeath: z.string().optional(),
  });

  const {
    control,
    watch,
    formState: { errors },
  } = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(schema),
    defaultValues: {
      causeOfDeath: [],
      nonCodedCauseOfDeath: '',
    },
  });

  const causeOfDeathValue = watch('causeOfDeath');

  return (
    <section>
      <div className={styles.conceptAnswerOverviewWrapper}>
        {isLoadingCausesOfDeath ? <StructuredListSkeleton /> : null}

        {causesOfDeath?.length ? (
          <>
            <Controller
              name="causeOfDeath"
              control={control}
              render={({ field: { onChange, value } }) => (
                <>
                  <div className={styles.selectedTags}>
                    {value.map((item, index) => (
                      <Tag key={index} type="high-contrast">
                        {causesOfDeath.find((cause) => cause.uuid === item)?.display || ''}
                      </Tag>
                    ))}
                  </div>
                  <FilterableMultiSelect
                    id="causeOfDeathSelect"
                    titleText={t('selectCauseOfDeath', 'Select Cause of Death')}
                    placeholder={t('searchForCauseOfDeath', 'Search for a cause of death')}
                    items={filteredCausesOfDeath.map(({ uuid, display }) => ({
                      id: uuid,
                      text: display,
                    }))}
                    itemToString={(item) => (item ? item.text : '')}
                    onChange={({ selectedItems }) => onChange(selectedItems.map((item) => item.id))}
                  />
                </>
              )}
            />
          </>
        ) : (
          !isLoadingCausesOfDeath && (
            <EmptyState
              displayText={t('causeOfDeath_lower', 'cause of death concepts configured in the system')}
              headerTitle={t('causeOfDeath', 'Cause of death')}
            />
          )
        )}
      </div>
      {errors?.causeOfDeath && <p className={styles.errorMessage}>{errors.causeOfDeath.message}</p>}
      {causeOfDeathValue.includes('freeTextFieldConceptUuid') && (
        <div className={styles.nonCodedCauseOfDeath}>
          <Controller
            name="nonCodedCauseOfDeath"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextInput
                id="freeTextCauseOfDeath"
                invalid={!!errors?.nonCodedCauseOfDeath}
                invalidText={errors?.nonCodedCauseOfDeath?.message}
                labelText={t('nonCodedCauseOfDeath', 'Non-coded cause of death')}
                onChange={onChange}
                placeholder={t('enterNonCodedCauseOfDeath', 'Enter non-coded cause of death')}
                value={value}
              />
            )}
          />
        </div>
      )}
    </section>
  );
};

export default CauseOfDeath;
