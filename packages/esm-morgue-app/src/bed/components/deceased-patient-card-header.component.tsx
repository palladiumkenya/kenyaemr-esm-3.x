import React from 'react';
import { Tag, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import startCase from 'lodash-es/startCase';
import { useTranslation } from 'react-i18next';
import { type EnhancedPatient, PatientCardProps } from '../../types';
import { ExtensionSlot } from '@openmrs/esm-framework';
import styles from '../bed.scss';
import { Tag as TagIcon } from '@carbon/react/icons';

interface PatientCardHeaderProps {
  patient: EnhancedPatient;
  showActions: PatientCardProps['showActions'];
  onAction: (actionType: string) => void;
}

const DeceasedPatientCardHeader: React.FC<PatientCardHeaderProps> = ({ patient, showActions, onAction }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.tileHeader}>
      <div className={styles.tagContainer}>
        {patient.bedInfo?.bedNumber ? (
          <Tag type="cool-gray" className={styles.bedNumberTag}>
            {patient.bedInfo.bedNumber}
          </Tag>
        ) : (
          !patient.isDischarged && (
            <Tag type="cool-gray" className={styles.bedNumberTag}>
              {t('awaiting', 'Awaiting')}
            </Tag>
          )
        )}
        {patient.isDischarged && (
          <Tag type="blue" className={styles.statusTag}>
            {t('discharged', 'Discharged')}
          </Tag>
        )}
        <TagIcon className={styles.tagIcon} />
      </div>

      <div>
        {patient.bedInfo?.bedType && <Tag type="green">{startCase(patient.bedInfo.bedType)}</Tag>}

        <OverflowMenu flipped>
          {showActions.admit && <OverflowMenuItem onClick={() => onAction('admit')} itemText={t('admit', 'Admit')} />}
          {showActions.viewDetails && (
            <OverflowMenuItem onClick={() => onAction('viewDetails')} itemText={t('viewDetails', 'View details')} />
          )}
          {patient.isDischarged && (
            <ExtensionSlot name="print-post-mortem-overflow-menu-item-slot" state={{ patientUuid: patient.uuid }} />
          )}
          {showActions.discharge && (
            <OverflowMenuItem onClick={() => onAction('discharge')} itemText={t('discharge', 'Discharge')} />
          )}
          {showActions.swapCompartment && (
            <OverflowMenuItem
              onClick={() => onAction('swapCompartment')}
              itemText={t('swapCompartment', 'Swap Compartment')}
            />
          )}
          {showActions.postmortem && (
            <OverflowMenuItem onClick={() => onAction('postmortem')} itemText={t('postmortem', 'Postmortem')} />
          )}
          {showActions.printGatePass && (
            <OverflowMenuItem onClick={() => onAction('printGatePass')} itemText={t('printGatePass', 'Gate Pass')} />
          )}
        </OverflowMenu>
      </div>
    </div>
  );
};

export default DeceasedPatientCardHeader;
