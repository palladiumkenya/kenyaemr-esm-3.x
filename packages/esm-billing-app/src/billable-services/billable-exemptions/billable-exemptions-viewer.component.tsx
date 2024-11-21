import React, { useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { type TFunction, useTranslation } from 'react-i18next';
import type { IMarker } from 'react-ace';
import BillingHeader from '../../billing-header/billing-header.component';
import { ConfigurableLink, showModal, useConfig } from '@openmrs/esm-framework';
import { useClobdata } from '../../hooks/useClobdata';
import type { Schema, FormSchema, ConfigObject } from '../billable-exemptions/types';
import SchemaEditor from '../billable-exemptions/schema-editor/schema-editor.component';
import {
  Button,
  Column,
  CopyButton,
  FileUploader,
  Grid,
  IconButton,
  InlineLoading,
  InlineNotification,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@carbon/react';
import { ArrowLeft, Maximize, Minimize, Download } from '@carbon/react/icons';
import styles from './billable-exemptions.scss';

interface TranslationFnProps {
  t: TFunction;
}
interface MarkerProps extends IMarker {
  text: string;
}

interface ErrorProps {
  error: Error;
  title: string;
}

const ErrorNotification = ({ error, title }: ErrorProps) => {
  return (
    <InlineNotification
      className={styles.errorNotification}
      kind={'error'}
      lowContrast
      subtitle={error?.message}
      title={title}
    />
  );
};
export const BillableExemptionsViewer = () => {
  const { t } = useTranslation();

  const FormEditorContent: React.FC<TranslationFnProps> = ({ t }) => {
    const defaultEnterDelayInMs = 300;

    const [isMaximized, setIsMaximized] = useState(false);

    const [validationResponse, setValidationResponse] = useState([]);
    const [isValidating, setIsValidating] = useState(false);
    const [validationComplete, setValidationComplete] = useState(false);
    const [publishedWithErrors, setPublishedWithErrors] = useState(false);
    const isNewSchema = true;

    const [validationOn, setValidationOn] = useState(false);
    const [invalidJsonErrorMessage, setInvalidJsonErrorMessage] = useState('');
    const { clobdata, clobdataError, isLoadingClobdata } = useClobdata();
    const isLoadingFormOrSchema = Boolean(isLoadingClobdata);
    const [schema, setSchema] = useState<Schema>();
    const [stringifiedSchema, setStringifiedSchema] = useState(schema ? JSON.stringify(schema, null, 2) : '');
    const { blockRenderingWithErrors, dataTypeToRenderingMap } = useConfig<ConfigObject>();
    const [errors, setErrors] = useState<Array<MarkerProps>>([]);

    const resetErrorMessage = useCallback(() => {
      setInvalidJsonErrorMessage('');
    }, []);

    const handleSchemaChange = useCallback(
      (updatedSchema: string) => {
        resetErrorMessage();
        setStringifiedSchema(updatedSchema);
      },
      [resetErrorMessage],
    );

    const launchRestoreDraftSchemaModal = useCallback(() => {
      const dispose = showModal('restore-draft-schema-modal', {
        closeModal: () => dispose(),
        onSchemaChange: handleSchemaChange,
      });
    }, [handleSchemaChange]);

    useEffect(() => {
      //   if (formUuid) {
      //     if (status === 'formLoaded' && !isLoadingClobdata && clobdata === undefined) {
      //       launchRestoreDraftSchemaModal();
      //     }
      //     if (clobdata && Object.keys(clobdata).length > 0) {
      //       setStatus('schemaLoaded');
      //       setSchema(clobdata);
      //       localStorage.setItem('formJSON', JSON.stringify(clobdata));
      //     }
      //   }
    }, [clobdata, isLoadingClobdata, isLoadingFormOrSchema, launchRestoreDraftSchemaModal]);

    useEffect(() => {
      setStringifiedSchema(JSON.stringify(schema, null, 2));
    }, [schema]);

    const updateSchema = useCallback((updatedSchema: Schema) => {
      setSchema(updatedSchema);
      localStorage.setItem('formJSON', JSON.stringify(updatedSchema));
    }, []);

    const onValidateForm = async () => {
      setIsValidating(true);
      try {
        // const [errorsArray] = await handleFormValidation(schema, dataTypeToRenderingMap);
        // setValidationResponse(errorsArray);
        setValidationComplete(true);
      } catch (error) {
        console.error('Error during form validation:', error);
      } finally {
        setIsValidating(false);
      }
    };

    const inputDummySchema = useCallback(() => {
      const dummySchema: FormSchema = {
        services: {
          all: [
            {
              concept: '856', // Concept ID for HIV Viral Load
              description: 'HIV Viral Load',
            },
            {
              concept: '167441', // Concept ID for PCR
              description: 'PCR',
            },
            {
              concept: '162202', // Concept ID for GeneXpert
              description: 'GeneXpert',
            },
          ],
          'program:HIV': [
            {
              concept: '1000051', // Concept ID for Registration
              description: 'Registration',
            },
            {
              concept: '167441', // Concept ID for PCR
              description: 'PCR',
            },
            {
              concept: '159430', // Concept ID for Hepatitis B
              description: 'Hepatitis B',
            },
          ],
          'program:TB': [
            {
              concept: '162202', // Concept ID for GeneXpert
              description: 'GeneXpert',
            },
            {
              concept: '165397', // Concept ID for Haemoglobin Test
              description: 'Haemoglobin Test',
            },
            {
              concept: '1000051', // Concept ID for Registration
              description: 'Registration',
            },
          ],
          'age<5': [
            {
              concept: '32', // Concept ID for Malaria Smear
              description: 'Malaria Smear',
            },
            {
              concept: '167410', // Concept ID for Clinical consultation
              description: 'Clinical consultation',
            },
            {
              concept: '1000051', // Concept ID for Registration
              description: 'Registration',
            },
          ],
          'visitAttribute:prisoner': [
            {
              concept: '32', // Concept ID for Malaria Smear
              description: 'Malaria Smear',
            },
            {
              concept: '167410', // Concept ID for Clinical consultation
              description: 'Clinical consultation',
            },
            {
              concept: '1000051', // Concept ID for Registration
              description: 'Registration',
            },
          ],
        },
        commodities: {},
      };

      setStringifiedSchema(JSON.stringify(dummySchema, null, 2));
      updateSchema({ ...dummySchema });
    }, [updateSchema]);

    const renderSchemaChanges = useCallback(() => {
      resetErrorMessage();
      {
        try {
          const parsedJson: Schema = JSON.parse(stringifiedSchema);
          updateSchema(parsedJson);
          setStringifiedSchema(JSON.stringify(parsedJson, null, 2));
        } catch (e) {
          if (e instanceof Error) {
            setInvalidJsonErrorMessage(e.message);
          }
        }
      }
    }, [stringifiedSchema, updateSchema, resetErrorMessage]);

    const handleRenderSchemaChanges = useCallback(() => {
      if (errors.length && blockRenderingWithErrors) {
        setValidationOn(true);
        return;
      } else if (errors.length && !blockRenderingWithErrors) {
        setValidationOn(true);
        renderSchemaChanges();
      } else {
        renderSchemaChanges();
      }
    }, [blockRenderingWithErrors, errors.length, renderSchemaChanges]);

    const handleSchemaImport = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          const fileContent: string = result;
          const parsedJson: Schema = JSON.parse(fileContent);
          setSchema(parsedJson);
        } else if (result instanceof ArrayBuffer) {
          const decoder = new TextDecoder();
          const fileContent: string = decoder.decode(result);
          const parsedJson: Schema = JSON.parse(fileContent);
          setSchema(parsedJson);
        }
      };

      reader.readAsText(file);
    };

    // const downloadableSchema = useMemo(
    //   () =>
    //     new Blob([JSON.stringify(schema, null, 2)], {
    //       type: 'application/json',
    //     }),
    //   [schema],
    // );

    const handleCopySchema = useCallback(async () => {
      await navigator.clipboard.writeText(stringifiedSchema);
    }, [stringifiedSchema]);

    const handleToggleMaximize = () => {
      setIsMaximized(!isMaximized);
    };

    const responsiveSize = isMaximized ? 16 : 8;

    return (
      <div className={styles.container}>
        <Grid
          className={classNames(styles.grid as string, {
            [styles.maximized]: isMaximized,
          })}>
          <Column lg={responsiveSize} md={responsiveSize} className={styles.column}>
            <div className={styles.actionButtons}>
              {isLoadingFormOrSchema ? (
                <InlineLoading description={t('loadingSchema', 'Loading schema') + '...'} />
              ) : (
                <h1 className={styles.formName}>some schema</h1>
              )}
            </div>
            <div>
              <div className={styles.heading}>
                <span className={styles.tabHeading}>{t('schemaEditor', 'Exemptions schema editor')}</span>
                <div className={styles.topBtns}>
                  {!schema ? (
                    <FileUploader
                      onChange={handleSchemaImport}
                      labelTitle=""
                      labelDescription=""
                      buttonLabel={t('importSchema', 'Import schema')}
                      buttonKind="ghost"
                      size="lg"
                      filenameStatus="edit"
                      accept={['.json']}
                      multiple={false}
                      disabled={false}
                      iconDescription={t('importSchema', 'Import schema')}
                      name="form-import"
                    />
                  ) : null}
                  {isNewSchema && !schema ? (
                    <Button kind="ghost" onClick={inputDummySchema}>
                      {t('inputDummySchema', 'Input dummy schema')}
                    </Button>
                  ) : null}
                  <Button kind="ghost" disabled={invalidJsonErrorMessage}>
                    <span>{t('renderChanges', 'Render changes')}</span>
                  </Button>
                </div>
                {schema ? (
                  <>
                    <IconButton
                      enterDelayInMs={defaultEnterDelayInMs}
                      kind="ghost"
                      label={
                        isMaximized ? t('minimizeEditor', 'Minimize editor') : t('maximizeEditor', 'Maximize editor')
                      }
                      onClick={handleToggleMaximize}
                      size="md">
                      {isMaximized ? <Minimize /> : <Maximize />}
                    </IconButton>
                    <CopyButton
                      align="top"
                      className="cds--btn--md"
                      enterDelayInMs={defaultEnterDelayInMs}
                      iconDescription={t('copySchema', 'Copy schema')}
                      kind="ghost"
                      onClick={handleCopySchema}
                    />
                  </>
                ) : null}
              </div>
              {clobdataError ? (
                <ErrorNotification error={clobdataError} title={t('schemaLoadError', 'Error loading schema')} />
              ) : null}
              <div className={styles.editorContainer}>
                <SchemaEditor
                  errors={errors}
                  isLoading={isLoadingFormOrSchema}
                  onSchemaChange={handleSchemaChange}
                  setErrors={setErrors}
                  setValidationOn={setValidationOn}
                  stringifiedSchema={stringifiedSchema}
                  validationOn={validationOn}
                />
              </div>
            </div>
          </Column>
          <Column lg={8} md={8} className={styles.column}>
            {/* <ActionButtons
                  schema={schema}
                  t={t}
                //   schemaErrors={errors}
                  setPublishedWithErrors={setPublishedWithErrors}
                  onFormValidation={onValidateForm}
                  setValidationResponse={setValidationResponse}
                  setValidationComplete={setValidationComplete}
                  isValidating={isValidating}
                /> */}
            {/* {validationComplete && (
                //   <ValidationMessage
                //     hasValidationErrors={validationResponse.length > 0}
                //     publishedWithErrors={publishedWithErrors}
                //     errorsCount={validationResponse.length}
                //   />
                )} */}
            <Tabs>
              <TabList aria-label="Form previews">
                <Tab>{t('preview', 'Preview')}</Tab>
                {/* <Tab>{t('interactiveBuilder', 'Interactive Builder')}</Tab>
                    {form && <Tab>{t('auditDetails', 'Audit Details')}</Tab>} */}
              </TabList>
              <TabPanels>
                <TabPanel>{/* <FormRenderer schema={schema} isLoading={isLoadingFormOrSchema} /> */}</TabPanel>
                {/* <TabPanel>
                      <InteractiveBuilder
                        schema={schema}
                        onSchemaChange={updateSchema}
                        isLoading={isLoadingFormOrSchema}
                        validationResponse={validationResponse}
                      />
                    </TabPanel> */}
                {/* <TabPanel>{form && <AuditDetails form={form} key={form.uuid} />}</TabPanel> */}
              </TabPanels>
            </Tabs>
          </Column>
        </Grid>
      </div>
    );
  };

  return (
    <>
      <FormEditorContent t={t} />
    </>
  );
};
