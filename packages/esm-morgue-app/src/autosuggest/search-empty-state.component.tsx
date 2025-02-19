import { Button, Tile } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { EmptyDataIllustration } from '@openmrs/esm-patient-common-lib';
import React from 'react';
import styles from './search-empty-state.scss';

type SearchEmptyStateProps = {
  searchValue?: string;
  message: string;
};

const SearchEmptyState: React.FC<SearchEmptyStateProps> = ({ searchValue, message }) => {
  return (
    <Tile className={styles.container}>
      <EmptyDataIllustration height="50" width="50" />
      <p>{message}</p>
    </Tile>
  );
};

export default SearchEmptyState;
