import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layer, Search, Tile } from '@carbon/react';
import { EmptyDataIllustration } from '@openmrs/esm-patient-common-lib';
import NavBarLink from './navbar-link.component';
import styles from './navbar-action-button.scss';
import { UserHasAccess } from '@openmrs/esm-framework';

type NavBarOverLayerProps = {
  setSearchTerm: (searchTerm: string) => void;
  searchTerm: string;
  hideOverlay: (state: boolean) => void;
  searchResults: Array<{ url?: string; icon: any; label: string; requiresAdmin?: boolean }>;
};

const NavBarOverlay: React.FC<NavBarOverLayerProps> = ({ setSearchTerm, searchResults, searchTerm, hideOverlay }) => {
  const { t } = useTranslation();

  const handleClearSearch = (event) => {
    event.stopPropagation();
    setSearchTerm('');
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.layout}>
        <Search
          autoFocus={true}
          className={styles.search}
          size="lg"
          placeholder={t('search', 'Search for a module')}
          labelText={t('search', 'Search for a module')}
          closeButtonLabelText="Clear search input"
          id="searchModulesInput"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />

        {searchResults.length > 0 && (
          <div className={styles.navLinks}>
            {searchResults.map((item, index) =>
              item?.requiresAdmin ? (
                <UserHasAccess privilege="coreapps.systemAdministration">
                  <NavBarLink key={index} {...item} hideOverlay={hideOverlay} />
                </UserHasAccess>
              ) : (
                <NavBarLink key={index} {...item} hideOverlay={hideOverlay} />
              ),
            )}
          </div>
        )}

        {searchResults.length === 0 && (
          <Layer className={styles.emptyStateContainer}>
            <Tile className={styles.tile}>
              <div className={styles.illo}>
                <EmptyDataIllustration />
              </div>
              <p className={styles.content}>
                {t('emptyLinkSearchText', `There are no links to display that match the search criteria`)}
              </p>
              <Button kind="ghost" onClick={handleClearSearch}>
                {t('clearSearch', 'Clear search')}
              </Button>
            </Tile>
          </Layer>
        )}
      </div>
    </div>
  );
};

export default NavBarOverlay;
