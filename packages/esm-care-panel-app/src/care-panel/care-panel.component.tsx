import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tile, StructuredListSkeleton, ContentSwitcher, Switch } from '@carbon/react';
import styles from './care-panel.scss';
import { useEnrollmentHistory } from '../hooks/useEnrollmentHistory';
import isNull from 'lodash-es/isNull';
import ProgramSummary from '../program-summary/program-summary.component';
import ProgramEnrollment from '../program-enrollment/program-enrollment.component';
import PatientSummary from '../patient-summary/patient-summary.component';

interface CarePanelProps {
  patientUuid: string;
  formEntrySub: any;
  launchPatientWorkspace: Function;
}

const CarePanel: React.FC<CarePanelProps> = ({ patientUuid, formEntrySub, launchPatientWorkspace }) => {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useEnrollmentHistory(patientUuid);
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  let patientPrograms = [...new Set(data?.map((program) => program.programName))];
  patientPrograms.unshift('Summary');

  useEffect(() => {
    setActiveTabIndex(activeTabIndex);
  }, [activeTabIndex]);

  if (isLoading) {
    return <StructuredListSkeleton role="progressbar" />;
  }

  if (isError) {
    return <span>{t('errorProgramEnrollment', 'Error loading program enrollments')}</span>;
  }

  if (isNull(data)) {
    return;
  }

  return (
    <div>
      <h1 className={styles.header}>{t('carePanels', 'Care panels')}</h1>
      <ContentSwitcher
        size="sm"
        selectedIndex={0}
        onChange={({ index }) => {
          setActiveTabIndex(index as number);
        }}>
        {patientPrograms?.length > 0
          ? patientPrograms.map((index, val) => {
              return <Switch name={index} text={index} key={val} value={val} />;
            })
          : null}
      </ContentSwitcher>
      <Tile className={styles.card}>
        {activeTabIndex === 0 ? (
          <PatientSummary patientUuid={patientUuid} />
        ) : (
          <div>
            <ProgramSummary patientUuid={patientUuid} programName={patientPrograms[activeTabIndex]} />
            <ProgramEnrollment
              patientUuid={patientUuid}
              programName={patientPrograms[activeTabIndex]}
              data={data}
              formEntrySub={formEntrySub}
              launchPatientWorkspace={launchPatientWorkspace}
            />
          </div>
        )}
      </Tile>
    </div>
  );
};

export default CarePanel;
