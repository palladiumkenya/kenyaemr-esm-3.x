import { Button, Layer, Tile } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';
import {
  CardHeader,
  EmptyDataIllustration,
  EmptyState,
  getPatientUuidFromUrl,
  launchPatientWorkspace,
} from '@openmrs/esm-patient-common-lib';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InsurersBenefits, PatientBenefit } from '../../types';
import styles from './benebfits-table.scss';
import GenericDataTable from './generic_data_table.component';
import useEligibleBenefits from '../../hooks/useEligibleBenefits';

const BenefitsTable = () => {
  const { t } = useTranslation();
  const patientUuid = getPatientUuidFromUrl();
  const [eligible, setEligible] = useState(true);
  const headerTitle = t('benefits', 'Benefits');
  const paientUuid = getPatientUuidFromUrl();
  const { benefits } = useEligibleBenefits(patientUuid);
  const [eligibleBenefits, setEligibleBenefits] = useState<Array<InsurersBenefits>>(benefits);

  const handleLaunchRequestEligibility = () => {
    launchPatientWorkspace('benefits-eligibility-request-form', {
      workspaceTitle: 'Benefits Eligibility Request Form',
      patientUuid,
      onSuccess: (benefits: Array<InsurersBenefits>) => {
        setEligibleBenefits(benefits);
        setEligible(true);
      },
    });
  };

  if (!eligible) {
    return (
      <div>
        <Layer>
          <Tile className={styles.tile}>
            <CardHeader title={headerTitle}>
              <Button
                kind="ghost"
                renderIcon={ArrowRight}
                onClick={handleLaunchRequestEligibility}
                className={styles.btnOutline}>
                {t('requestEligibility', 'Request Eligibility')}
              </Button>
            </CardHeader>
            <EmptyDataIllustration />
            <p className={styles.content}>{t('noBenefits', 'No benefit packages, request eligibility')}</p>
            <Button onClick={handleLaunchRequestEligibility} renderIcon={ArrowRight} kind="ghost">
              {t('requestEligibility', 'Request Eligibility')}
            </Button>
          </Tile>
        </Layer>
      </div>
    );
  }
  if (eligibleBenefits.length === 0) {
    return <EmptyState headerTitle={headerTitle} displayText={headerTitle} />;
  }

  const headers = [
    {
      key: 'packageCode',
      header: 'Package Code',
    },
    {
      key: 'packageName',
      header: 'Package Name',
    },
    {
      key: 'insurer',
      header: 'Insurer',
    },
    {
      key: 'interventionCode',
      header: 'Intervention Code',
    },
    {
      key: 'interventionName',
      header: 'Intervention Name',
    },
    {
      key: 'interventionTariff',
      header: 'Tariff',
    },
    {
      key: 'pendingAmount',
      header: 'Pending amount',
    },
    {
      key: 'status',
      header: 'Approval status',
    },
    {
      key: 'action',
      header: 'Action',
    },
  ];

  const handleLaunchPreAuthForm = (benefit: PatientBenefit) => {
    // benefits-pre-auth-form
    launchPatientWorkspace('benefits-pre-auth-form', {
      workspaceTitle: 'Benefits Pre-Auth Form',
      patientUuid,
      benefit,
      benefits: eligibleBenefits,
      onSuccess: (benefits) => {
        setEligibleBenefits(benefits);
      },
    });
  };

  const rows = eligibleBenefits.map((benefit) => ({
    id: benefit.packageCode,
    ...benefit,
    status: benefit.requirePreauth ? benefit.status : 'Approved',
    action:
      benefit.requirePreauth && benefit.status === 'Pending' ? (
        <Button renderIcon={ArrowRight} onClick={() => handleLaunchPreAuthForm(benefit)}>
          Pre-Auth
        </Button>
      ) : (
        '--'
      ),
  }));

  return (
    <GenericDataTable
      rows={rows}
      headers={headers}
      title={t('benefits', 'Benefits')}
      renderActionComponent={() => (
        <Button
          kind="ghost"
          renderIcon={ArrowRight}
          onClick={handleLaunchRequestEligibility}
          // className={styles.btnOutline}
        >
          {t('requestEligibility', 'Pull Eligibility')}
        </Button>
      )}
    />
  );
};

export default BenefitsTable;
