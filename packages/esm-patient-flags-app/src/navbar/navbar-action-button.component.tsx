import React, { useState } from 'react';
import { HeaderGlobalAction } from '@carbon/react';
import styles from './navbar-action-button.scss';
import { useDebounce, useOnClickOutside } from '@openmrs/esm-framework';
import NavBarOverlay from './navbar-overlay.component';
import { Switcher, Close } from '@carbon/react/icons';
import { useModuleLinks } from './nav-utils';
import { useTranslation } from 'react-i18next';

type NavbarActionButtonProps = {};
const DEBOUNCE_TIME = 500;

const NavbarActionButton: React.FC<NavbarActionButtonProps> = () => {
  const { t } = useTranslation();
  const moduleLinks = useModuleLinks();
  const [showOverlay, setShowOverlay] = React.useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleOverlay = (event) => {
    setShowOverlay((prevState) => !prevState);
    event.stopPropagation();
  };
  const ref = useOnClickOutside<HTMLDivElement>(toggleOverlay, showOverlay);

  const debounceSearchTerm = useDebounce(searchTerm, DEBOUNCE_TIME);
  const searchResults =
    debounceSearchTerm === ''
      ? moduleLinks
      : moduleLinks.filter((item) => item.label.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div id="module" ref={ref}>
      {showOverlay && (
        <NavBarOverlay
          setSearchTerm={setSearchTerm}
          searchTerm={searchTerm}
          hideOverlay={setShowOverlay}
          modules={searchResults}
        />
      )}

      <HeaderGlobalAction
        aria-label={t('kenyaEMRModules', 'KenyaEMR Modules')}
        aria-labelledby={t('kenyaEMRModules', 'KenyaEMR Modules')}
        enterDelayMs={500}
        name="kenyaEMRModules"
        onClick={toggleOverlay}
        className={showOverlay ? styles.active : styles.slotStyles}>
        {showOverlay ? <Close size={20} /> : <Switcher size={20} />}
      </HeaderGlobalAction>
    </div>
  );
};
export default NavbarActionButton;
