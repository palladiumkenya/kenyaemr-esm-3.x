import React, { useMemo, useState } from 'react';
import styles from './result-form.scss';
import { Button, InlineLoading, ModalBody, ModalFooter, TextArea, FormLabel } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { closeOverlay } from '../components/overlay/hook';
import { ExtensionSlot, showNotification, showToast, usePatient } from '@openmrs/esm-framework';
import { Result } from '../radiology-tabs/work-list/work-list.resource';
import { useForm } from 'react-hook-form';
import { saveProcedureReport, useGetOrderConceptByUuid } from './result-form.resource';

interface ResultFormProps {
  patientUuid: string;
  order: Result;
}

const ProcedureReportForm: React.FC<ResultFormProps> = ({ order, patientUuid }) => {
  const [report, setProcedureReport] = useState('');
  const { t } = useTranslation();
  const {
    formState: { isSubmitting, errors },
    handleSubmit,
  } = useForm<{ testResult: string }>({
    defaultValues: {},
  });

  const { patient, isLoading } = usePatient(patientUuid);
  const { concept, isLoading: isLoadingConcepts } = useGetOrderConceptByUuid(order.concept.uuid);

  const bannerState = useMemo(() => {
    if (patient) {
      return {
        patient,
        patientUuid,
        hideActionsOverflow: true,
      };
    }
  }, [patient, patientUuid]);

  if (isLoadingConcepts) {
    return <div>Loading test details</div>;
  }

  const onSubmit = (data, e) => {
    e.preventDefault();
    // assign result to test order

    const reportPayload = {
      patient: patientUuid,
      procedureOrder: order.uuid,
      concept: order.concept.uuid,
      status: 'COMPLETED',
      procedureReport: report,
      encounters: [],
    };

    saveProcedureReport(reportPayload).then(
      () => {
        showToast({
          critical: true,
          title: t('saveReport', 'Report updated sucessful'),
          kind: 'success',
          description: t('generateSuccessfully', 'You have successfully save the report'),
        });
        closeOverlay();
      },
      (err) => {
        showNotification({
          title: t(`errorSavingReport', 'Error occurred while saving the report`),
          kind: 'error',
          critical: true,
          description: err?.message,
        });
      },
    );
  };
  return (
    <>
      <div className="">
        <ModalBody>
          {isLoading && (
            <InlineLoading
              className={styles.bannerLoading}
              iconDescription="Loading"
              description="Loading banner"
              status="active"
            />
          )}
          {patient && <ExtensionSlot name="patient-header-slot" state={bannerState} />}
          <section className={styles.section}>
            <form>
              <FormLabel className={styles.textArea}>{concept?.display}</FormLabel>
              {Object.keys(errors).length > 0 && <div className={styles.errorDiv}>Procedure report is required</div>}
              <TextArea
                id="procedureReport"
                name="procedureReport"
                rules={{
                  required: true,
                }}
                invalidText="Required"
                autofocus
                onChange={(e) => setProcedureReport(e.target.value)}
              />
            </form>
          </section>
        </ModalBody>

        <ModalFooter>
          <Button disabled={isSubmitting} onClick={() => closeOverlay()} kind="secondary">
            {t('cancel', 'Cancel')}
          </Button>
          <Button onClick={handleSubmit(onSubmit)}>Save report</Button>
        </ModalFooter>
      </div>
    </>
  );
};

export default ProcedureReportForm;
