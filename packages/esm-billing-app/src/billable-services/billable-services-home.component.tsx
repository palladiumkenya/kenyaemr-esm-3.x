import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BillableServicesDashboard } from './dashboard/dashboard.component';
import AddBillableService from './create-edit/add-billable-service.component';
import styles from './billable-services.scss';
import BillingHeader from '../billing-header/billing-header.component';
import BillManager from './bill-manager/bill-manager.component';
import { BillableServicesSideNav } from './billable-services-sidenav.component';
import ManageCommodityPrices from './manage-commodity-price/manage-commodity-price.component';
import BillSummary from './bill-summary/bill-summary.component';

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
            <Route path="/add-service" element={<AddBillableService />} />
            <Route path="/bill-manager" element={<BillManager />} />
            <Route path="/bill-summary" element={<BillSummary />} />
            <Route path="/manage-commodity-prices" element={<ManageCommodityPrices />} />
          </Routes>
        </section>
      </main>
    </BrowserRouter>
  );
};

export default BillableServiceHome;
