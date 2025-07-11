import React from 'react';
import { useTranslation } from 'react-i18next';
import { type LocationResponse } from '../types';
import { Tag, Tile } from '@carbon/react';
import { Hospital } from '@carbon/pictograms-react';
import styles from './results-tile.scss';
import { Close } from '@carbon/react/icons';

interface ResultsTileProps {
  location?: LocationResponse;
  onClose?: () => void;
}

const ResultsTile: React.FC<ResultsTileProps> = ({ location, onClose }) => {
  const { t } = useTranslation();

  return (
    <Tile className={styles.tile}>
      <div className={styles.tileContent}>
        {onClose && <Close size={16} className={styles.closeIcon} onClick={onClose} />}
        <Hospital className={styles.illustrationPictogram} />
        <div className={styles.details}>
          <div style={{ fontWeight: 'bold' }}>{location.display || location.name}</div>
          {location.description && <div style={{ fontSize: '0.875rem', color: '#666' }}>{location.description}</div>}
          {(location.stateProvince || location.country) && (
            <div style={{ fontSize: '0.75rem', color: '#888' }}>
              {[location.stateProvince, location.country].filter(Boolean).join(', ')}
            </div>
          )}
          {location.tags && (
            <div style={{ fontSize: '0.75rem', color: '#888' }}>
              {location.tags.map((tag, index) => (
                <Tag key={index} className={styles.tag}>
                  {tag.display || tag.name}
                </Tag>
              ))}
            </div>
          )}
        </div>
      </div>
    </Tile>
  );
};

export default ResultsTile;
