import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  StructuredListSkeleton,
  StructuredListRow,
  StructuredListCell,
  StructuredListWrapper,
  StructuredListHead,
  StructuredListBody,
  Tile,
} from '@carbon/react';
import styles from './regimen-history.scss';
import { useRegimenHistory } from '../hooks/useRegimenHistory';
import { formatDate, parseDate, useLayoutType } from '@openmrs/esm-framework';
import { RegimenType } from '../types';

export interface RegimenHistoryProps {
  patientUuid: string;
  category: string;
}

const RegimenHistory: React.FC<RegimenHistoryProps> = ({ patientUuid, category }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() == 'tablet';
  const { regimen, isLoading, error } = useRegimenHistory(patientUuid, RegimenType[category]);

  if (isLoading) {
    return <StructuredListSkeleton role="progressbar" />;
  }

  if (error) {
    return <span>{t('errorRegimenHistory', 'Error loading regimen history')}</span>;
  }

  if (regimen?.length === 0) {
    return;
  }

  if (regimen?.length) {
    const structuredListBodyRowGenerator = () => {
      return regimen
        .filter((regimen) => regimen?.startDate)
        .map((regimen, i) => (
          <StructuredListRow key={`row-${i}`} className={styles.structuredList}>
            <StructuredListCell>
              {regimen?.startDate ? formatDate(parseDate(regimen?.startDate), { mode: 'wide' }) : ''}
            </StructuredListCell>
            <StructuredListCell>
              {regimen?.endDate ? formatDate(parseDate(regimen?.endDate), { mode: 'wide' }) : ''}
            </StructuredListCell>
            <StructuredListCell>
              {regimen?.regimenShortDisplay ? regimen?.regimenShortDisplay : '——'}
            </StructuredListCell>
            <StructuredListCell>{regimen?.regimenLine ? regimen?.regimenLine : '——'}</StructuredListCell>
            <StructuredListCell>
              {regimen?.changeReasons ? regimen?.changeReasons.slice(1, -1) : '——'}
            </StructuredListCell>
            <StructuredListCell></StructuredListCell>
          </StructuredListRow>
        ));
    };

    return (
      <section>
        <Tile className={styles.whiteBackground}>
          <div className={isTablet ? styles.tabletHeading : styles.desktopHeading}>
            <h4 className={styles.title}>{t('regimenHistory', 'Regimen History')}</h4>
          </div>
          <div className={styles.structuredListBody}>
            <StructuredListWrapper>
              <StructuredListHead>
                <StructuredListRow head>
                  <StructuredListCell head>{t('start', 'Start')}</StructuredListCell>
                  <StructuredListCell head>{t('end', 'End')}</StructuredListCell>
                  <StructuredListCell head>{t('regimen', 'Regimen')}</StructuredListCell>
                  <StructuredListCell head>{t('regimenLine', 'Regimen line')}</StructuredListCell>
                  <StructuredListCell head>{t('changeReason', 'Change reason')}</StructuredListCell>
                </StructuredListRow>
              </StructuredListHead>
              <StructuredListBody className={styles.structuredListBody}>
                {structuredListBodyRowGenerator()}
              </StructuredListBody>
            </StructuredListWrapper>
          </div>
        </Tile>
      </section>
    );
  }
};

export default RegimenHistory;
