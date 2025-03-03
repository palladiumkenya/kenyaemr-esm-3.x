import { Tile } from '@carbon/react';
import { ArrowUp, ArrowDown } from '@carbon/react/icons';
import React from 'react';
import styles from './summary-card.scss';
import { type IndicationMode } from '../../types';

type Props = {
  title: string;
  value?: string;
  header?: string;
  mode?: IndicationMode;
};

const SummaryCard: React.FC<Props> = ({ title, value, header, mode }) => {
  return (
    <Tile className={styles.summaryCard}>
      <span>
        {mode === 'increasing' && <ArrowUp className={styles.upIcon} />}
        {mode === 'decreasing' && <ArrowDown className={styles.downIcon} />}
        {mode === 'increasing' && <ArrowUp className={styles.upIcon} />}
        {mode === 'decreasing' && <ArrowDown className={styles.downIcon} />}
      </span>
      {header && <strong>{header}</strong>}
      <h4>{value ?? '--'}</h4>
      <p>{title}</p>
    </Tile>
  );
};

export default SummaryCard;
