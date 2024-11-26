import React from 'react';
import { MorgueHeader } from '../header/morgue-header.component';
import { MorgueTabs } from '../tabs/tabs.component';
import { useTranslation } from 'react-i18next';
import { useDeceasedPatient } from '../hook/useMorgue.resource';

const MainComponent: React.FC = () => {
  const { t } = useTranslation();
  const { data: deceasedPatients, isLoading } = useDeceasedPatient();

  const awaitingCount = isLoading ? null : deceasedPatients?.filter((p) => p.status === 'awaiting').length || 0;
  const admittedCount = isLoading ? null : deceasedPatients?.filter((p) => p.status === 'admitted').length || 0;
  const dischargedCount = isLoading ? null : deceasedPatients?.filter((p) => p.status === 'discharged').length || 0;

  return (
    <div className={`omrs-main-content`}>
      <MorgueHeader
        title={t('mortuary', 'Mortuary')}
        awaitingCount={awaitingCount}
        admittedCount={admittedCount}
        dischargedCount={dischargedCount}
        isLoading={isLoading}
      />
      <MorgueTabs />
    </div>
  );
};

export default MainComponent;
