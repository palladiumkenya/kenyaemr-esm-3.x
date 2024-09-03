import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BillableServicesDashboard } from './dashboard/dashboard.component';
import styles from './clinical-charges.scss';
import BillingHeader from '../billing-header/billing-header.component';
import BillManager from './bill-manager/bill-manager.component';
import { BillableServicesSideNav } from './billable-services-sidenav.component';
import ManageCommodityPrices from './manage-commodity-price/manage-commodity-price.component';
import PaymentHistoryViewer from './payment-history/payment-history-viewer.component';

const BillableServiceHome: React.FC = () => {
  const { t } = useTranslation();

  return (
    <BrowserRouter basename={`${window.spaBase}/billable-services`}>
      <main className={styles.mainSection}>
        <BillableServicesSideNav />
        <section>
          <BillingHeader title={t('billServicesManagement', 'Bill services management')} />
          <Routes>
            <Route path="/" element={<BillableServicesDashboard />} />
            <Route path="/bill-manager" element={<BillManager />} />
            <Route path="/payment-history" element={<PaymentHistoryViewer />} />
            <Route path="/manage-commodity-prices" element={<ManageCommodityPrices />} />
          </Routes>
        </section>
      </main>
    </BrowserRouter>
  );
};

export default BillableServiceHome;
