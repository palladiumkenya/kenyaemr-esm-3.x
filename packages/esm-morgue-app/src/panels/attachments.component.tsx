import React from 'react';
import { ExtensionSlot, navigate, usePatient } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@openmrs/esm-patient-common-lib';

const AttachmentView: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      <EmptyState displayText={'attachments'} headerTitle={t('attachment', 'Attachments')} />
    </div>
  );
};

export default AttachmentView;
