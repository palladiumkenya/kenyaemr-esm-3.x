import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Select, SelectItem } from '@carbon/react';
import { useStandardRegimen } from '../hooks/useStandardRegimen';
import styles from './standard-regimen.scss';
import { usePatient } from '@openmrs/esm-framework';
import { calculateAge, filterRegimenData } from './utils';

interface StandardRegimenProps {
  category: string;
  setStandardRegimen: (value: string) => void;
  setStandardRegimenLine: (value: string) => void;
  selectedRegimenType: string;
  visitDate: Date;
  errors: { [key: string]: string };
}

const StandardRegimen: React.FC<StandardRegimenProps> = ({
  category,
  setStandardRegimen,
  setStandardRegimenLine,
  selectedRegimenType,
  visitDate,
  errors,
}) => {
  const { t } = useTranslation();
  const { standardRegimen, isLoading, error } = useStandardRegimen();

  const [selectedRegimenLine, setSelectedRegimenLine] = useState('');
  const [selectedRegimen, setSelectedRegimen] = useState('');
  const [selectedRegimens, setSelectedRegimens] = useState([]);
  const matchingCategory = standardRegimen.find((item) => item.categoryCode === category);
  const { patient } = usePatient();
  const patientAge = calculateAge(patient?.birthDate, visitDate);
  const filteredRegimenLineByAge = filterRegimenData(matchingCategory?.category, patientAge);

  useEffect(() => {
    const matchingRegimenLine = matchingCategory?.category.find(
      (line) => line.regimenLineValue === selectedRegimenLine,
    );
    if (matchingRegimenLine) {
      setSelectedRegimens(matchingRegimenLine.regimen);
    } else {
      setSelectedRegimens([]);
    }
  }, [selectedRegimenLine, standardRegimen, matchingCategory]);

  const handleRegimenLineChange = (e) => {
    setSelectedRegimenLine(e.target.value);
    setStandardRegimenLine(e.target.value);
    setSelectedRegimen(''); // Reset selected regimen when regimen line changes
  };

  const handleRegimenChange = (e) => {
    setSelectedRegimen(e.target.value);
    setStandardRegimen(e.target.value);
  };

  return (
    <div>
      <>
        {selectedRegimenType === 'standardUuid' ? (
          <Select
            id="regimenLine"
            invalid={!!errors?.standardRegimenLine}
            invalidText={errors?.standardRegimenLine}
            labelText={t('selectRegimenLine', 'Select Regimen Line')}
            className={styles.inputContainer}
            value={selectedRegimenLine}
            onChange={handleRegimenLineChange}>
            {!selectedRegimenLine || selectedRegimenLine == '--' ? (
              <SelectItem text={t('selectRegimenLine', 'Select Regimen Line')} value="" />
            ) : null}
            {filteredRegimenLineByAge?.map((line) => (
              <SelectItem key={line.regimenline} text={line.regimenline} value={line.regimenLineValue}>
                {line.regimenline}
              </SelectItem>
            ))}
          </Select>
        ) : null}

        {selectedRegimenLine && (
          <Select
            id="regimen"
            invalid={!!errors?.standardRegimen}
            invalidText={errors?.standardRegimen}
            labelText={t('selectRegimen', 'Select Regimen')}
            className={styles.inputContainer}
            value={selectedRegimen}
            onChange={handleRegimenChange}>
            {!selectedRegimen || selectedRegimen == '--' ? (
              <SelectItem text={t('selectRegimen', 'Select Regimen')} value="" />
            ) : null}
            {selectedRegimens?.map((regimen) => (
              <SelectItem key={regimen.conceptRef} text={regimen.name} value={regimen.conceptRef}>
                {regimen.name}
              </SelectItem>
            ))}
          </Select>
        )}
      </>
    </div>
  );
};

export default StandardRegimen;
