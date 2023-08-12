import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StructuredListSkeleton, ContentSwitcher, Switch, InlineLoading } from '@carbon/react';
import styles from './care-panel.scss';
import { useEnrollmentHistory } from '../hooks/useEnrollmentHistory';
import ProgramSummary from '../program-summary/program-summary.component';
import ProgramEnrollment from '../program-enrollment/program-enrollment.component';
import { CardHeader } from '@openmrs/esm-patient-common-lib';

interface CarePanelProps {
  patientUuid: string;
  formEntrySub: any;
  launchPatientWorkspace: Function;
}

const CarePanel: React.FC<CarePanelProps> = ({ patientUuid, formEntrySub, launchPatientWorkspace }) => {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useEnrollmentHistory(patientUuid);
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  const patientPrograms = [...new Set(data?.map((program) => program.programName))];

  useEffect(() => {
    setActiveTabIndex(activeTabIndex);
  }, [activeTabIndex]);

  if (isLoading) {
    return <StructuredListSkeleton role="progressbar" />;
  }

  if (isError) {
    return <span>{t('errorProgramEnrollment', 'Error loading program enrollments')}</span>;
  }

  if (data?.length === 0) {
    return;
  }

  return (
    <div className={styles.widgetCard}>
      <CardHeader title={t('carePanel', 'Care Panel')}>
        {isLoading ? (
          <span>
            <InlineLoading />
          </span>
        ) : null}
        <div className={styles.contextSwitcherContainer}>
          <ContentSwitcher
            size="sm"
            selectedIndex={0}
            onChange={({ index }) => {
              setActiveTabIndex(index as number);
            }}>
            {patientPrograms?.length > 0
              ? patientPrograms.map((index, val) => <Switch name={index} text={index} key={val} value={val} />)
              : null}
          </ContentSwitcher>
        </div>
      </CardHeader>
      <div style={{ width: '100%' }}>
        <ProgramSummary patientUuid={patientUuid} programName={patientPrograms[activeTabIndex]} />
        <ProgramEnrollment
          patientUuid={patientUuid}
          programName={patientPrograms[activeTabIndex]}
          data={data}
          formEntrySub={formEntrySub}
          launchPatientWorkspace={launchPatientWorkspace}
        />
      </div>
    </div>
  );
};

export default CarePanel;
