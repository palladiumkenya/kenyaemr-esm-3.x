import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useProgramData } from '../hooks/useProgramData';
import { Tile, Tabs, TabList, Tab, TabPanels, TabPanel, Button } from '@carbon/react';
import styles from './care-panels.scss';
import { Edit } from '@carbon/react/icons';

const CarePanels = () => {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useProgramData();
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);

  const handleTabChange = ({ selectedIndex }: { selectedIndex: number }) => {
    setActiveTabIndex(selectedIndex);
  };

  return (
    <div>
      <h1 className={styles.header}>{t('carePanels', 'Care panels')}</h1>
      <Tabs selectedIndex={activeTabIndex} onChange={handleTabChange} className={styles.tabs}>
        <TabList style={{ paddingLeft: '1rem' }} aria-label="Appointment tabs" contained>
          {data.map((program) => {
            return (
              <Tab className={styles.tabPanel}>{program?.display} &nbsp; {t('sumary', 'Summary')}</Tab>
            )
          })}
        </TabList>
        <TabPanels>
          {data.map((program) => {
            return (
              <TabPanel className={styles.tabPanel}>
                <Tile className={styles.card}>
                  <div className={styles.btnEdit}>
                    <Button
                      className={styles.editIcon}
                      iconDescription={t('edit', 'Edit')}
                      hasIconOnly
                      kind="ghost"
                      renderIcon={(props) => <Edit size={16} {...props} />}
                    />
                  </div>
                  <p className={styles.label}>{program?.display} &nbsp; {t('sumary', 'Summary')}</p>
                  <p className={styles.label}>{t('enrolled', 'Enrolled')} &nbsp; :</p> <p>{program?.enrollmentDate}</p>
                  <p className={styles.label}>{t('discontinued', 'Discontinued')} &nbsp; :</p> <p>{program?.discontinuationDate ? program?.discontinuationDate : '--'} </p>
                  <p className={styles.label}>{t('whoStage', 'WHO Stage')} &nbsp; :</p> <p>{program?.whoStage ? program?.whoStage : '--'} </p>
                  <p className={styles.label}>{t('entryPoint', 'Discontinued')} &nbsp; :</p> <p>{program?.entryPoint ? program?.entryPoint : '--'} </p>
                  <div className={styles.btnDiscontinue}><Button kind="ghost">{t('discontinue', 'Discontinue')}</Button></div>
                </Tile>
              </TabPanel>
            )
          })}
        </TabPanels>
      </Tabs>
    </div >
  )
};

export default CarePanels;