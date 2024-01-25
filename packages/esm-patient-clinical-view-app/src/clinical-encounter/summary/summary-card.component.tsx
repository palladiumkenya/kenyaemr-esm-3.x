import React from 'react';
import styles from './summary-card.scss';
type SummaryCardProps = {
  title: string;
  value: string | any;
};

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value }) => {
  const displayValue = value === '' ? '--' : value;
  return (
    <div className={styles.cardContainer}>
      <span className={styles.title}>{title}</span>
      <p className={styles.value}>{typeof displayValue === 'string' ? displayValue : <>{displayValue}</>}</p>
    </div>
  );
};

export default SummaryCard;
