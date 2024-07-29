import { SideNav, SideNavLink, SideNavItems } from '@carbon/react';
import { Wallet, Money } from '@carbon/react/icons';
import { navigate, UserHasAccess } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

const basePath = `${window.spaBase}/billable-services`;

export const BillableServicesSideNav = () => {
  const handleNavigation = (path: string) => {
    navigate({ to: `${basePath}/${path}` });
  };

  const { pathname } = useLocation();
  const { t } = useTranslation();

  return (
    <section>
      <SideNav>
        <SideNavItems>
          <SideNavLink onClick={() => handleNavigation('')} renderIcon={Wallet} isActive={pathname === '/'}>
            {t('billableServices', 'Billable Services')}
          </SideNavLink>
          <UserHasAccess privilege="coreapps.systemAdministration">
            <SideNavLink
              onClick={() => handleNavigation('bill-manager')}
              renderIcon={Money}
              isActive={pathname.includes('bill-manager')}>
              {t('billManager', 'Bill Manager')}
            </SideNavLink>
          </UserHasAccess>
        </SideNavItems>
      </SideNav>
    </section>
  );
};
