import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layer, Search, Tile } from '@carbon/react';
import { navigate, useOnClickOutside } from '@openmrs/esm-framework';
import styles from './navbar-button.scss';
import { EmptyDataIllustration } from '@openmrs/esm-patient-common-lib';

type NavBarOverLayerProps = {
  setSearchTerm: (searchTerm: string) => void;
  searchTerm: string;
  hideOverlay: (state: boolean) => void;
  searchResults: Array<{ url: string; icon: React.ReactNode; label: string }>;
  hide: boolean;
};

const NavBarOverlay: React.FC<NavBarOverLayerProps> = ({ setSearchTerm, searchResults, searchTerm }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.overlay}>
      <div className={styles.layout}>
        <Search
          light
          className={styles.search}
          size="lg"
          placeholder="Find your items"
          labelText="Search"
          closeButtonLabelText="Clear search input"
          id="search-1"
          onChange={(event) => setSearchTerm(event.target.value)}
        />

        {searchResults.length > 0 && (
          <div className={styles.navLinks}>
            {searchResults.map((item, index) => (
              <NavBarLinkItem key={index} {...item} />
            ))}
          </div>
        )}

        {searchResults.length === 0 && (
          <Layer className={styles.emptyStateContainer}>
            <Tile className={styles.tile}>
              <div className={styles.illo}>
                <EmptyDataIllustration />
              </div>
              <p className={styles.content}>
                {t('emptyLinkSearchText', `There are no links to display that match ${searchTerm}`)}
              </p>
              <Button kind="ghost" onClick={() => setSearchTerm('')}>
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

type NavBarLinkItemProps = {
  icon: React.ReactNode;
  label: string;
  url: string;
};

const NavBarLinkItem: React.FC<NavBarLinkItemProps> = ({ icon, label, url }) => {
  return (
    <div role="button" tabIndex={0} onClick={() => navigate({ to: url })} className={styles.navLinkItem}>
      {icon}
      <span>{label}</span>
    </div>
  );
};
