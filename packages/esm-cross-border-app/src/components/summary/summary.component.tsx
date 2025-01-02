import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';

import styles from './summary.scss';
import Encounter from '../encounters/encounter.component';
import { useTranslation } from 'react-i18next';
import { useCrossBorderEncounter } from '../encounters/encounter.resource';
import { DataTableSkeleton, DatePicker, DatePickerInput } from '@carbon/react';

type SummaryProps = {};

const Summary: React.FC<SummaryProps> = () => {
  const { t } = useTranslation();
  const defaultDateRange: [Date, Date] = [dayjs().startOf('day').toDate(), dayjs().endOf('day').toDate()];
  const [dateRange, setDateRange] = useState<[Date, Date]>(defaultDateRange);
  const formattedStartDate = dayjs(dateRange[0]).startOf('day').format('YYYY-MM-DDTHH:mm:ss');
  const formattedEndDate = dayjs(dateRange[1]).endOf('day').format('YYYY-MM-DDTHH:mm:ss');
  const { encounters, isLoading } = useCrossBorderEncounter(formattedStartDate, formattedEndDate);
  const [counts, setCounts] = useState({
    screening: 0,
    referral: 0,
  });

  const handleDateRangeChange = ([start, end]: Array<Date>) => {
    if (start && end) {
      setDateRange([start, end]);
    }
  };

  useEffect(() => {
    const screeningCount = encounters.filter(
      (encounter) => encounter.encounterTypeUuid === '6536A8A3-7B77-414D-A0F0-E08A7178FF0F',
    ).length;

    const referralCount = encounters.filter(
      (encounter) => encounter.encounterTypeUuid === '5C6DA02B-51E8-4B3D-BB67-BE8F75C4CCE1',
    ).length;

    setCounts({
      screening: screeningCount,
      referral: referralCount,
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
          <h4>{t('screening', 'Screening')}</h4>
          <div>
            <h6>{t('totalCrossBorderScreening', 'Total cross border screening')}</h6>
            <p>{counts.screening}</p>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <h4>{t('referral', 'Referral')}</h4>
          <div>
            <h6>{t('totalCrossBorderReferral', 'Total cross border referral')}</h6>
            <p>{counts.referral}</p>
          </div>
        </div>
      </div>
      <Encounter encounters={encounters} />
    </>
  );
};

export default Summary;
