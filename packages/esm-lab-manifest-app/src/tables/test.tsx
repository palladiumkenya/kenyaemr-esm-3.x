import React, { useState } from 'react';
import styles from './lab-manifest-table.scss';
import { useTranslation } from 'react-i18next';
import { HomePictogram, PageHeader } from '@openmrs/esm-framework';
import dayjs from 'dayjs';

const Test: React.FC = () => {
  const { t } = useTranslation();
  const defaultDateRange: [Date, Date] = [dayjs().startOf('day').toDate(), dayjs().endOf('day').toDate()];
  const [dateRange, setDateRange] = useState<[Date, Date]>(defaultDateRange);
  //   const formattedStartDate = dayjs(dateRange[0]).startOf('day').format('YYYY-MM-DDTHH:mm:ss');
  //   const formattedEndDate = dayjs(dateRange[1]).endOf('day').format('YYYY-MM-DDTHH:mm:ss');
  //   const { encounters, isLoading } = useCrossBorderEncounter(formattedStartDate, formattedEndDate);
  //   const [counts, setCounts] = useState({
  //     screening: 0,
  //     referral: 0,
  //   });

  //   const handleDateRangeChange = ([start, end]: Array<Date>) => {
  //     if (start && end) {
  //       setDateRange([start, end]);
  //     }
  //   };

  //   useEffect(() => {
  //     const screeningCount = encounters.filter(
  //       (encounter) => encounter.encounterTypeUuid === '6536A8A3-7B77-414D-A0F0-E08A7178FF0F',
  //     ).length;

  //     const referralCount = encounters.filter(
  //       (encounter) => encounter.encounterTypeUuid === '5C6DA02B-51E8-4B3D-BB67-BE8F75C4CCE1',
  //     ).length;

  //     setCounts({
  //       screening: screeningCount,
  //       referral: referralCount,
  //     });
  //   }, [encounters]);

  //   if (isLoading) {
  //     return (
  //       <div className={styles.loaderContainer}>
  //         <DataTableSkeleton showHeader={false} showToolbar={false} zebra />
  //       </div>
  //     );
  //   }

  return (
    <>
      <div className={styles.filterContainer}></div>
      <div className={styles.summaryContainer}>
        <div className={styles.summaryCard}>
          <h4>{t('screening', 'Screening')}</h4>
          <div>
            <h6>{t('totalCrossBorderScreening', 'Total cross border screening')}</h6>
            <p>{12}</p>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <h4>{t('referral', 'Referral')}</h4>
          <div>
            <h6>{t('totalCrossBorderReferral', 'Total cross border referral')}</h6>
            <p>{12}</p>
          </div>
        </div>
      </div>
    </>
  );
};
export default Test;
