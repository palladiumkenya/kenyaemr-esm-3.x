import React, { useState } from 'react';
import { Button } from '@carbon/react';
import { TwoFactorAuthentication, ChevronUp, ChevronDown } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import styles from '../../styling/global.scss';
import DependentsComponent from '../../dependants/dependants.component';
import { LocalResponse, type HIEBundleResponse } from '../../type';
import { convertLocalPatientToFHIR, hasDependents } from '../../helper';
import { PatientPhoto } from '@openmrs/esm-framework';
import { EnhancedPatientBannerPatientInfo } from '../../patient-banner/patient-banner.component';
import { useSHAEligibility } from '../../search-bar/search-bar.resource';

interface HIEDisplayCardProps {
  bundle: HIEBundleResponse;
  bundleIndex: number;
  searchedNationalId: string | null;
}

const HIEDisplayCard: React.FC<HIEDisplayCardProps> = ({ bundle, bundleIndex, searchedNationalId }) => {
  const { t } = useTranslation();
  const { data: eligibilityResponse, isLoading: isEligibilityLoading } = useSHAEligibility(searchedNationalId);
  const [showDependentsForPatient, setShowDependentsForPatient] = useState<Set<string>>(new Set());
  const [localSearchResults, setLocalSearchResults] = useState<LocalResponse | null>(null);

  const toggleDependentsVisibility = (patientId: string) => {
    setShowDependentsForPatient((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(patientId)) {
        newSet.delete(patientId);
      } else {
        newSet.add(patientId);
      }
      return newSet;
    });
  };

  if (!bundle.entry || bundle.entry.length === 0) return null;

  return (
    <>
      {bundle.entry.map((entry, entryIndex) => {
        const patient = entry.resource;
        const patientName =
          patient.name?.[0]?.text ||
          `${patient.name?.[0]?.given?.join(' ') || ''} ${patient.name?.[0]?.family || ''}`.trim() ||
          'Unknown Patient';
        const patientUuid = patient.id;
        const patientKey = `${bundleIndex}-${entryIndex}`;
        const showDependents = showDependentsForPatient.has(patientKey);
        const patientHasDependents = hasDependents(patient);

        const localFHIRPatient =
          localSearchResults && localSearchResults.length > 0 ? convertLocalPatientToFHIR(localSearchResults[0]) : null;
        const hasLocal = !!localFHIRPatient;

        return (
          <div key={patientKey} className={classNames(styles.container)} role="banner">
            <div className={styles.patientInfo}>
              <div className={styles.patientAvatar} role="img">
                <PatientPhoto patientUuid={patientUuid} patientName={patientName} />
              </div>

              <EnhancedPatientBannerPatientInfo
                patient={patient}
                renderedFrom="hie-search"
                eligibilityData={eligibilityResponse || undefined}
                isEligibilityLoading={isEligibilityLoading}
              />
            </div>

            <div className={styles.buttonCol}>
              <div className={styles.actionButtons}>
                {!hasLocal && (
                  <Button kind="primary" size="sm" renderIcon={TwoFactorAuthentication} onClick={() => {}}>
                    {t('sendOtp', 'Send OTP')}
                  </Button>
                )}
                {patientHasDependents && (
                  <Button
                    iconDescription={showDependents ? 'Hide dependents' : 'Show dependents'}
                    kind="secondary"
                    size="sm"
                    onClick={() => toggleDependentsVisibility(patientKey)}
                    renderIcon={showDependents ? ChevronUp : ChevronDown}>
                    {showDependents ? t('showLess', 'Show less') : t('showDependents', 'Show dependents')}
                  </Button>
                )}
              </div>
            </div>

            {showDependents && (
              <div className={styles.dependentsSection}>
                <div className={styles.dependentsContainer}>
                  <DependentsComponent patient={patient} />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};

export default HIEDisplayCard;
