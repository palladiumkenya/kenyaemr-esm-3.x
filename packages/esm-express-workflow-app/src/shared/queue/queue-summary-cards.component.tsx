import React from 'react';
import Card from '../cards/card.component';
import styles from './queue-tab.scss';

export type QueueSummaryCard = {
  title: string;
  value: string;
  categories?: Array<{ label: string; value: number; onClick?: () => void }>;
  onClick?: () => void;
  refreshButton?: React.ReactNode;
};

interface QueueSummaryCardsProps {
  cards?: Array<QueueSummaryCard>;
}

const QueueSummaryCards: React.FC<QueueSummaryCardsProps> = ({ cards }) => (
  <div className={styles.cards}>
    {cards?.map((card) => (
      <Card
        key={card.title}
        title={card.title}
        total={card.value}
        categories={card.categories}
        onClick={card.onClick}
        refreshButton={card.refreshButton}
      />
    ))}
  </div>
);

export default QueueSummaryCards;
