import React, { useState } from 'react';
import { HeaderGlobalAction } from '@carbon/react';
import styles from './navbar-action-button.scss';
import { useConfig, useDebounce, useOnClickOutside } from '@openmrs/esm-framework';
import NavBarOverlay from './navbar-overlay.component';
import { Switcher, Close } from '@carbon/react/icons';
import { useModuleLinks } from './nav-utils.component';
import { useTranslation } from 'react-i18next';
import { ConfigObject } from '../config-schema';

type NavbarActionButtonProps = {};
const DEBOUNCE_TIME = 500;

const NavbarActionButton: React.FC<NavbarActionButtonProps> = () => {
  const { t } = useTranslation();
  const moduleLinks = useModuleLinks();
  const { instanceName } = useConfig<ConfigObject>();
  const [showOverlay, setShowOverlay] = React.useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const title = t('instanceModules', '{{instanceName}}Modules', { instanceName });
  const toggleOverlay = () => {
    setShowOverlay((prevState) => !prevState);
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
        aria-label={title}
        aria-labelledby={title}
        onClick={() => toggleOverlay()}
        className={showOverlay ? styles.active : styles.slotStyles}>
        {showOverlay ? <Close size={20} /> : <Switcher size={20} />}
      </HeaderGlobalAction>
    </div>
  );
};
export default NavbarActionButton;
