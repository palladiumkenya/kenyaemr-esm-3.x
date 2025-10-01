import React, { useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { MultiSelect } from '@carbon/react';
import {
  PageHeader,
  PageHeaderContent,
  AppointmentsPictogram,
  OpenmrsDatePicker,
  ExtensionSlot,
} from '@openmrs/esm-framework';
import styles from './home-header.scss';

interface HomeHeaderProps {
  title: string;
  onDateChange?: (startDate: string, endDate: string) => void;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ title, onDateChange }) => {
  const { t } = useTranslation();
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = React.useState(today);
  const [endDate, setEndDate] = React.useState(today);

  const handleDateChange = (type: 'start' | 'end', date: string) => {
    if (type === 'start') {
      setStartDate(date);
      onDateChange?.(date, endDate);
    } else {
      setEndDate(date);
      onDateChange?.(startDate, date);
    }
  };

  return (
    <>
      <PageHeader className={styles.header} data-testid="home-header">
        <PageHeaderContent illustration={<AppointmentsPictogram />} title={title} />
        <ExtensionSlot name="provider-banner-info-slot" />
      </PageHeader>
      <div className={styles.dateFilters}>
        <div className={styles.dateInput}>
          <OpenmrsDatePicker
            id="start-date"
            labelText="Start Date"
            value={startDate}
            onChange={(date) =>
              handleDateChange('start', typeof date === 'string' ? date : date.toISOString().split('T')[0])
            }
          />
        </div>
        <div className={styles.dateInput}>
          <OpenmrsDatePicker
            id="end-date"
            labelText="End Date"
            value={endDate}
            onChange={(date) =>
              handleDateChange('end', typeof date === 'string' ? date : date.toISOString().split('T')[0])
            }
          />
        </div>
      </div>
    </>
  );
};

export default HomeHeader;
