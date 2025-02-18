import React, { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import type { IMarker } from 'react-ace';
import {
  Button,
  Column,
  Grid,
  InlineLoading,
  InlineNotification,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@carbon/react';
import SchemaEditor from '../billable-exemptions/schema-editor/schema-editor.component';
import SchemaViewer from '../billable-exemptions/schema-editor/schema-viewer-component';
import { useSystemBillableSetting } from '../../hooks/useExemptionSchema';
import ActionButtons from '../billable-exemptions/action-buttons/action-buttons.component';
import { EmptyState } from '@openmrs/esm-patient-common-lib';
import type { Schema } from '../../types';
import styles from './billable-exemptions.scss';

interface MarkerProps extends IMarker {
  text: string;
}

const ErrorNotification = ({ error, title }: { error: Error; title: string }) => (
  <InlineNotification
    className={styles.errorNotification}
    kind="error"
    lowContrast
    subtitle={error?.message}
    title={title}
  />
);

export const BillableExemptionsViewer = () => {
  const { t } = useTranslation();
  const { billableExceptionResource, isLoading, error } = useSystemBillableSetting('kenyaemr.billing.exemptions');
  const billableExceptionSchema = billableExceptionResource?.value ?? '';

  const [schema, setSchema] = useState<Schema | null>(null);
  const [stringifiedSchema, setStringifiedSchema] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [invalidJsonErrorMessage, setInvalidJsonErrorMessage] = useState('');
  const [errors, setErrors] = useState<Array<MarkerProps>>([]);
  const [validationOn, setValidationOn] = useState(true);

  const resetErrorMessage = useCallback(() => setInvalidJsonErrorMessage(''), []);

  const handleSchemaChange = useCallback(
    (updatedSchema: string) => {
      resetErrorMessage();
      setStringifiedSchema(updatedSchema);

      try {
        const parsedSchema = JSON.parse(updatedSchema);
        setSchema(parsedSchema);
      } catch (error) {
        setInvalidJsonErrorMessage(t('invalidJsonError', 'Invalid JSON input.'));
      }
    },
    [resetErrorMessage, t],
  );

  const updateSchema = useCallback(
    (updatedSchema: Schema) => {
      try {
        setSchema(updatedSchema);
        setStringifiedSchema(JSON.stringify(updatedSchema, null, 2));
      } catch (error) {
        setInvalidJsonErrorMessage(t('saveError', 'Failed to save schema.'));
      }
    },
    [t],
  );

  useEffect(() => {
    if (billableExceptionSchema) {
      try {
        const parsedSchema: Schema = JSON.parse(billableExceptionSchema);
        setSchema(parsedSchema);
        setStringifiedSchema(JSON.stringify(parsedSchema, null, 2));
      } catch (error) {
        setInvalidJsonErrorMessage(t('invalidJsonError', 'Invalid JSON received for the schema.'));
      }
    }
  }, [billableExceptionSchema, t]);

  const inputDummySchema = useCallback(() => {
    const dummySchema = {
      services: {
        all: [
          { concept: '856000001122243', description: 'HIV Viral Load' },
          { concept: '167441', description: 'PCR' },
          { concept: '162202', description: 'GeneXpert' },
        ],
        'program:HIV': [{ concept: '1000051', description: 'Registration' }],
        'program:TB': [{ concept: '162202', description: 'GeneXpert' }],
        'age<5': [{ concept: '32', description: 'Malaria Smear' }],
        'visitAttribute:prisoner': [{ concept: '32', description: 'Malaria Smear' }],
      },
      commodities: {},
    };

    setStringifiedSchema(JSON.stringify(dummySchema, null, 2));
    updateSchema(dummySchema);
  }, [updateSchema]);

  const handleTabChange = (event) => {
    setSelectedIndex(event.selectedIndex);
  };

  return (
    <div className={styles.container}>
      <Grid className={classNames(styles.grid)}>
        <Column lg={16} md={16} className={styles.column}>
          <div className={styles.actionButtons}>
            {isLoading ? <InlineLoading description={`${t('loadingSchema', 'Loading schema')}...`} /> : ''}
          </div>
          <div className={styles.heading}>
            <span className={styles.tabHeading}>{t('schemaEditor', 'Exemptions Schema Editor')}</span>
            <div className={styles.topBtns}>
              {!schema && selectedIndex === 1 && (
                <Button kind="ghost" onClick={inputDummySchema}>
                  {t('inputSampleSchema', 'Input sample schema')}
                </Button>
              )}
              {schema && selectedIndex === 1 && <ActionButtons schema={schema} />}
            </div>
          </div>
          {error && <ErrorNotification error={error} title={t('schemaLoadError', 'Error loading schema')} />}
          <Tabs onChange={handleTabChange} selected={selectedIndex}>
            <TabList aria-label="Schema previews">
              <Tab>{t('preview', 'Schema Preview')}</Tab>
              <Tab>{schema ? t('editSchema', 'Edit Schema') : t('addSchema', 'Add Schema')}</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                {stringifiedSchema ? (
                  <SchemaViewer data={stringifiedSchema} />
                ) : (
                  <div className={styles.emptyStateWrapper}>
                    <EmptyState
                      displayText={t('noSchemaExemption', 'No schema available add exemption schema')}
                      headerTitle={t('noSchema', 'No schema available')}
                    />
                  </div>
                )}
              </TabPanel>
              <TabPanel>
                <div className={styles.editorContainer}>
                  <SchemaEditor
                    errors={errors}
                    isLoading={isLoading}
                    onSchemaChange={handleSchemaChange}
                    setErrors={setErrors}
                    setValidationOn={setValidationOn}
                    stringifiedSchema={stringifiedSchema}
                    validationOn={validationOn}
                  />
                </div>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Column>
      </Grid>
    </div>
  );
};
