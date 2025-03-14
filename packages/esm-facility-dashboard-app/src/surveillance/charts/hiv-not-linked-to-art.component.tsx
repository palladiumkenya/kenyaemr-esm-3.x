import '@carbon/charts/styles.css';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import BaseIndicatorTrendChart from './base-indicator-trend-chart.component';
const HIVPositiveNotLinkedToART = () => {
  const { t } = useTranslation();
  const generateRandomData = (numRecords: number) => {
    return Array.from({ length: numRecords }, (_, i) => ({
      week: `Week ${i + 1}`,
      abnomallPercentage: Math.floor(Math.random() * 50),
    }));
  };

  const values = useMemo(() => generateRandomData(40), []);
  return (
    <BaseIndicatorTrendChart
      data={values}
      title={t('hivPositiveNotLinkedToART', 'HIV +VE Not linked to ART')}
      yAxisTitle={t('percentageTestedPositiveNotLinked', '% tested positive not linked')}
    />
  );
};

export default HIVPositiveNotLinkedToART;
