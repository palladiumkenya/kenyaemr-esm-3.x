import React from 'react';
import { useLeftNav, WorkspaceContainer } from '@openmrs/esm-framework';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import QueuesAdminPage from './queue-admin-page.component';

const QueuesAdminHome: React.FC = () => {
  const queuesBasePath = window.getOpenmrsSpaBase() + 'queues-admin';
  useLeftNav({ name: 'service-queues-dashboard-slot', basePath: queuesBasePath });

  return (
    <BrowserRouter basename={queuesBasePath}>
      <main>
        <Routes>
          <Route path="/" element={<QueuesAdminPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
};

export default QueuesAdminHome;
