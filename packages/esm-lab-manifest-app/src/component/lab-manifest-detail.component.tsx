import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import LabManifestDetailHeader from '../header/lab-manifest-detail-header.component';
import { LabManifestHeader } from '../header/lab-manifest-header.component';
import { LabManifestTabs } from '../tabs/lab-manifest-tabs-component';

const LabManifestDetail = () => {
  const { manifestUuid } = useParams();
  const { t } = useTranslation();

  return (
    <div>
      <LabManifestHeader title={t('labManifest', 'Lab Manifest')} />
      <LabManifestDetailHeader manifestUuid={manifestUuid} />
      <LabManifestTabs manifestUuid={manifestUuid} />
    </div>
  );
};

export default LabManifestDetail;
