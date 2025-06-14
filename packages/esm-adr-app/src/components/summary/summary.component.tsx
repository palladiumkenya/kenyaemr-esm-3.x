import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';

import styles from './summary.scss';
import AdrEncounter from '../encounters/adr-encounter.component';
import { useTranslation } from 'react-i18next';
import { useAdrAssessmentEncounter } from '../encounters/encounter.resource';
import { DataTableSkeleton, DatePicker, DatePickerInput } from '@carbon/react';

type SummaryProps = {};

const Summary: React.FC<SummaryProps> = () => {
  const { t } = useTranslation();
  const defaultDateRange: [Date, Date] = [dayjs().startOf('day').toDate(), dayjs().endOf('day').toDate()];
  const [dateRange, setDateRange] = useState<[Date, Date]>(defaultDateRange);
  const formattedStartDate = dayjs(dateRange[0]).startOf('day').format('YYYY-MM-DDTHH:mm:ss');
  const formattedEndDate = dayjs(dateRange[1]).endOf('day').format('YYYY-MM-DDTHH:mm:ss');
  const { encounters, isLoading } = useAdrAssessmentEncounter(formattedStartDate, formattedEndDate);
  const [counts, setCounts] = useState({
    assessment: 0,
  });

  const handleDateRangeChange = ([start, end]: Array<Date>) => {
    if (start && end) {
      setDateRange([start, end]);
    }
  };

  useEffect(() => {
    const adrAssessmentCount = encounters.filter(
      (encounter) => encounter.encounterTypeUuid === 'd18d6d8a-4be2-4115-ac7e-86cc0ec2b263',
    ).length;

    setCounts({
      assessment: adrAssessmentCount,
    });
  }, [encounters]);

  if (isLoading) {
    return (
      <div className={styles.loaderContainer}>
        <DataTableSkeleton showHeader={false} showToolbar={false} zebra />
      </div>
    );
  }

  return (
    <>
      <div className={styles.filterContainer}>
        <DatePicker
          maxDate={new Date()}
          datePickerType="range"
          className={styles.dateRangePicker}
          value={[...dateRange]}
          onChange={handleDateRangeChange}>
          <DatePickerInput
            id="date-picker-input-id-start"
            placeholder="mm/dd/yyyy"
            labelText={t('startDate', 'Start date')}
            size="md"
          />
          <DatePickerInput
            id="date-picker-input-id-finish"
            placeholder="mm/dd/yyyy"
            labelText={t('endDate', 'End date')}
            size="md"
          />
        </DatePicker>
      </div>
      <div className={styles.summaryContainer}>
        <div className={styles.summaryCard}>
          <h4>{t('adrAssessment', 'ADR Assessment')}</h4>
          <div>
            <h6>{t('totalAdrAssessment', 'Total ADR assessment')}</h6>
            <p>{counts.assessment}</p>
          </div>
        </div>
      </div>
      <AdrEncounter encounters={encounters} />
    </>
  );
};

export default Summary;
