import React, { useMemo } from 'react';
import styles from './metrics-cards.scss';
import { useBills } from '../billing.resource';
import { useBillMetrics } from './metrics.resource';
import { useTranslation } from 'react-i18next';
import { ErrorState } from '@openmrs/esm-patient-common-lib';
import { InlineLoading, Layer, Tile, Button } from '@carbon/react';
import classNames from 'classnames';
import { ConfigurableLink } from '@openmrs/esm-framework';
import { ArrowRight } from '@carbon/react/icons';

export default function MetricsCards() {
  const { t } = useTranslation();
  const { bills, isLoading, error } = useBills('');
  const { cumulativeBills, pendingBills, paidBills } = useBillMetrics(bills);

  const cards = useMemo(
    () => [
      { title: 'Cumulative Bills', count: cumulativeBills, extensionPage: '' },
      { title: 'Pending Bills', count: pendingBills, extensionPage: 'pendingBills' },
      { title: 'Paid Bills', count: paidBills, extensionPage: 'paidBills' },
      { title: 'Insurance Covers', count: paidBills, extensionPage: 'insurancecovers' },
    ],
    [cumulativeBills, pendingBills, paidBills],
  );

  if (isLoading) {
    return (
      <section className={styles.container}>
        <InlineLoading status="active" iconDescription="Loading" description="Loading bill metrics..." />
      </section>
    );
  }

  if (error) {
    return <ErrorState headerTitle={t('billMetrics', 'Bill metrics')} error={error} />;
  }
  return (
    <div>
      <section className={styles.container}>
        {cards.map((card) => (
          <Layer className={classNames(styles.cardContainer)}>
            <Tile className={styles.tileContainer}>
              <div className={styles.tileHeader}>
                <div className={styles.headerLabelContainer}>
                  <label className={styles.headerLabel}>{card.title}</label>
                </div>
                {card.extensionPage != '' ? (
                  <div className={styles.link}>
                    <ConfigurableLink className={styles.link} to={'billing/' + card.extensionPage}>
                      {t('viewAll', 'View All')}
                    </ConfigurableLink>
                    <ArrowRight size={16} />
                  </div>
                ) : (
                  ''
                )}
              </div>
              <div>
                <p className={styles.totalsValue}>{card.count}</p>
              </div>
            </Tile>
          </Layer>
        ))}
      </section>
    </div>
  );
}
function getOverlayStore() {
  throw new Error('Function not implemented.');
}
