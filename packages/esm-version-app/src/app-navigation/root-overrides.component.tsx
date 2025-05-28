import { ExtensionSlot } from '@openmrs/esm-framework';
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

/**
 * overides home and nav groups with no comon base i.e linkage, patient services and diagnostics.e.g for linkgae, url aint /home/linkage/services/[pharmacy|peer-calendar|e.t.c]
 * by encapsulating on top of in app defined routes
 *  */
const OverridesRoot = () => {
  const baseName = window.getOpenmrsSpaBase() + 'home';

  return (
    <BrowserRouter basename={baseName}>
      <Routes>
        {/* Home */}
        <Route index element={<ExtensionSlot name="home-dashboard-slot" />} />
        {/* Patient services Routes */}
        <Route path="/appointments/*" element={<ExtensionSlot name="clinical-appointments-dashboard-slot" />} />
        <Route path="/service-queues/*" element={<ExtensionSlot name="service-queues-dashboard-slot" />} />
        {/* Diagnostics routes */}
        <Route path="/lab-manifest/*" element={<ExtensionSlot name="lab-manifest-slot" />} />
        <Route path="/laboratory/*" element={<ExtensionSlot name="laboratory-dashboard-slot" />} />
        <Route path="/procedure/*" element={<ExtensionSlot name="procedure-dashboard-slot" />} />
        <Route path="/imaging-orders/*" element={<ExtensionSlot name="imaging-dashboard-slot" />} />
        {/* Linkage services Routes */}
        <Route path="/pharmacy/*" element={<ExtensionSlot name="pharmacy-dashboard-slot" />} />
        <Route path="/case-management/*" element={<ExtensionSlot name="case-management-dashboard-slot" />} />
        <Route path="/peer-calendar/*" element={<ExtensionSlot name="peer-calendar-dashboard-slot" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default OverridesRoot;
