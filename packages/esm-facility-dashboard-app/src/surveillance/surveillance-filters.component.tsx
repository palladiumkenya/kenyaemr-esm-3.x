import { DatePicker, DatePickerInput, Dropdown } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SurveillanceindicatorsFilter } from '../types';
import styles from './surveillance.scss';
import { DATE_PICKER_CONTROL_FORMAT, DATE_PICKER_FORMAT, today } from '../constants';
import { formatDatetime } from '@openmrs/esm-framework';

type Props = {
  filters: SurveillanceindicatorsFilter;
  onFiltersChange?: (filters: SurveillanceindicatorsFilter) => void;
  tabSelected?: number;
};
const SurveillanceFilters: React.FC<Props> = ({ filters, onFiltersChange, tabSelected }) => {
  const { t } = useTranslation();
  const MaxDate: Date = today();
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
      {tabSelected === 0 && (
        <DatePicker
          datePickerType="range"
          minDate={formatDatetime(MaxDate)}
          locale="en"
          dateFormat={DATE_PICKER_CONTROL_FORMAT}
          onChange={(dates: Array<Date>) => {
            if (onFiltersChange) {
              onFiltersChange({
                ...filters,
                startdate: dates[0],
                endDate: dates[1],
              });
            }
          }}>
          <DatePickerInput
            id="date-picker-input-id-start"
            placeholder={DATE_PICKER_FORMAT}
            labelText={t('startDate', 'Start date')}
            size="md"
          />
          <DatePickerInput
            id="date-picker-input-id-finish"
            placeholder={DATE_PICKER_FORMAT}
            labelText={t('endDate', 'End date')}
            size="md"
          />
        </DatePicker>
      )}

      {tabSelected === 1 && (
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
      )}
    </div>
  );
};

export default SurveillanceFilters;
