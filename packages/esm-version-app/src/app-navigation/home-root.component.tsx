import { ExtensionSlot, useExtensionStore } from '@openmrs/esm-framework';
import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

const HomeRoot = () => {
  const baseName = window.getOpenmrsSpaBase() + 'home';

  return (
    <BrowserRouter basename={baseName}>
      <Routes>
        <Route path="/" element={<ExtensionSlot name="home-dashboard-slot" />} />
        <Route path="/providers/*" element={<ExtensionSlot name="providers-dashboard-slot" />} />
        <Route path="/referrals/*" element={<ExtensionSlot name="referrals-slot" />} />
        <Route path="/bed-admission/*" element={<ExtensionSlot name="bed-admission-dashboard-slot" />} />
        <Route path="/morgue/*" element={<ExtensionSlot name="morgue-dashboard-slot" />} />
        <Route path="/ward/*" element={<ExtensionSlot name="ward-dashboard-slot" />} />
        {/* Patient services Routes */}
        <Route path="/appointments/*" element={<ExtensionSlot name="clinical-appointments-dashboard-slot" />} />
        <Route path="/service-queues/*" element={<ExtensionSlot name="service-queues-dashboard-slot" />} />
        {/* Diagnostics routes */}
        <Route path="/lab-manifest/*" element={<ExtensionSlot name="lab-manifest-slot" />} />
        <Route path="/laboratory/*" element={<ExtensionSlot name="laboratory-dashboard-slot" />} />
        <Route path="/procedure/*" element={<ExtensionSlot name="procedure-dashboard-slot" />} />
        <Route path="/imaging-orders/*" element={<ExtensionSlot name="imaging-dashboard-slot" />} />
        {/* lINKAGE services Routes */}
        <Route path="/pharmacy/*" element={<ExtensionSlot name="pharmacy-dashboard-slot" />} />
        <Route path="/case-management/*" element={<ExtensionSlot name="case-management-dashboard-slot" />} />
        <Route path="/peer-calendar/*" element={<ExtensionSlot name="peer-calendar-dashboard-slot" />} />
        {/* Billing routes */}
        <Route path="/billing/*" element={<ExtensionSlot name="billing-dashboard-slot" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default HomeRoot;
