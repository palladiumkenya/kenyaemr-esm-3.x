import { Tile } from '@carbon/react';
import { StopFilledAlt } from '@carbon/react/icons';
import React from 'react';
import styles from './summary-card.scss';
import { type IndicationMode } from '../../types';

type Props = {
  title: string;
  value?: string;
  header?: string;
  mode?: IndicationMode;
  percentage?: string;
};

const SummaryCard: React.FC<Props> = ({ title, value, header, mode, percentage }) => {
  return (
    <Tile className={styles.summaryCard}>
      <span className={styles.indications}>
        <StopFilledAlt
          className={mode === 'increasing' ? styles.upIcon : mode === 'decreasing' ? styles.downIcon : undefined}
          size={30}
        />
      </span>
      {header && <strong>{header}</strong>}
      <span className={styles.valueAndPercentageRow}>
        <h4 className={styles.summaryValue}>{value ?? '--'}</h4>
        {percentage && <span className={styles.percentage}>{`(${percentage})`}</span>}
      </span>
      <p>{title}</p>
    </Tile>
  );
};

export default SummaryCard;
