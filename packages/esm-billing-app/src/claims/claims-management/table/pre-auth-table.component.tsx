import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GenericClaimsDataTable from '../generic-table/generic-table.component';
import styles from './claims-list-table.scss';
import { Tag } from '@carbon/react';
import GenericDataTable from '../../../benefits-package/table/generic_data_table.component';
import { preAuthRows } from './table-mock-up-data';
import useShaData from './hook/table.resource';

const PreAuthTable: React.FC = () => {
  const { t } = useTranslation();
  const shaData = useShaData();

  const headers = [
    { key: 'visitTime', header: t('visitTime', 'Visit Time') },
    { key: 'patientName', header: t('patientName', 'Patient Name') },
    { key: 'preAuthCode', header: t('preAuthCode', 'Pre-Auth Code') },
    { key: 'status', header: t('status', 'Status') },
  ];

  const switchTabs = [
    { name: t('all', 'All'), component: '' },
    { name: t('approved', 'Approved'), component: '' },
    { name: t('rejected', 'Rejected'), component: '' },
    { name: t('pending', 'Pending'), component: '' },
  ];

  const shaHeaders = [
    { key: 'packageCode', header: 'Package Code' },
    { key: 'packageName', header: 'Package Name' },
    { key: 'interventionCode', header: 'Intervention Code' },
    { key: 'interventionName', header: 'Intervention Name' },
    { key: 'shaInterventionTariff', header: 'Intervention Tariff' },
    { key: 'status', header: 'Status' },
  ];

  return (
    <GenericClaimsDataTable
      cardTitle={t('preAuthRequests', 'Pre-auth requests')}
      contentSwitcherTabs={switchTabs}
      rows={preAuthRows}
      headers={headers}
      totalRows={preAuthRows.length}
      renderExpandedRow={() => (
        <div>
          <div className={styles.expanded_row_section}>
            <h4 className={styles.header}> {t('preAuthJustification', 'Pre-auth Justification')}</h4>
            <p className={styles.paragraph}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua.
            </p>
          </div>
          <div className={styles.expanded_row_section}>
            <h4 className={styles.header}> {t('diagnosis', 'Diagnosis')}</h4>
            <Tag className="some-class" type="red">
              <p className={styles.paragraph}>{t('malaria', 'Malaria')}</p>
            </Tag>
          </div>
          <GenericDataTable
            headers={shaHeaders}
            rows={shaData.map((item, index) => ({
              id: `${item.packageCode}-${item.interventionCode}-${index}`,
              ...item,
            }))}
            title={t('benefit', 'Benefits')}
          />
        </div>
      )}
    />
  );
};

export default PreAuthTable;
