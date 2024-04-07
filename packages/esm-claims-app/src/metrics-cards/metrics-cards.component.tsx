import React, { useMemo } from 'react';
import Card from './card.component';
import styles from './metrics-cards.scss';
import { useBills } from '../claims.resource';
import { useClaimsMetrics } from './metrics.resource';
import { useTranslation } from 'react-i18next';
import { ErrorState } from '@openmrs/esm-patient-common-lib';
import { InlineLoading } from '@carbon/react';

export default function MetricsCards() {
  const { t } = useTranslation();
  const { bills, isLoading, error } = useBills('');
  const { cumulativeClaims, pendingClaims, paidClaims, rejectedClaims } = useClaimsMetrics(bills);

  const cards = useMemo(
    () => [
      { title: 'All Claims', count: cumulativeClaims },
      { title: 'Pending Claims', count: pendingClaims },
      { title: 'Paid Claims', count: paidClaims },
      { title: 'Rejected Claims', count: rejectedClaims },
    ],
    [cumulativeClaims, pendingClaims, paidClaims, rejectedClaims],
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
