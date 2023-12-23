import React, { useState } from 'react';
import { HeaderGlobalAction, Search, Layer, Tile, Button } from '@carbon/react';
import { DocumentAdd, Home, Switcher, VolumeFileStorage } from '@carbon/react/icons';
import styles from './navbar-button.scss';
import { navigate, useDebounce, useOnClickOutside } from '@openmrs/esm-framework';
import { EmptyDataIllustration } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import NavBarOverlay from './navbar-overlay.component';

type NavBarButtonProps = {};

export const NavBarButton: React.FC<NavBarButtonProps> = () => {
  const [showOverlay, setShowOverlay] = React.useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useTranslation();
  const ref = useOnClickOutside(() => setShowOverlay(false));

  const navLinkItems = [
    {
      icon: <DocumentAdd size={20} />,
      label: 'Manage forms',
      url: '/openmrs/spa/form-builder',
    },
    {
      icon: <VolumeFileStorage size={20} />,
      label: t('systemInfo', 'System Info'),
      url: '/openmrs/spa/about',
    },
    {
      icon: <Home size={20} />,
      label: t('kenyaemrHome', 'Kenyaemr Home'),
      url: '/openmrs/kenyaemr/userHome.page?',
    },
    {
      icon: <DocumentAdd size={20} />,
      label: 'Manage forms',
      url: '/openmrs/spa/form-builder',
    },
    {
      icon: <VolumeFileStorage size={20} />,
      label: t('systemInfo', 'System Info'),
      url: '/openmrs/spa/about',
    },
    {
      icon: <Home size={20} />,
      label: t('kenyaemrHome', 'Kenyaemr Home'),
      url: '/openmrs/kenyaemr/userHome.page?',
    },
  ];
  const debounceSearchTerm = useDebounce(searchTerm, 500);

  const searchResults =
    debounceSearchTerm === ''
      ? navLinkItems
      : navLinkItems.filter((item) => item.label.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div ref={ref as any}>
      {showOverlay && (
        <NavBarOverlay
          setSearchTerm={setSearchTerm}
          searchTerm={searchTerm}
          hideOverlay={setShowOverlay}
          searchResults={searchResults}
          hide={showOverlay}
        />
      )}

      <HeaderGlobalAction
        aria-label="Add Patient"
        aria-labelledby="Add Patient"
        enterDelayMs={500}
        name="AddPatientIcon"
        onClick={() => setShowOverlay(!showOverlay)}
        className={styles.slotStyles}>
        <Switcher size={20} />
      </HeaderGlobalAction>
    </div>
  );
};
