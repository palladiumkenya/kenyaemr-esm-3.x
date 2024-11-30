import React, { useState } from 'react';
import AceEditor, { type IMarker } from 'react-ace';
import 'ace-builds/webpack-resolver';
import debounce from 'lodash-es/debounce';
import { useTranslation } from 'react-i18next';
import { ActionableNotification, Link } from '@carbon/react';
import { ChevronRight, ChevronLeft } from '@carbon/react/icons';
import styles from './schema-editor.scss';

interface MarkerProps extends IMarker {
  text: string;
}

interface SchemaEditorProps {
  isLoading?: boolean;
  validationOn: boolean;
  onSchemaChange: (stringifiedSchema: string) => void;
  stringifiedSchema: string;
  errors: Array<MarkerProps>;
  setErrors: (errors: Array<MarkerProps>) => void;
  setValidationOn: (validationStatus: boolean) => void;
}

const SchemaEditor: React.FC<SchemaEditorProps> = ({
  onSchemaChange,
  stringifiedSchema,
  setErrors,
  errors,
  validationOn,
  setValidationOn,
}) => {
  const { t } = useTranslation();

  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Validate JSON schema
  const validateSchema = (content: string) => {
    try {
      const trimmedContent = content.replace(/\s/g, '');
      // Check if the content is an empty object
      if (trimmedContent.trim() === '{}') {
        // Reset errors since the JSON is considered valid
        setErrors([]);
        return;
      }
    } catch (error) {
      console.error('Error parsing or validating JSON:', error);
    }
  };

  const debouncedValidateSchema = debounce(validateSchema);

  const handleChange = (newValue: string) => {
    setValidationOn(false);
    onSchemaChange(newValue);
    setCurrentIndex(0);
    debouncedValidateSchema(newValue);
  };

  const ErrorNotification = ({ text, line }) => (
    <ActionableNotification
      subtitle={text}
      inline
      title={t('errorOnLine', 'Error on line') + ` ${line + 1}: `}
      kind="error"
      lowContrast
    />
  );

  const onPreviousErrorClick = () => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const onNextErrorClick = () => {
    setCurrentIndex((prevIndex) => Math.min(prevIndex + 1, errors.length - 1));
  };

  const ErrorMessages = () => (
    <div className={styles.validationErrorsContainer}>
      <ErrorNotification text={errors[currentIndex]?.text} line={errors[currentIndex]?.startRow} />
      <div className={styles.pagination}>
        <ChevronLeft
          onClick={onPreviousErrorClick}
          className={currentIndex === 0 ? styles.disabledIcon : styles.paginationIcon}
        />
        <div>
          {currentIndex + 1}/{errors.length}
        </div>
        <ChevronRight
          onClick={onNextErrorClick}
          className={currentIndex === errors.length - 1 ? styles.disabledIcon : styles.paginationIcon}
        />
      </div>
    </div>
  );

  return (
    <div>
      {errors.length && validationOn ? <ErrorMessages /> : null}
      <AceEditor
        style={{ height: '100vh', width: '100%', border: errors.length ? '3px solid #DA1E28' : 'none' }}
        mode="json"
        theme="textmate"
        name="schemaEditor"
        onChange={handleChange}
        fontSize={15}
        showPrintMargin={false}
        showGutter={true}
        highlightActiveLine={true}
        value={stringifiedSchema}
        setOptions={{
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          displayIndentGuides: true,
          enableSnippets: true,
          showLineNumbers: true,
          tabSize: 2,
        }}
        markers={errors}
      />
    </div>
  );
};

export default SchemaEditor;
