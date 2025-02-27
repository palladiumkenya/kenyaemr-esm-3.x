import { Tile } from '@carbon/react';
import React from 'react';
import styles from './summary-card.scss';

type Props = {
  title: string;
  value?: string;
  header?: string;
};

const SummaryCard: React.FC<Props> = ({ title, value, header }) => {
  return (
    <Tile className={styles.summaryCard}>
      {header && <strong>{header}</strong>}
      <h4>{value ?? '--'}</h4>
      <p>{title}</p>
    </Tile>
  );
};

export default SummaryCard;
