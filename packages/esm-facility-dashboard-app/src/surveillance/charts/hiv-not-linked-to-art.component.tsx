import '@carbon/charts/styles.css';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import BaseIndicatorTrendChart from './base-indicator-trend-chart.component';
import BaseArtProgressTrackingChart from './base-art-progress-tracking-chart.component';
import useFacilityDashboardSurveillance from '../../hooks/useFacilityDashboardSurveillance';
import { useSurveillanceData } from '../../hooks/useSurveillanceData';
type HIVPositiveNotLinkedToARTProps = {
  startDate?: Date;
  endDate?: Date;
};
const HIVPositiveNotLinkedToART: React.FC<HIVPositiveNotLinkedToARTProps> = ({ startDate, endDate }) => {
  const { t } = useTranslation();

  const { error, isLoading, surveillanceSummary } = useFacilityDashboardSurveillance(startDate, endDate);

  const hivPositivePatientValue = useSurveillanceData(surveillanceSummary, 'getMonthlyHivPositiveNotLinked');

  const monthlyHivPositivePatientData = useSurveillanceData(
    surveillanceSummary,
    'getMonthlyHivPositiveNotLinkedPatients',
  );

  return (
    <>
      <BaseIndicatorTrendChart
        data={hivPositivePatientValue}
        title={t('hivPositiveNotLinkedToART', 'HIV +VE Not linked to ART')}
        yAxisTitle={t('numberTestedPositiveNotLinked', 'no tested positive not linked')}
      />
      <BaseArtProgressTrackingChart data={monthlyHivPositivePatientData} />
    </>
  );
};

export default HIVPositiveNotLinkedToART;
