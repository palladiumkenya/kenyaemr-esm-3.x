import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePatientEnhancedAdherence } from '../hooks/usePatientEnhancedAdherence';
import { StructuredListSkeleton, InlineLoading, OverflowMenu, OverflowMenuItem, Pagination } from '@carbon/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@carbon/react/lib/components/DataTable';
import { formatDate, parseDate } from '@openmrs/esm-framework';
import { CardHeader, ErrorState, EmptyState } from '@openmrs/esm-patient-common-lib';
import { usePatientSummary } from '../hooks/usePatientSummary';
import styles from './enhanced-adherence.scss';
import { enhancedAdherence } from '..';

type EnhancedAdherenceProps = {
  patientUuid: string;
};

const EnhancedAdherence: React.FC<EnhancedAdherenceProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const headerTitle = t('enhancedadherence', 'Enhanced Adherence');
  const { data, isError } = usePatientSummary(patientUuid);
  const { patientAdherence, error, isLoading, isValidating } = usePatientEnhancedAdherence(patientUuid);
  const latestVl = data?.allVlResults?.value?.reduce((latest, vl) => {
    if (!latest || new Date(vl.vlDate) > new Date(latest.vlDate)) {
      return vl;
    }
    return latest;
  }, null);
  // eslint-disable-next-line no-console
  const headers = [
    {
      header: t('date', 'Date'),
      key: 'date',
    },
    {
      header: t('sessionNumber', 'Session number'),
      key: 'sessionNumber',
    },
    {
      header: t('editForm', 'Edit Adherence Form'),
      key: 'editForm',
    },
  ];
  // eslint-disable-next-line no-console

  const rowData = patientAdherence.map((patientAdherence) => {
    return {
      id: `${patientAdherence.uuid}`,
      date: patientAdherence?.obsDatetime
        ? formatDate(parseDate(patientAdherence?.obsDatetime), { mode: 'wide' })
        : '--',
      sessionNumber: patientAdherence?.value,
    };
  });
  if (isLoading) {
    return <StructuredListSkeleton role="progressbar" />;
  }
  if (error) {
    return <ErrorState headerTitle={headerTitle} error={error} />;
  }
  if (patientAdherence?.length === 0) {
    return <EmptyState headerTitle={headerTitle} displayText={headerTitle} />;
  }

  return (
    <>
      <div className={styles.content}>
        <p className={styles.label}>{t('viralLoad', 'Latest Viral load')}</p>
        {latestVl ? (
          <>
            <span className={styles.value}>{latestVl.vl}</span>
            <span> </span>
            {latestVl.vlDate === 'N/A' || latestVl.vlDate === ' ' ? <span>None</span> : <span>{latestVl.vlDate}</span>}
            <br />
          </>
        ) : (
          '--'
        )}
      </div>
      <CardHeader title={headerTitle}>
        {isValidating && <InlineLoading status="active" iconDescription="Loading" description="Loading data..." />}
      </CardHeader>{' '}
      <Table size="lg" useZebraStyles={false} aria-label="sample table">
        <TableHead>
          <TableRow>
            {headers.map((header) => (
              <TableHeader id={header.key} key={header.key}>
                {header.header}
              </TableHeader>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rowData.map((row) => (
            <TableRow key={row.id}>
              {Object.keys(row)
                .filter((key) => key !== 'id')
                .map((key) => {
                  return <TableCell key={key}>{row[key]}</TableCell>;
                })}
              <OverflowMenu ariaLabel="Actions" size="sm" flipped>
                <OverflowMenuItem itemText={t('editAdherence', 'Edit Adherence')} />
              </OverflowMenu>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default EnhancedAdherence;
