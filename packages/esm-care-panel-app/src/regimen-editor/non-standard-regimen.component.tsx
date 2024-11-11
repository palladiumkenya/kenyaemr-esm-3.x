import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Select, SelectItem } from '@carbon/react';
import { useStandardRegimen } from '../hooks/useStandardRegimen';
import styles from './standard-regimen.scss';
import { useNonStandardRegimen } from '../hooks/useNonStandardRegimen';
import { Regimen } from '../types';
import { usePatient } from '@openmrs/esm-framework';
import { calculateAge, filterRegimenData } from './utils';

interface NonStandardRegimenProps {
  category: string;
  setNonStandardRegimens: (value: any) => void;
  setStandardRegimenLine: (value: string) => void;
  selectedRegimenType: string;
  visitDate: Date;
  errors: { [key: string]: string };
}

const NonStandardRegimen: React.FC<NonStandardRegimenProps> = ({
  category,
  selectedRegimenType,
  setNonStandardRegimens,
  setStandardRegimenLine,
  visitDate,
  errors,
}) => {
  const { t } = useTranslation();
  const { standardRegimen } = useStandardRegimen();
  const { nonStandardRegimen, isLoading, error } = useNonStandardRegimen();
  const [selectedRegimenLine, setSelectedRegimenLine] = useState('');
  const matchingCategory = standardRegimen.find((item) => item.categoryCode === 'ARV'); // Non standard regimen will be exclusively for ARVs
  const [selectedRegimens, setSelectedRegimens] = useState(Array(5).fill(''));
  const [nonStandardRegimenObjects, setStandardRegimenObjects] = useState([]);
  const { patient } = usePatient();
  const patientAge = calculateAge(patient?.birthDate, visitDate);
  const filteredRegimenLineByAge = filterRegimenData(matchingCategory?.category, patientAge);

  const handleRegimenLineChange = (e) => {
    setSelectedRegimenLine(e.target.value);
    setStandardRegimenLine(e.target.value);
  };

  const handleRegimenChange = (index, value) => {
    const newSelectedRegimens = [...selectedRegimens];
    newSelectedRegimens[index] = value;
    setSelectedRegimens(newSelectedRegimens);
  };

  useEffect(() => {
    const generateRegimenObjects = () => {
      return selectedRegimens
        .map((uuid) => {
          const regimen = nonStandardRegimen.find((r) => r.uuid === uuid);
          if (regimen) {
            return {
              value: regimen.uuid,
              concept: Regimen.nonStandardRegimenConcept,
            };
          }
          return null;
        })
        .filter((obj) => obj);
    };

    setStandardRegimenObjects(generateRegimenObjects());
  }, [selectedRegimens, nonStandardRegimen]);

  useEffect(() => {
    if (selectedRegimenLine) {
      setNonStandardRegimens(nonStandardRegimenObjects);
    }
  }, [selectedRegimenLine, nonStandardRegimenObjects, setNonStandardRegimens]);

  return (
    <div>
      <>
        {selectedRegimenType === 'nonStandardUuid' ? (
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
          <div>
            {errors?.nonStandardRegimens && <div className={styles.errorText}>{errors.nonStandardRegimens}</div>}
            {selectedRegimens?.map((selectedRegimen, index) => {
              const availableRegimens = nonStandardRegimen.filter(
                (regimen) => !selectedRegimens.includes(regimen.uuid) || regimen.uuid === selectedRegimen,
              );

              return (
                <Select
                  key={index}
                  id={`regimen-${index}`}
                  labelText={`Select Drug ${index + 1}`}
                  className={styles.inputContainer}
                  value={selectedRegimen}
                  onChange={(e) => handleRegimenChange(index, e.target.value)}>
                  <SelectItem text={`Select Drug ${index + 1}`} value="" />
                  {availableRegimens.map((regimen) => (
                    <SelectItem key={regimen.name} text={regimen.name} value={regimen.uuid}>
                      {regimen.name}
                    </SelectItem>
                  ))}
                </Select>
              );
            })}
          </div>
        )}
      </>
    </div>
  );
};

export default NonStandardRegimen;
