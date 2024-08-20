import React from 'react';
import { Button, Header } from '@carbon/react';
import { ArrowLeft, Close } from '@carbon/react/icons';
import { useLayoutType } from '@openmrs/esm-framework';
import styles from './overlay.scss';
import { useTranslation } from 'react-i18next';
import { closeOverlay, useOverlay } from './hook';

const Overlay: React.FC = () => {
  const { header, component, isOverlayOpen } = useOverlay();
  const layout = useLayoutType();
  const { t } = useTranslation();
  return (
    <>
      {isOverlayOpen && (
        <div className={layout !== 'tablet' ? styles.desktopOverlay : styles.tabletOverlay}>
          {layout !== 'tablet' ? (
            <div className={styles.desktopHeader}>
              <div className={styles.headerContent}>{header}</div>
              <Button className={styles.closePanelButton} onClick={() => closeOverlay()} kind="ghost" hasIconOnly>
                <Close size={16} />
              </Button>
            </div>
          ) : (
            <Header
              onClick={() => closeOverlay()}
              aria-label={t('tabletOverlay', 'Tablet overlay')}
              className={styles.tabletOverlayHeader}>
              <Button hasIconOnly>
                <ArrowLeft size={16} />
              </Button>
              <div className={styles.headerContent}>{header}</div>
            </Header>
          )}
          <div>{component}</div>
        </div>
      )}
    </>
  );
};

export default Overlay;
