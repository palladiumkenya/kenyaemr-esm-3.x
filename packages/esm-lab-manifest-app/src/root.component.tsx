import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import LabManifestDetail from './component/lab-manifest-detail.component';
import { useConfig, useLeftNav } from '@openmrs/esm-framework';
import { LabManifestConfig } from './config-schema';
import Dashboard from './dashboard/home-dashboard.component';

const LeftNavController: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const spaBasePath = `${window.spaBase}/lab-manifest`;
  const { leftNavMode: configLeftNavMode } = useConfig<LabManifestConfig>();
  const [currentLeftNavMode, setCurrentLeftNavMode] = useState<'normal' | 'collapsed' | 'hidden'>(configLeftNavMode);

  useEffect(() => {
    const isDetailPage = location.pathname.includes('/lab-manifest/detail/');

    if (isDetailPage) {
      setCurrentLeftNavMode('hidden');
    } else {
      setCurrentLeftNavMode(configLeftNavMode);
    }
  }, [location.pathname, configLeftNavMode]);

  useLeftNav({
    name: 'lab-manifest-page-dashboard-slot',
    basePath: spaBasePath,
    mode: currentLeftNavMode,
  });

  return <>{children}</>;
};

const Root: React.FC = () => {
  return (
    <main>
      <BrowserRouter basename={window.spaBase}>
        <LeftNavController>
          <Routes>
            <Route path="/lab-manifest/detail/:manifestUuid" element={<LabManifestDetail />} />
            <Route path="/lab-manifest/:dashboard" element={<Dashboard />} />
            <Route path="/lab-manifest" element={<Dashboard />} />
          </Routes>
        </LeftNavController>
      </BrowserRouter>
    </main>
  );
};

export default Root;
