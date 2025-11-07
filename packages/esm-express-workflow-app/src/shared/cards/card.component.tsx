import React from 'react';
import styles from './card.scss';

type CardProps = {
  title: string;
  total: number | string;
  categories?: Array<{ label: string; value: number }>;
};

const Card: React.FC<CardProps> = ({ title, total, categories }) => {
  return (
    <div className={styles.card}>
      <div className={styles.cardInner}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
        </div>
        <div className={styles.content}>
          <div className={styles.totalSection}>
            <div className={styles.totalLabel}>Total</div>
            <div className={styles.total}>{total}</div>
          </div>
          {categories && categories.length > 0 && <div className={styles.divider} />}
          {categories && categories.length > 0 && (
            <div className={styles.categoriesSection}>
              {categories.map((category, index) => (
                <div key={index} className={styles.category}>
                  <div className={styles.categoryValue}>{category.value}</div>
                  <div className={styles.categoryLabel}>{category.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;
