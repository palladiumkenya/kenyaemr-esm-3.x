import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  DataTableSkeleton,
  Layer,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tile,
  Button,
  Checkbox,
  RadioButton,
  RadioButtonGroup,
  Stack,
  Tab,
  TabListVertical,
  TabPanel,
  TabPanels,
  TabsVertical,
  TextInput,
  Tabs,
  TabList,
} from '@carbon/react';
import { Add, ChartLineSmooth } from '@carbon/react/icons';
import { EmptyDataIllustration, ErrorState, CardHeader, EmptyState } from '@openmrs/esm-patient-common-lib';
import { formatDate, isDesktop, launchWorkspace, parseDate, useLayoutType } from '@openmrs/esm-framework';
import styles from './labour-delivery.scss';
import { usePartograph } from '../../hooks/usePartograph';
import dayjs from 'dayjs';
import {
  CervicalDilation as cervicalDilation,
  DeviceRecorded,
  FetalHeartRate,
  PartographEncounterFormUuid,
  SurgicalProcedure,
  descentOfHeadObj,
} from '../../utils/constants';
import PartographChart from './partograph-chart';
import FoetalHeartRate from './foetal-heart-rate.component';
import MembraneAmnioticFluidAndMoulding from './membrane-amniotic-fluid-moulding.component';
import CervicalDilation from './cervical-dilation.component';
import DescentOfHead from './descent-of-head.component';
import ContractionLevel from './contraction-level.component';

interface PartographyProps {
  patientUuid: string;
  filter?: (encounter: any) => boolean;
}

const Partograph: React.FC<PartographyProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const [chartView, setChartView] = React.useState<boolean>();
  const { encounters = [], isLoading, isValidating, error, mutate } = usePartograph(patientUuid);
  const headerTitle = t('partograph', 'Partograph');
  const displayText = t('partographData', 'Vital Components');
  const headers = [
    {
      header: t('date', 'Date'),
      key: 'date',
    },
    {
      header: t('timeRecorded', 'Time Recorded'),
      key: 'timeRecorded',
    },
    {
      header: t('fetalHeartRate', 'Fetal Heart Rate'),
      key: 'fetalHeartRate',
    },
    {
      header: t('cervicalDilation', 'Cervical Dilation cm'),
      key: 'cervicalDilation',
    },
    {
      header: t('descentOfHead', 'Descent of Head'),
      key: 'descentOfHead',
    },
  ];
  const tableRows =
    encounters.map((encounter) => {
      const groupMembers = encounter.groupMembers;
      const groupmembersObj = groupMembers.reduce((acc, curr) => {
        acc[curr.concept.uuid] =
          typeof curr.value === 'string' || typeof curr.value === 'number' ? curr.value : curr.value.uuid;
        return acc;
      });
      return {
        id: `${encounter.uuid}`,
        date: formatDate(parseDate(encounter.obsDatetime.toString()), { mode: 'wide', time: true }),
        timeRecorded: dayjs(new Date(groupmembersObj[DeviceRecorded])).format('HH:mm'),
        fetalHeartRate: groupmembersObj[FetalHeartRate],
        cervicalDilation: groupmembersObj[cervicalDilation],
        descentOfHead: descentOfHeadObj[groupmembersObj[SurgicalProcedure]],
        contractionFrequency: '--', // TODO: get from obsGroup 163750AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
        contractionDuration: '--', // TODO: get from obsGroup 163750AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
      };
    }) ?? [];

  const chartData =
    encounters.map((encounter) => {
      const groupMembers = encounter.groupMembers;
      const groupmembersObj = groupMembers.reduce((acc, curr) => {
        acc[curr.concept.uuid] =
          typeof curr.value === 'string' || typeof curr.value === 'number' ? curr.value : curr.value.uuid;
        return acc;
      });
      return {
        id: `${encounter.uuid}`,
        date: encounter.obsDatetime,
        fetalHeartRate: groupmembersObj[FetalHeartRate],
        cervicalDilation: groupmembersObj[cervicalDilation],
        descentOfHead: descentOfHeadObj[groupmembersObj[SurgicalProcedure]],
      };
    }) ?? [];

  const handleAddHistory = () => {
    launchWorkspace('patient-form-entry-workspace', {
      workspaceTitle: headerTitle,
      mutateForm: () => {
        mutate();
      },
      formInfo: {
        encounterUuid: '',
        formUuid: PartographEncounterFormUuid,
      },
    });
  };

  if (isLoading) {
    return <DataTableSkeleton rowCount={5} />;
  }

  if (error) {
    return <ErrorState headerTitle={headerTitle} error={error} />;
  }

  return (
    <div className={styles.expandedTabsParentContainer}>
      <div className={styles.expandedTabsContainer}>
        <Tabs>
          <TabList aria-label={t('tabList', 'Tab List')}>
            <Tab>{t('foetalHeartRate', 'Foetal Heart Rate')}</Tab>
            <Tab>{t('membraneAmnioticFluidAndMoulding', 'Membrane Amniotic Fluid & Moulding')}</Tab>
            <Tab>{t('cervicalDilation', 'Cervical Dilation')}</Tab>
            <Tab>{t('descentOfHead', 'Descent of Head')}</Tab>
            <Tab>{t('contractionLevel', 'Contraction level')}</Tab>
          </TabList>
          <TabPanels>
            <TabPanel className={styles.orderTabs}>
              <FoetalHeartRate />
            </TabPanel>
            <TabPanel className={styles.orderTabs}>
              <MembraneAmnioticFluidAndMoulding />
            </TabPanel>
            <TabPanel className={styles.orderTabs}>
              <CervicalDilation />
            </TabPanel>
            <TabPanel className={styles.orderTabs}>
              <DescentOfHead />
            </TabPanel>
            <TabPanel className={styles.orderTabs}>
              <ContractionLevel />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </div>
  );
};
export default Partograph;
