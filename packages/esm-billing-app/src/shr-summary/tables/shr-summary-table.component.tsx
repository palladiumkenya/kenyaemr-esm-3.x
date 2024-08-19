import { useLayoutType } from '@openmrs/esm-framework';
import { EmptyState } from '@openmrs/esm-patient-common-lib';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface PatientSHRSummartTableProps {}

const PatientSHRSummartTable: React.FC<PatientSHRSummartTableProps> = () => {
  const { t } = useTranslation();
  const [pageSize, setPageSize] = useState(10);
  const layout = useLayoutType();

  return (
    <div>
      <EmptyState displayText={t('Conditopns', 'Conditions')} headerTitle={t('shrRecords', 'SHR Records')} />
    </div>
  );
};

export default PatientSHRSummartTable;
