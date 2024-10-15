import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layer, Search, Tile } from '@carbon/react';
import { EmptyDataIllustration } from '@openmrs/esm-patient-common-lib';
import { UserHasAccess } from '@openmrs/esm-framework';
import NavBarLink from './navbar-link.component';
import styles from './navbar-action-button.scss';

interface Modules {
  url?: string;
  icon: React.ReactNode;
  label: string;
  requiresAdmin?: boolean;
  privilege?: string;
}

interface NavBarOverlayProps {
  setSearchTerm: (searchTerm: string) => void;
  searchTerm: string;
  hideOverlay: (state: boolean) => void;
  modules: Array<Modules>;
}

const NavBarOverlay: React.FC<NavBarOverlayProps> = ({ setSearchTerm, modules, searchTerm, hideOverlay }) => {
  const { t } = useTranslation();

  const handleClearSearch = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      setSearchTerm('');
    },
    [setSearchTerm],
  );

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value);
    },
    [setSearchTerm],
  );
  // Add logic to render module links based on user privileges
  const renderModuleLinks = useMemo(
    () =>
      modules.map((item, index) =>
        item?.privilege ? (
          <UserHasAccess key={index} privilege={item.privilege}>
            <NavBarLink key={index} {...item} hideOverlay={hideOverlay} />
          </UserHasAccess>
        ) : (
          <NavBarLink key={index} {...item} hideOverlay={hideOverlay} />
        ),
      ),
    [modules, hideOverlay],
  );

  const renderEmptyState = () => (
    <Layer className={styles.emptyStateContainer}>
      <Tile className={styles.tile}>
        <div className={styles.illo}>
          <EmptyDataIllustration />
        </div>
        <p className={styles.content}>
          {t('emptyLinkSearchText', 'There are no links to display that match the search criteria')}
        </p>
        <Button kind="ghost" onClick={handleClearSearch}>
          {t('clearSearch', 'Clear search')}
        </Button>
      </Tile>
    </Layer>
  );

  return (
    <div className={styles.overlay}>
      <div className={styles.layout}>
        <Search
          autoFocus
          className={styles.search}
          size="lg"
          placeholder={t('search', 'Search for a module')}
          labelText={t('search', 'Search for a module')}
          closeButtonLabelText="Clear search input"
          id="searchModulesInput"
          value={searchTerm}
          onChange={handleSearchChange}
        />

        {modules.length === 0 && renderEmptyState()}
        {modules.length > 0 && <div className={styles.navLinks}>{renderModuleLinks}</div>}
      </div>
    </div>
  );
};

export default React.memo(NavBarOverlay);
