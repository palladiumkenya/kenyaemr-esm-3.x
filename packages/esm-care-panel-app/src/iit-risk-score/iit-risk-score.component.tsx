import { Column, Row, SkeletonText } from '@carbon/react';
import { ErrorState, formatDate, parseDate } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import usePatientIITScore from '../hooks/usePatientIITScore';
import styles from './iit-risk-score.scss';

interface CarePanellIITRiskScoreProps {
  patientUuid: string;
}

const CarePanellIITRiskScore: React.FC<CarePanellIITRiskScoreProps> = ({ patientUuid }) => {
  const { riskScore, error, isLoading } = usePatientIITScore(patientUuid);
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className={styles.riskScoreCard}>
        <Row style={{ display: 'flex' }}>
          <Column lg={4} md={4} sm={4} className={styles.riskScoreCardItem}>
            <SkeletonText />
            <SkeletonText />
          </Column>
          <Column lg={4} md={4} sm={4} className={styles.riskScoreCardItem}>
            <SkeletonText />
            <SkeletonText />
          </Column>
        </Row>
        <Row style={{ display: 'flex' }}>
          <Column lg={4} md={4} sm={4} className={styles.riskScoreCardItem}>
            <SkeletonText />
            <SkeletonText />
          </Column>
          <Column lg={12} md={12} sm={12} className={styles.riskScoreCardItem}>
            <SkeletonText />
            <SkeletonText />
          </Column>
        </Row>
      </div>
    );
  }

  if (error) {
    return <ErrorState error={error} headerTitle={t('iitRiscScore', 'IIT Risk Score')} />;
  }
  return (
    <div className={styles.riskScoreCard}>
      <span className={styles.sectionHeader}>IIT Risk Score</span>
      <Row style={{ display: 'flex' }}>
        <Column lg={4} md={4} sm={4} className={styles.riskScoreCardItem}>
          <strong>Risk Score:</strong>
          <p>{`${riskScore?.riskScore ?? 0}`}</p>
        </Column>
        <Column lg={4} md={4} sm={4} className={styles.riskScoreCardItem}>
          <strong>Evaluation Date:</strong>
          <p>{formatDate(parseDate(riskScore?.evaluationDate))}</p>
        </Column>
      </Row>
      <Row style={{ display: 'flex' }}>
        <Column lg={4} md={4} sm={4} className={styles.riskScoreCardItem}>
          <strong>Description:</strong>
          <p>{riskScore?.description}</p>
        </Column>
        <Column lg={12} md={12} sm={12} className={styles.riskScoreCardItem}>
          <strong>Risk Factors:</strong>
          <p>{riskScore?.riskFactors}</p>
        </Column>
      </Row>
    </div>
  );
};

export default CarePanellIITRiskScore;
