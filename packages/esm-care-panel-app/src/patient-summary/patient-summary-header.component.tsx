import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { useLayoutType } from '@openmrs/esm-framework';
import { Printer } from '@carbon/react/icons';
import styles from './patient-summary.scss';

interface PatientSummaryHeaderProps {
  onPrint: () => void;
  printMode: boolean;
}

const PatientSummaryHeader: React.FC<PatientSummaryHeaderProps> = ({ onPrint, printMode }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() == 'tablet';

  return (
    <div className={isTablet ? styles.tabletHeading : styles.desktopHeading}>
      <h4 className={styles.title}>{t('patientSummary', 'Patient summary')}</h4>
      {printMode === false && (
        <Button
          size="sm"
          className={styles.btnShow}
          onClick={onPrint}
          kind="tertiary"
          renderIcon={(props) => <Printer size={16} {...props} />}
          iconDescription={t('print', 'Print')}>
          {t('print', 'Print')}
        </Button>
      )}
    </div>
  );
};

export default PatientSummaryHeader;
