import { Tile, Layer } from '@carbon/react';
import { ChevronSort, StopSignFilled, UpToTop } from '@carbon/react/icons';
import React, { PropsWithChildren, ReactNode } from 'react';
import styles from './expansion-pannel.scss';

interface ExpansionTileProps extends PropsWithChildren {
  title: string;
  subTitles: Array<string>;
  leading?: ReactNode;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

const ExpansionTile: React.FC<ExpansionTileProps> = (props) => {
  return (
    <Layer className={styles.expansionTileLayer}>
      <Layer className={styles.treeviewItemContainer}>
        <StopSignFilled size={10} className={styles.treeColor} />
        <ExpansionTileHeader {...props} />
      </Layer>
      {props.expanded && (
        <Layer className={styles.blGray}>
          <Tile className={styles.expansionTileChildrenContainer}>{props.children}</Tile>
        </Layer>
      )}
    </Layer>
  );
};

export default ExpansionTile;

const ExpansionTileHeader: React.FC<ExpansionTileProps> = ({
  subTitles,
  title,
  children,
  leading,
  expanded,
  onExpandedChange,
}) => {
  return (
    <Tile className={styles.expansionTileRowContainer} onClick={() => onExpandedChange?.(!expanded)}>
      {leading}
      <strong>{title}</strong>
      <span>
        <StopSignFilled size={5} className={styles.subtitleColor} />
      </span>
      {subTitles
        .join('___.___')
        .split('___')
        .map((element, index) => (
          <span key={index} className={styles.subtitleColor}>
            {element === '.' ? <StopSignFilled size={5} className={styles.subtitleColor} /> : element}
          </span>
        ))}
      {expanded ? <UpToTop /> : <ChevronSort />}
    </Tile>
  );
};
