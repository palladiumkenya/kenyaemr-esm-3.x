import React, { useMemo, useState } from 'react';
import fuzzy from 'fuzzy';
import { useTranslation } from 'react-i18next';
import { ComboBox, RadioButtonGroup, RadioButton, Search, StructuredListSkeleton, TextInput } from '@carbon/react';
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
    causeOfDeath: z.string().nonempty({ message: t('causeOfDeathIsRequired', 'Please select the cause of death') }),
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
      causeOfDeath: '',
      nonCodedCauseOfDeath: '',
    },
  });

  const causeOfDeathValue = watch('causeOfDeath');

  return (
    <section>
      <div className={styles.sectionTitle}>{t('causeOfDeath', 'Cause of death')}</div>
      <div className={styles.conceptAnswerOverviewWrapper}>
        {isLoadingCausesOfDeath ? <StructuredListSkeleton /> : null}

        {causesOfDeath?.length ? (
          <>
            <Search
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={t('searchForCauseOfDeath', 'Search for a cause of death')}
              labelText=""
            />
            <Controller
              name="causeOfDeath"
              control={control}
              render={({ field: { onChange } }) => (
                <RadioButtonGroup className={styles.radioButtonGroup} orientation="vertical" onChange={onChange}>
                  {(filteredCausesOfDeath.length ? filteredCausesOfDeath : causesOfDeath).map(
                    ({ uuid, display, name }) => (
                      <RadioButton
                        key={uuid}
                        className={styles.radioButton}
                        id={name}
                        labelText={display}
                        value={uuid}
                      />
                    ),
                  )}
                </RadioButtonGroup>
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
      {causeOfDeathValue === 'freeTextFieldConceptUuid' && (
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
