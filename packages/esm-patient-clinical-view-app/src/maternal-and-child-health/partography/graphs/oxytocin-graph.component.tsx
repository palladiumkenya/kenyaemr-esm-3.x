import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../partography.scss';

export interface OxytocinData {
  timeSlot: string;
  oxytocinUsed: 'yes' | 'no';
  dropsPerMinute: number;
}

interface OxytocinGraphProps {
  data: OxytocinData[];
}

const OxytocinGraph: React.FC<OxytocinGraphProps> = ({ data }) => {
  const { t } = useTranslation();

  const getTimeColumns = () => {
    const emptyColumns = Array.from({ length: 13 }, (_, i) => `grid-${i + 1}`);
    if (data.length === 0) {
      return emptyColumns;
    }
    const dataTimeSlots = [...new Set(data.map((item) => item.timeSlot))].sort();
    if (dataTimeSlots.length <= 13) {
      const remainingEmpty = Array.from({ length: 13 - dataTimeSlots.length }, (_, i) => `empty-${i + 1}`);
      return [...dataTimeSlots, ...remainingEmpty];
    }
    return dataTimeSlots;
  };

  const timeColumns = getTimeColumns();

  const rows = [
    { id: 'oxytocin', label: t('oxytocin', 'Oxytocin') },
    { id: 'drops', label: t('dropsPerMinute', 'Drops per minute') },
  ];

  const getDataForTimeSlot = (timeSlot: string): OxytocinData | undefined => {
    if (timeSlot.startsWith('grid-') || timeSlot.startsWith('empty-')) {
      return undefined;
    }
    return data.find((item) => item.timeSlot === timeSlot);
  };

  const getCellContent = (rowId: string, timeSlot: string) => {
    const dataPoint = getDataForTimeSlot(timeSlot);

    if (rowId === 'oxytocin') {
      return dataPoint?.oxytocinUsed === 'yes' ? '✅' : '';
    }

    if (rowId === 'drops') {
      return dataPoint?.oxytocinUsed === 'yes' ? dataPoint.dropsPerMinute.toString() : '';
    }

    return '';
  };

  const getCellClass = (rowId: string, timeSlot: string): string => {
    const dataPoint = getDataForTimeSlot(timeSlot);
    if (!dataPoint || dataPoint.oxytocinUsed === 'no') {
      return '';
    }

    if (rowId === 'drops') {
      const drops = dataPoint.dropsPerMinute;
      if (drops >= 40) {
        return 'oxytocinBarHigh';
      }
      if (drops >= 20) {
        return 'oxytocinBarMedium';
      }
      if (drops > 0) {
        return 'oxytocinBarLow';
      }
    }

    return '';
  };

  return (
    <div className={styles.membraneGrid}>
      <div className={styles.gridContainer}>
        <div className={styles.gridHeader}>
          <div className={styles.gridCell}>{t('time', 'Time')}</div>
          {timeColumns.map((timeColumn) => (
            <div key={timeColumn} className={styles.gridCell}>
              {timeColumn.startsWith('grid-') || timeColumn.startsWith('empty-') ? '' : timeColumn}
            </div>
          ))}
        </div>

        {rows.map((row) => (
          <div key={row.id} className={styles.gridRow}>
            <div className={styles.gridRowLabel}>{row.label}</div>
            {timeColumns.map((timeColumn) => {
              const content = getCellContent(row.id, timeColumn);
              const cellClass = getCellClass(row.id, timeColumn);
              return (
                <div
                  key={`${timeColumn}-${row.id}`}
                  className={`${styles.gridCell} ${cellClass}`}
                  data-time-slot={timeColumn}
                  data-row={row.id}
                  title={`${timeColumn}: ${content || 'No data'}`}>
                  {content && (
                    <span
                      style={{
                        fontWeight: 'bold',
                        fontSize: row.id === 'oxytocin' ? '16px' : '14px',
                        color: cellClass.includes('High') ? 'white' : 'inherit',
                      }}>
                      {content}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OxytocinGraph;
