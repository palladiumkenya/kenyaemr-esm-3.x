import React from 'react';
import styles from './card.scss';
import { ConfigurableLink } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from '@carbon/react/icons';
import classNames from 'classnames';

type CardProps = {
  title: string;
  total: number | string;
  onClick?: () => void;
  categories?: Array<{ label: string; value: number; onClick?: () => void }>;
};

const Card: React.FC<CardProps> = ({ title, total, categories, onClick }) => {
  const { t } = useTranslation();
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
        <div className={styles.categoriesSection}>
          {categories?.length ? (
            <>
              {categories?.map((category, index) => (
                <div key={index} className={styles.category}>
                  <div
                    className={classNames(styles.categoryLabel, styles.link)}
                    role="button"
                    tabIndex={0}
                    onClick={category?.onClick || undefined}>
                    {category.label} <ArrowRight size={10} />
                  </div>
                  <div className={styles.categoryValue}>{category.value}</div>
                </div>
              ))}
            </>
          ) : (
            <>
              {typeof onClick === 'function' && (
                <span className={styles.link} role="button" tabIndex={0} onClick={onClick}>
                  {t('view', 'View')}
                  <ArrowRight size={10} />
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;
