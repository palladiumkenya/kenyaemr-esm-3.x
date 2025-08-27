import React from 'react';
import styles from './card.scss';

type CardProps = {
  title: string;
  value: string;
};

const Card: React.FC<CardProps> = ({ title, value }) => {
  return (
    <div className={styles.card}>
      <div className={styles.title}>{title}</div>
      <div className={styles.value}>{value}</div>
    </div>
  );
};

export default Card;
