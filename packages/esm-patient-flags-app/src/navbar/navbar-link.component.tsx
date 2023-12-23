import React from 'react';
import { navigate } from '@openmrs/esm-framework';
import styles from './navbar-link.scss';

type NavBarLinkItemProps = {
  icon: React.ReactNode;
  label: string;
  url?: string;
  hideOverlay: (state: boolean) => void;
  onClick?: () => void;
};

const NavBarLink: React.FC<NavBarLinkItemProps> = ({ icon, label, url, hideOverlay, onClick }) => {
  const handleClick = (url) => {
    hideOverlay(false);
    if (!url) {
      return onClick && onClick();
    }
    navigate({ to: url });
  };
  return (
    <div role="button" tabIndex={0} onClick={() => handleClick(url)} className={styles.navLinkItem}>
      {icon}
      <span>{label}</span>
    </div>
  );
};

export default NavBarLink;
