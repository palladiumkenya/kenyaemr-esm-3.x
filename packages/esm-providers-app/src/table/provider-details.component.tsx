import React from 'react';
import styles from './generic-data-table.scss';
import { useTranslation } from 'react-i18next';
import {
  StructuredListWrapper,
  StructuredListHead,
  StructuredListRow,
  StructuredListCell,
  StructuredListBody,
} from '@carbon/react';
import { useUser } from './provider-data-table.resource';

interface ProviderDetailsProps {
  personUuid: string;
  license: string;
}

const ProviderDetails: React.FC<ProviderDetailsProps> = ({ personUuid, license }) => {
  const { t } = useTranslation();
  const { userRoles, error, isLoading } = useUser();

  if (isLoading) {
    return <div>{t('loading', 'Loading...')}</div>;
  }

  if (error) {
    return <div>{t('error', 'Error loading user details')}</div>;
  }

  const userRole = userRoles.find((role) => role.person.uuid === personUuid);
  const person = userRole?.person;
  return (
    <div className={styles.providerDetailsContainer}>
      <p className={styles.title}>{t('WorkerDetails', 'Health Worker details')}</p>

      <div className={styles.providerInfoGrid}>
        <div>
          <p className={styles.gridTitle}>{t('LicenseNumber', 'License Number')}</p>
          <div className={styles.labelContainer}>
            <p className={styles.labelBold}>{t('license', 'License')}: </p>
            <p className={styles.label}>{license}</p>
          </div>
        </div>
        {person && (
          <>
            <div>
              <p className={styles.gridTitle}>{t('PersonDetails', 'Person Details')}</p>
              <div className={styles.labelContainer}>
                <p className={styles.labelBold}>{t('PersonDisplay', 'Person Display')}: </p>
                <p className={styles.label}>{person.display}</p>
              </div>
              <div className={styles.labelContainer}>
                <p className={styles.labelBold}>{t('Gender', 'Gender')}: </p>
                <p className={styles.label}>{person.gender}</p>
              </div>
              <div className={styles.labelContainer}>
                <p className={styles.labelBold}>{t('Attributes', 'Attributes')}: </p>
                <ul className={styles.attributesList}>
                  {person.attributes.map((attr) => (
                    <li key={attr.uuid}>{attr.display}</li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
        <div>
          <p className={styles.gridTitle}>{t('userRoles', 'Roles')}</p>
          <StructuredListWrapper isCondensed>
            <StructuredListHead>
              <StructuredListRow head>
                <StructuredListCell head className={styles.cell}>
                  {t('sNo', 'S.No')}
                </StructuredListCell>
                <StructuredListCell head className={styles.cell}>
                  {t('sysRoles', 'Roles used by the Health Workflow')}
                </StructuredListCell>
              </StructuredListRow>
            </StructuredListHead>
            <StructuredListBody>
              {userRoles.map((role, index) => (
                <StructuredListRow key={role.uuid}>
                  <StructuredListCell className={styles.cell}>{index + 1}</StructuredListCell>
                  <StructuredListCell className={styles.cell}>{role.display}</StructuredListCell>
                </StructuredListRow>
              ))}
            </StructuredListBody>
          </StructuredListWrapper>
        </div>
      </div>
    </div>
  );
};

export default ProviderDetails;
