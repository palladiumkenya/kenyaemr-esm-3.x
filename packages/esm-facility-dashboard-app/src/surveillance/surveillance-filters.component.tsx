import { DatePicker, DatePickerInput, Dropdown } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SurveillanceindicatorsFilter } from '../types';
import styles from './surveillance.scss';

type Props = {
  filters: SurveillanceindicatorsFilter;
  onFiltersChange?: (filters: SurveillanceindicatorsFilter) => void;
};
const SurveillanceFilters: React.FC<Props> = ({ filters, onFiltersChange }) => {
  const { t } = useTranslation();
  const reportingPeriods = [{ label: 'Last 1 week view' }];
  const indicators = [
    { key: 'getHivPositiveNotLinked', label: 'HIV +ve not linked' },
    { key: 'getPregnantPostpartumNotInPrep', label: 'High risk +ve PBFW not on PrEP' },
    { key: 'getEligibleForVlSampleNotTaken', label: 'Delayed EAC' },
    { key: 'getVirallyUnsuppressedWithoutEAC', label: 'Missed opportunity VL' },
    { key: 'getHeiSixToEightWeeksWithoutPCRResults', label: 'DNA-PCR Pending' },
    { key: 'getHei24MonthsWithoutDocumentedOutcome', label: 'HEI Final Outcomes' },
  ];
  return (
    <div className={styles.filtersContainer}>
      <DatePicker datePickerType="range">
        <DatePickerInput id="date-picker-input-id-start" placeholder="mm/dd/yyyy" labelText="Start date" size="md" />
        <DatePickerInput id="date-picker-input-id-finish" placeholder="mm/dd/yyyy" labelText="End date" size="md" />
      </DatePicker>
      <Dropdown
        className={styles.filterInput}
        autoAlign
        id="filters"
        itemToString={(item) => item?.label ?? ''}
        items={reportingPeriods}
        selectedItem={reportingPeriods[0]}
        label={t('reportingPeriod', 'Reporting Period')}
      />
      <Dropdown
        className={styles.filterInput}
        autoAlign
        id="filters"
        itemToString={(item: { key: string; label: string }) =>
          indicators.find(({ key }) => key === item.key)?.label ?? ''
        }
        items={indicators}
        selectedItem={indicators.find(({ key }) => key === filters.indicator)}
        label={t('indicator', 'Indicator')}
        onChange={({ selectedItem: { key } }) => {
          onFiltersChange({ ...filters, indicator: key });
        }}
      />
    </div>
  );
};

export default SurveillanceFilters;
