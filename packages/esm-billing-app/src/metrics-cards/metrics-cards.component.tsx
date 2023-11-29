import React from 'react';
import Card from './card.component';
import styles from './metrics-cards.scss';

export default function MetricsCards() {
  const cards = [
    { title: 'Cumulative Bills', count: 0 },
    { title: 'Pending Bills', count: 0 },
    { title: 'Fulfilled Bills', count: 0 },
  ];

  return (
    <section className={styles.container}>
      {cards.map((card) => (
        <Card key={card.title} title={card.title} count={card.count} />
      ))}
    </section>
  );
}
