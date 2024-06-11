import React from 'react';
import styles from './result-form.scss';
import { TextInput, Select, SelectItem } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { ConceptReference } from './result-form.resource';
import { Controller } from 'react-hook-form';
import { min } from 'rxjs/operators';

interface ResultFormFieldProps {
  concept: ConceptReference;
  control: any;
  register: any;
  errors: any;
}
const ResultFormField: React.FC<ResultFormFieldProps> = ({ concept, control, errors }) => {
  const { t } = useTranslation();
  const isTextOrNumeric = (concept) => concept.datatype?.display === 'Text' || concept.datatype?.display === 'Numeric';
  const isCoded = (concept) => concept.datatype?.display === 'Coded';
  const isPanel = (concept) => concept.setMembers?.length > 0;

  const printValueRange = (concept: ConceptReference) => {
    if (concept?.datatype?.display === 'Numeric') {
      const maxVal = Math.max(concept?.hiAbsolute, concept?.hiCritical, concept?.hiNormal);
      const minVal = Math.min(concept?.lowAbsolute, concept?.lowCritical, concept?.lowNormal);
      return ` (${minVal ?? 0} - ${maxVal > 0 ? maxVal : '--'} ${concept?.units ?? ''})`;
    }
    return '';
  };

  return (
    <>
      {Object.keys(errors).length > 0 && <div className={styles.errorDiv}>All fields are required</div>}
      {isTextOrNumeric(concept) && (
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          name={concept.uuid}
          render={({ field }) => (
            <TextInput
              key={concept.uuid}
              className={styles.textInput}
              {...field}
              type={concept.datatype.display === 'Numeric' ? 'number' : 'text'}
              labelText={
                concept?.display + (concept.datatype.display === 'Numeric' ? printValueRange(concept) ?? '' : '')
              }
              autoFocus
            />
          )}
        />
      )}

      {isCoded(concept) && (
        <Controller
          name={concept.uuid}
          control={control}
          rules={{
            required: true,
          }}
          render={({ field }) => (
            <Select
              key={concept.uuid}
              className={styles.textInput}
              {...field}
              type="text"
              labelText={concept?.display}
              rules={{ required: true }}>
              <SelectItem text={t('option', 'Choose an Option')} value="" />

              {concept?.answers?.map((answer) => (
                <SelectItem key={answer.uuid} text={answer.display} value={answer.uuid}>
                  {answer.display}
                </SelectItem>
              ))}
            </Select>
          )}
        />
      )}

      {isPanel(concept) &&
        concept.setMembers.map((member, index) => {
          if (isTextOrNumeric(member)) {
            return (
              <Controller
                control={control}
                name={member.uuid}
                rules={{
                  required: true,
                }}
                render={({ field }) => (
                  <TextInput
                    key={member.uuid}
                    className={styles.textInput}
                    {...field}
                    type={member.datatype.display === 'Numeric' ? 'number' : 'text'}
                    labelText={
                      member?.display + (member.datatype.display === 'Numeric' ? printValueRange(member) ?? '' : '')
                    }
                    autoFocus={index === 0}
                  />
                )}
              />
            );
          }

          if (isCoded(member)) {
            return (
              <Controller
                name={member.uuid}
                control={control}
                rules={{
                  required: true,
                }}
                render={({ field }) => (
                  <Select
                    key={member.uuid}
                    className={styles.textInput}
                    {...field}
                    type="text"
                    labelText={member?.display}
                    autoFocus={index === 0}>
                    <SelectItem text={t('option', 'Choose an Option')} value="" />

                    {member?.answers?.map((answer) => (
                      <SelectItem key={answer.uuid} text={answer.display} value={answer.uuid}>
                        {answer.display}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />
            );
          }
        })}
    </>
  );
};

export default ResultFormField;
