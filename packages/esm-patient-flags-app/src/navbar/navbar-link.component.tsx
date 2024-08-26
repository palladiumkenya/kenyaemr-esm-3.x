import React from 'react';
import { navigate } from '@openmrs/esm-framework';
import styles from './navbar-link.scss';
import { useDefaultFacility } from '../hooks/useDefaultFacility';
import dayjs from 'dayjs';
import { Warning } from '@carbon/react/icons';

type NavBarLinkItemProps = {
  icon: React.ReactNode;
  label: string;
  url?: string;
  hideOverlay: (state: boolean) => void;
  onClick?: () => void;
};

const NavBarLink: React.FC<NavBarLinkItemProps> = ({ icon, label, url, hideOverlay, onClick }) => {
  const { defaultFacility } = useDefaultFacility();

  const itemHasError = () => {
    if (label === 'System Info') {
      // Enable once the date is availed
      /* if (!dayjs(defaultFacility?.shaFacilityExpiryDate).isValid()) {
        return true;
      } else {
        return dayjs(defaultFacility?.shaFacilityExpiryDate).isBefore(dayjs());
      }
        */
      return defaultFacility?.operationalStatus !== 'Operational';
    }
    return false;
  };

  const hasError = itemHasError();

  const handleClick = (url) => {
    hideOverlay(false);
    if (!url) {
      return onClick && onClick();
    }
    navigate({ to: url });
  };
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => handleClick(url)}
      className={`${styles.navLinkItem} ${hasError ? styles.warning : ''}`}>
      {hasError && <Warning className={styles.navError} />}
      {icon}
      <span>{label}</span>
    </div>
  );
};

export default NavBarLink;
