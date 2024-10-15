import { Column, Dropdown } from '@carbon/react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ReportingPeriod } from '../../types';
import { getAllMonthsInYear, getYearsAroundCurrentYear } from '../peer-calendar.resources';
import styles from './peer-calendar-header.scss';

type ReportingPeriodInputProps = {
  reportigPeriod: Partial<ReportingPeriod>;
  onReportingPeriodChange: React.Dispatch<React.SetStateAction<ReportingPeriod>>;
};

const ReportingPeriodInput: React.FC<ReportingPeriodInputProps> = ({
  onReportingPeriodChange: setReportingPeriod,
  reportigPeriod,
}) => {
  const { t } = useTranslation();
  const months = useMemo(() => getAllMonthsInYear(), []);
  const years = useMemo(() => getYearsAroundCurrentYear(), []);
  return (
    <div className={styles.reportingPeriod}>
      <Column className={styles.reportingPeriodInput}>Select Period:</Column>
      <Column className={styles.reportingPeriodInput}>
        <Dropdown
          type="inline"
          id="reportingMonth"
          autoAlign={true}
          onChange={(e) => {
            setReportingPeriod((state) => ({ ...state, month: e.selectedItem }));
          }}
          initialSelectedItem={reportigPeriod?.month}
          label={t('reportingMonth', 'Month')}
          items={months.map((r) => r.index)}
          itemToString={(item) => months.find((r) => r.index === item)?.name ?? ''}
        />
      </Column>
      <Column className={styles.reportingPeriodInput}>
        <Dropdown
          type="inline"
          autoAlign={true}
          id="reportingYear"
          onChange={(e) => {
            setReportingPeriod((state) => ({ ...state, year: e.selectedItem }));
          }}
          initialSelectedItem={reportigPeriod?.year}
          label={t('reportingYear', 'Year')}
          items={years.map((r) => r)}
          itemToString={(item) => years.find((r) => r === item) ?? ''}
        />
      </Column>
    </div>
  );
};

export default ReportingPeriodInput;
