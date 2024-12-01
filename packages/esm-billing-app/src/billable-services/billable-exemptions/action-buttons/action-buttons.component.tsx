import React from 'react';
import SaveSchemamModal from '../modals/save-schema.modal';
import type { Schema } from '../../../types';
import styles from './action-buttons.scss';

interface ActionButtonsProps {
  schema: Schema;
}

function ActionButtons({ schema }: ActionButtonsProps) {
  return (
    <div className={styles.actionButtons}>
      <SaveSchemamModal schema={schema} />
    </div>
  );
}

export default ActionButtons;
