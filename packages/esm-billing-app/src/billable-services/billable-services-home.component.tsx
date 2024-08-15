import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BillableServicesDashboard } from './dashboard/dashboard.component';
import AddBillableService from './create-edit/add-billable-service.component';
import styles from './billable-services.scss';
import BillingHeader from '../billing-header/billing-header.component';
import BillManager from './bill-manager/bill-manager.component';
import { BillableServicesSideNav } from './billable-services-sidenav.component';
import { navigate, showModal } from '@openmrs/esm-framework';
import { ServiceConcept } from '../types';

const BillableServiceHome: React.FC = () => {
  const { t } = useTranslation();
  const [selectedService, setSelectedService] = useState({ service: null, uuid: null });
  const [selectedConcept, setSelectedConcept] = useState(null);

  function getPayments(prices) {
    let payments = [];
    if (prices.length > 0) {
      prices.forEach((element) => {
        payments.push({
          uuid: element.uuid,
          paymentMode: element.paymentMode?.uuid,
          price: element.price,
        });
      });
    }
    return payments;
  }

  const handleEditService = (service) => {
    let serviceData = {
      serviceName: service?.name,
      shortName: service?.shortName,
      serviceTypeName: service?.serviceType?.uuid,
      concept: service.concept?.uuid,
      payment: getPayments(service?.servicePrices),
    };
    setSelectedService({ service: serviceData, uuid: service.uuid });
    setSelectedConcept(service?.concept);
    navigate({ to: window.getOpenmrsSpaBase() + 'billable-services/edit-service' });
  };

  const handleDeleteService = (service) => {
    const dispose = showModal('soft-delete-billableservice-modal', {
      onClose: () => dispose(),
      service: service,
    });
  };

  return (
    <BrowserRouter basename={`${window.spaBase}/billable-services`}>
      <main className={styles.mainSection}>
        <BillableServicesSideNav />
        <section>
          <BillingHeader title={t('billServicesManagement', 'Bill services management')} />
          <Routes>
            <Route
              path="/"
              element={
                <BillableServicesDashboard onEditService={handleEditService} onDeleteService={handleDeleteService} />
              }
            />
            <Route path="/add-service" element={<AddBillableService />} />
            <Route
              path="/edit-service"
              element={
                <AddBillableService
                  serviceId={selectedService.uuid}
                  serviceConcept={selectedConcept}
                  initialValues={selectedService.service}
                />
              }
            />
            <Route path="/bill-manager" element={<BillManager />} />
          </Routes>
        </section>
      </main>
    </BrowserRouter>
  );
};

export default BillableServiceHome;
