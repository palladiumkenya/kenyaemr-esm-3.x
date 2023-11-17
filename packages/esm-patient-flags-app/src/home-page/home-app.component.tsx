import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from '@carbon/react';
import styles from './home-app.scss';
import {
  DocumentAdd,
  Renew,
  Events,
  VolumeFileStorage,
  Medication,
  User,
  Report,
  Home,
  ChartColumn,
  Receipt,
} from '@carbon/react/icons';
import MenuItems from './menu.component';
import { useConfig } from '@openmrs/esm-framework';
import { ConfigObject } from '../config-schema';

interface AppSearchBarProps {
  onChange?: (searchTerm) => void;
  onClear: () => void;
  onSubmit: (searchTerm) => void;
  small?: boolean;
}

const AppSearchBar = React.forwardRef<HTMLInputElement, React.PropsWithChildren<AppSearchBarProps>>(
  ({ onChange, onClear, onSubmit, small }, ref) => {
    const { t } = useTranslation();

    // items
    const openmrsSpaBase = window['getOpenmrsSpaBase']();
    const { facilityDashboardUrl } = useConfig<ConfigObject>();

    const initialItems = useMemo(() => {
      const items = [
        {
          app: 'System Info ',
          link: `${openmrsSpaBase}about`,
          icon: <VolumeFileStorage size={24} />,
        },
        {
          app: 'Kenyaemr Home',
          link: `/openmrs/kenyaemr/userHome.page?`,
          icon: <Home size={24} />,
        },
        {
          app: 'Facility Dashboard ',
          link: `${facilityDashboardUrl}`,
          icon: <ChartColumn size={24} />,
        },
        {
          app: 'Clear Cache',
          link: `${openmrsSpaBase}about`,
          icon: <Renew size={24} />,
        },
        {
          app: 'Form Builder ',
          link: `${openmrsSpaBase}form-builder`,
          icon: <DocumentAdd size={24} />,
        },
        {
          app: 'Legacy Admin ',
          link: `/openmrs/index.htm`,
          icon: <User size={24} />,
        },
        {
          app: 'Stock Management ',
          link: `${openmrsSpaBase}stock-management`,
          icon: <Report size={24} />,
        },
        {
          app: 'Billing ',
          link: `${openmrsSpaBase}home/billing`,
          icon: <Receipt size={24} />,
        },
        {
          app: 'Cohort Builder ',
          link: `${openmrsSpaBase}cohort-builder`,
          icon: <Events size={24} />,
        },
        {
          app: 'Dispensing App',
          link: `${openmrsSpaBase}dispensing`,
          icon: <Medication size={24} />,
        },
      ];

      return items;
    }, [facilityDashboardUrl, openmrsSpaBase]);

    const [searchTerm, setSearchTerm] = useState('');
    const [items, setItems] = useState(initialItems);

    const handleChange = useCallback(
      (val) => {
        if (typeof onChange === 'function') {
          onChange(val);
        }
        setSearchTerm(val);
        const filteredItems = initialItems.filter((item) => item.app.toLowerCase().includes(val));
        setItems(filteredItems);
      },
      [initialItems, onChange],
    );

    const handleSubmit = (evt) => {
      evt.preventDefault();
      onSubmit(searchTerm);
    };

    return (
      <>
        <form onSubmit={handleSubmit} className={styles.searchArea}>
          <Search
            autoFocus
            className={styles.appSearchInput}
            closeButtonLabelText={t('clearSearch', 'Clear')}
            labelText=""
            onChange={(event) => handleChange(event.target.value)}
            onClear={onClear}
            placeholder={t('searchForApp', 'Search for a application or module by name')}
            size={small ? 'sm' : 'lg'}
            value={searchTerm}
            ref={ref}
            data-testid="appSearchBar"
          />
        </form>
        <div className={styles.searchItems}>
          <MenuItems items={items} />
        </div>
      </>
    );
  },
);

export default AppSearchBar;
