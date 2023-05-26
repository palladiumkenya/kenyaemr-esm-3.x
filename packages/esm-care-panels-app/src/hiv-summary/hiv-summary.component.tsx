import React from 'react'
import styles from "./hiv-summary.scss";
import { useHivSummary } from '../hooks/useHivSummary';
import { useTranslation } from 'react-i18next';

interface HivSummaryProps {
  patientUuid: string;
}

const HivSummary: React.FC<HivSummaryProps> = ({ patientUuid }) => {
  const { data, isError, isLoading } = useHivSummary(patientUuid);
  const { t } = useTranslation();

  return (
    <div className={styles.card}>
      <p className={styles.title}> {t('hivCare', 'HIV care')}</p>
      <ul className={styles.list}>
        <li> <span className={styles.label}>{t('lastWhoStage', 'Last WHO stage')} </span> : &nbsp; {data?.summary?.whoStage}</li>
        <li><span className={styles.label}> {t('lastCd4Count', 'Last CD4 count')} </span> : &nbsp;  {data?.summary?.cd4} </li>
        <li><span className={styles.label}> {t('CD4Percentage', 'CD4 percentage')}</span> : &nbsp;  {data?.summary?.cd4Percent} </li>
        <li><span className={styles.label}> {t('lastViralLoad', 'Last viral load')}</span> : &nbsp;  {data?.summary?.ldl_value} </li>
        <li><span className={styles.label}> {t('regimen', 'Regimen')}</span> : &nbsp; {data?.firstEncounter?.regimenShortDisplay} </li>
        <li><span className={styles.label}> {t('regimenStarted', 'Regimen started')}</span> : &nbsp; {data?.firstEncounter?.startDate}</li>
      </ul>
    </div>
  )
}

export default HivSummary;
