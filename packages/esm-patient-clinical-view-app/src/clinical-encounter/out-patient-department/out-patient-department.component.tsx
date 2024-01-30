import React from 'react';
import { Layer, Tile, Tabs, TabList, Tab, TabPanels, TabPanel, Section, Heading } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import styles from './out-patient.scss';
import { Friendship, ReminderMedical } from '@carbon/react/icons';

type OutPatientProps = {};

const OutPatientView: React.FC<OutPatientProps> = () => {
  const { t } = useTranslation();
  return (
    <>
      <Layer>
        <Tile>
          <div className={styles.desktopHeading}>
            <h4>{t('outPatient', 'Out Patient')}</h4>
          </div>
        </Tile>
      </Layer>
      <Layer className={styles.layerBackground}>
        <Tabs>
          <TabList contained activation="manual" aria-label="List of tabs">
            <Tab renderIcon={Friendship}>{t('socialHistory', 'Social History')}</Tab>
            <Tab renderIcon={ReminderMedical}>{t('medicalHistory', 'Medical History')}</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Section level={6}>
                <Heading>{t('commingSoon', 'Comming soon, under development')}</Heading>
              </Section>
            </TabPanel>
            <TabPanel>
              <Section level={6}>
                <Heading>{t('commingSoon', 'Comming soon, under development')}</Heading>
              </Section>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Layer>
    </>
  );
};

export default OutPatientView;
