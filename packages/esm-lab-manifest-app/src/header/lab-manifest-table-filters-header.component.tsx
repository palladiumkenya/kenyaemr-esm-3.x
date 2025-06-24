import { Dropdown } from '@carbon/react';
import { CardHeader } from '@openmrs/esm-patient-common-lib';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { LabManifestFilters } from '../lab-manifest.resources';

type LabManifestTableFilterHeaderProps = {
  title: string;
  onFilterChange: (status: string) => void;
  filter: string;
};

const LabManifestTableFilterHeader: FC<LabManifestTableFilterHeaderProps> = ({ title, onFilterChange, filter }) => {
  const { t } = useTranslation();
  return (
    <CardHeader title={title}>
      <div style={{ padding: '10px' }}>
        <Dropdown
          style={{ minWidth: '300px' }}
          id="manifestStatus"
          onChange={({ selectedItem }) => {
            onFilterChange(LabManifestFilters.find((lb) => lb.value === selectedItem).params);
          }}
          initialSelectedItem={LabManifestFilters.find((lb) => lb.params === filter).value}
          label={t('selectManifestStatus', 'Select manifest status')}
          items={LabManifestFilters.map((mn) => mn.value)}
          itemToString={(item) => LabManifestFilters.find((lm) => lm.value === item)?.label ?? ''}
          titleText={''}
        />
      </div>
    </CardHeader>
  );
};

export default LabManifestTableFilterHeader;
