import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../partography.scss';

export interface DrugsIVFluidsData {
  drugName: string;
  dosage: string;
  index?: number;
}

interface DrugsIVFluidsGraphProps {
  data: DrugsIVFluidsData[];
}
const DrugsIVFluidsGraph: React.FC<DrugsIVFluidsGraphProps> = ({ data }) => {
  const { t } = useTranslation();
  const getColumns = () => {
    const emptyColumns = Array.from({ length: 13 }, (_, i) => `grid-${i + 1}`);

    if (data.length === 0) {
      return emptyColumns;
    }
    if (data.length <= 13) {
      const dataColumns = data.map((_, index) => `data-${index}`);
      const remainingEmpty = Array.from({ length: 13 - data.length }, (_, i) => `empty-${i + 1}`);
      return [...dataColumns, ...remainingEmpty];
    }
    return data.map((_, index) => `data-${index}`);
  };

  const columns = getColumns();
  const rows = [
    { id: 'drugs', label: t('drugName', 'Drug Name') },
    { id: 'dosage', label: t('dosage', 'Dosage') },
  ];

  const getDataForColumn = (column: string): DrugsIVFluidsData | undefined => {
    if (column.startsWith('grid-') || column.startsWith('empty-')) {
      return undefined;
    }
    const index = parseInt(column.replace('data-', ''));
    return data[index];
  };
  const getCellContent = (column: string, rowId: string) => {
    const dataItem = getDataForColumn(column);

    if (!dataItem) {
      return '';
    }

    if (rowId === 'drugs') {
      return dataItem.drugName;
    } else if (rowId === 'dosage') {
      return dataItem.dosage;
    }

    return '';
  };
  return (
    <div className={styles.drugsIVFluidsGraph}>
      <div className={styles.membraneGrid}>
        <div className={styles.gridContainer}>
          {rows.map((row) => (
            <div key={row.id} className={styles.gridRow}>
              <div className={styles.gridRowLabel}>{row.label}</div>
              {columns.map((column) => (
                <div
                  key={`${row.id}-${column}`}
                  className={`${styles.gridCell} ${styles.drugsCell}`}
                  data-column={column}
                  data-row={row.id}>
                  {getCellContent(column, row.id)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DrugsIVFluidsGraph;
