import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tab, Tabs, TabList } from '@carbon/react';

const ManageCommodityPrices = () => {
  const [activeTabIndex, setActiveTabindex] = useState<number>(0);

  const { t } = useTranslation();

  const handleTabChange = ({ selectedIndex }: { selectedIndex: number }) => {
    setActiveTabindex(selectedIndex);
  };

  return (
    <div>
      <Tabs onChange={handleTabChange} selectedIndex={activeTabIndex}>
        <TabList>
          <Tab>{t('search','Search')}</Tab>
        </TabList>
      </Tabs>
    </div>
  );
};
export default ManageCommodityPrices;
