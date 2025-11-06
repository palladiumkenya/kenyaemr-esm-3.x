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
    const emptyColumns = Array.from({ length: 20 }, (_, i) => `grid-${i + 1}`);

    if (data && data.length > 0) {
      const dataSlots = data.map((item, i) => `data-${i + 1}`);
      const remainingEmpty = Array.from({ length: 20 - data.length }, (_, i) => `empty-${i + 1}`);
      return [...dataSlots, ...remainingEmpty];
    }

    return emptyColumns;
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
    <div
      className={styles.membraneGrid}
      style={{ marginTop: 0, maxHeight: 'fit-content', minHeight: 'auto', marginBottom: 0 }}>
      <div className={styles.gridContainer} style={{ padding: '0' }}>
        {rows.map((row) => (
          <div key={row.id} className={styles.gridRow} style={{ minHeight: 40 }}>
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
                  title={`${timeColumn}: ${content || 'No data'}`}
                  style={{
                    minHeight: 40,
                    padding: '8px 4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
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
