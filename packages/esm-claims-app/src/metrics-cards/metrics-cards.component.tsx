import React, { useMemo } from 'react';
import Card from './card.component';
import styles from './metrics-cards.scss';
import { useBills } from '../billing.resource';
import { useBillMetrics } from './metrics.resource';
import { useTranslation } from 'react-i18next';
import { ErrorState } from '@openmrs/esm-patient-common-lib';
import { InlineLoading } from '@carbon/react';

export default function MetricsCards() {
  const { t } = useTranslation();
  const { bills, isLoading, error } = useBills('');
  const { cumulativeBills, pendingBills, paidBills } = useBillMetrics(bills);

  const cards = useMemo(
    () => [
      { title: 'All Claims', count: cumulativeBills },
      { title: 'Pending Claims', count: pendingBills },
      { title: 'Paid Claims', count: paidBills },
      { title: 'Rejected Claims', count: paidBills },
    ],
    [cumulativeBills, pendingBills, paidBills],
  );

  if (isLoading) {
    return (
      <section className={styles.container}>
        <InlineLoading status="active" iconDescription="Loading" description="Loading claims metrics..." />
      </section>
    );
  }

  if (error) {
    return <ErrorState headerTitle={t('claimsMetrics', 'Claims metrics')} error={error} />;
  }
  return (
    <section className={styles.container}>
      {cards.map((card) => (
        <Card key={card.title} title={card.title} count={card.count} />
      ))}
    </section>
  );
}
