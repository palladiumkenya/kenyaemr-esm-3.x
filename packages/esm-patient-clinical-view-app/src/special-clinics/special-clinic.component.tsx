import React, { useMemo, useState } from 'react';
import { useConfig } from '@openmrs/esm-framework';
import { ConfigObject } from '../config-schema';
import GenericDashboard from '../specialized-clinics/generic-nav-links/generic-dashboard.component';
import { Dropdown, Layer } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import styles from './special-clinics.scss';

type SpecialClinicDashboardProps = {
  patientUuid: string;
};

type ClinicConfig = {
  title: string;
  encounterTypeUuid: string;
  formUuid: string;
};

const SpecialClinicDashboard: React.FC<SpecialClinicDashboardProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { specialClinics } = useConfig<ConfigObject>();
  const [selectedClinic, setSelectedClinic] = useState<ClinicConfig | null>(specialClinics[0]);

  const sortedClinics = useMemo(() => specialClinics.sort((a, b) => a.title.localeCompare(b.title)), [specialClinics]);

  return (
    <Layer>
      <div className={styles.dashboardContainer}>
        <h4 className={styles.dashboardTitle}>{t('specialClinics', 'Special Clinics')}</h4>
        <Dropdown
          id="default"
          itemToString={(item) => item?.title}
          items={sortedClinics}
          label={t('selectClinic', 'Select Clinic')}
          hideLabel={true}
          type="default"
          className={styles.dropdown}
          titleText={t('selectClinic', 'Select Clinic')}
          warnText={t('selectClinic', 'Select Clinic')}
          size="md"
          initialSelectedItem={selectedClinic}
          direction="bottom"
          onChange={(data) => setSelectedClinic(data.selectedItem)}
        />
      </div>
      <Layer level={0}>
        <GenericDashboard patientUuid={patientUuid} clinicConfig={selectedClinic} />
      </Layer>
    </Layer>
  );
};

export default SpecialClinicDashboard;
