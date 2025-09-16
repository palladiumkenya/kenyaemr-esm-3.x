import React from 'react';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@carbon/react';
import { ExtensionSlot } from '@openmrs/esm-framework';

export type ExtensionTabItem = {
  label: React.ReactNode;
  icon?: React.ComponentType<unknown>;
  slotName: string;
  slotClassName?: string;
};

type ExtensionTabsProps = {
  items: Array<ExtensionTabItem>;
  state?: Record<string, unknown>;
  contained?: boolean;
};

const ExtensionTabs: React.FC<ExtensionTabsProps> = ({ items, state, contained = true }) => {
  return (
    <Tabs>
      <TabList contained={contained}>
        {items.map((item, index) => (
          <Tab key={`tab-${index}`} renderIcon={item.icon}>
            {item.label}
          </Tab>
        ))}
      </TabList>
      <TabPanels>
        {items.map((item, index) => (
          <TabPanel key={`panel-${index}`}>
            <ExtensionSlot className={item.slotClassName} name={item.slotName} state={state} />
          </TabPanel>
        ))}
      </TabPanels>
    </Tabs>
  );
};

export default ExtensionTabs;
