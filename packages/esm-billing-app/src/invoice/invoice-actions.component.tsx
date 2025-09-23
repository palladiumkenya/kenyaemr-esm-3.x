import { Button, Popover, PopoverContent } from '@carbon/react';
import { Close, Printer, Wallet, FolderOpen, BaggageClaim } from '@carbon/react/icons';
import {
  launchWorkspace,
  restBaseUrl,
  showModal,
  UserHasAccess,
  useFeatureFlag,
  useVisit,
  useVisitContextStore,
  defaultVisitCustomRepresentation,
  navigate,
  showSnackbar,
  showToast,
  updateVisit,
} from '@openmrs/esm-framework';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { mutate } from 'swr';
import { convertToCurrency } from '../helpers';
import { MappedBill, LineItem } from '../types';
import { spaBasePath } from '../constants';
import { useCheckShareGnum } from './invoice.resource';
import styles from './invoice.scss';
import startCase from 'lodash-es/startCase';

interface InvoiceActionsProps {
  readonly bill: MappedBill;
  readonly selectedLineItems?: LineItem[];
  readonly activeVisit?: any;
}

export function InvoiceActions({ bill, selectedLineItems = [], activeVisit }: InvoiceActionsProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { billUuid, patientUuid } = useParams();
  const { checkSHARegNum } = useCheckShareGnum();
  const { patientUuid: visitStorePatientUuid, manuallySetVisitUuid } = useVisitContextStore();
  const isProcessClaimsFormEnabled = useFeatureFlag('healthInformationExchange');

  const isInsurancePayment = (payments) => {
    return payments?.some((payment) => payment.instanceType.name === 'Insurance');
  };

  const isShaFacilityStatusValid =
    checkSHARegNum?.registrationNumber && checkSHARegNum.registrationNumber.trim() !== '';

  const launchBillCloseOrReopenModal = (action: 'close' | 'reopen') => {
    const dispose = showModal('bill-action-modal', {
      closeModal: () => dispose(),
      bill: bill,
      action,
    });
  };

  const shouldCloseBill = bill.balance === 0 && !bill.closed;

  const handlePrint = (documentType: string, documentTitle: string) => {
    const dispose = showModal('print-preview-modal', {
      onClose: () => dispose(),
      title: documentTitle,
      documentUrl: `/openmrs${restBaseUrl}/cashier/print?documentType=${documentType}&billId=${bill?.id}`,
    });
  };

  const handleBillPayment = () => {
    const dispose = showModal('initiate-payment-modal', {
      closeModal: () => dispose(),
      bill: bill,
      selectedLineItems,
    });
  };

  const mutateClaimForm = async () => {
    const activeVisitUrlSuffix = `?patient=${patientUuid}&v=${defaultVisitCustomRepresentation}&includeInactive=false`;
    const retrospectiveVisitUuid = patientUuid && visitStorePatientUuid == patientUuid ? manuallySetVisitUuid : null;
    const retrospectiveVisitUrlSuffix = `/${retrospectiveVisitUuid}?v=${defaultVisitCustomRepresentation}`;
    const activeVisitUrl = `${restBaseUrl}/visit${activeVisitUrlSuffix}`;
    const retroVisitUrl = `${restBaseUrl}/visit${retrospectiveVisitUrlSuffix}`;
    await mutate((key) => typeof key === 'string' && (key.startsWith(activeVisitUrl) || key.startsWith(retroVisitUrl)));
  };

  const handleEndVisit = async () => {
    if (activeVisit) {
      const endVisitPayload = {
        stopDatetime: new Date(),
      };

      const abortController = new AbortController();
      try {
        await updateVisit(activeVisit.uuid, endVisitPayload, abortController);
        await mutateClaimForm();
        showSnackbar({
          isLowContrast: true,
          kind: 'success',
          subtitle: t('visitEndSuccessssfully', 'visit ended successfully'),
          title: t('visitEnded', 'Visit ended'),
        });
      } catch (error) {
        showSnackbar({
          title: t('errorEndingVisit', 'Error ending visit'),
          kind: 'error',
          isLowContrast: false,
          subtitle: error?.message,
        });
      }
    }
  };

  const handleViewClaims = async () => {
    if (!isShaFacilityStatusValid) {
      showToast({
        critical: true,
        kind: 'warning',
        title: t('shaFacilityLicenseNumberRequired', 'Facility license number Required'),
        description: t(
          'shaFacilityLicenseNumbernRequiredDescription',
          'Facility license number is required to process claims. Please update facility license number details.',
        ),
      });
      return;
    }

    if (activeVisit) {
      await handleEndVisit();
      navigate({ to: `${spaBasePath}/accounting/patient/${patientUuid}/${billUuid}/claims` });
    } else {
      navigate({ to: `${spaBasePath}/accounting/patient/${patientUuid}/${billUuid}/claims` });
    }
  };

  return (
    <div className="invoiceSummaryActions">
      <Popover isTabTip align="bottom-right" onKeyDown={() => {}} onRequestClose={() => setIsOpen(false)} open={isOpen}>
        <button
          className={styles.printButton}
          aria-expanded
          aria-label="Settings"
          onClick={() => setIsOpen(!isOpen)}
          type="button">
          <span className={styles.printButtonContent}>
            <span className={styles.printButtonText}>{t('print', 'Print')}</span>
            <Printer />
          </span>
        </button>
        <PopoverContent>
          <div className={styles.popoverContent}>
            <Button
              kind="ghost"
              size="sm"
              onClick={() =>
                handlePrint(
                  'invoice',
                  `${t('invoice', 'Invoice')} ${bill?.receiptNumber} - ${startCase(bill?.patientName)}`,
                )
              }
              renderIcon={Printer}>
              {t('printInvoice', 'Print Invoice')}
            </Button>
            <Button
              kind="ghost"
              size="sm"
              onClick={() => {
                const dispose = showModal('print-preview-modal', {
                  onClose: () => dispose(),
                  title: `${t('receipt', 'Receipt')} ${bill?.receiptNumber} - ${startCase(bill?.patientName)}`,
                  documentUrl: `/openmrs${restBaseUrl}/cashier/receipt?billId=${bill.id}`,
                });
              }}
              renderIcon={Printer}>
              {t('printReceipt', 'Print Receipt')}
            </Button>
            <Button
              kind="ghost"
              size="sm"
              onClick={() =>
                handlePrint(
                  'billstatement',
                  `${t('billStatement', 'Bill Statement')} ${bill?.receiptNumber} - ${startCase(bill?.patientName)}`,
                )
              }
              renderIcon={Printer}>
              {t('printBillStatement', 'Print Bill Statement')}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      {shouldCloseBill && (
        <UserHasAccess privilege="Close Cashier Bills">
          <Button
            kind="danger--ghost"
            size="sm"
            renderIcon={Close}
            iconDescription="Add"
            tooltipPosition="right"
            onClick={() => launchBillCloseOrReopenModal('close')}>
            {t('closeBill', 'Close Bill')}
          </Button>
        </UserHasAccess>
      )}
      {bill?.closed && (
        <UserHasAccess privilege="Reopen Cashier Bills">
          <Button
            kind="ghost"
            size="sm"
            renderIcon={FolderOpen}
            iconDescription="Add"
            tooltipPosition="right"
            onClick={() => launchBillCloseOrReopenModal('reopen')}>
            {t('reopen', 'Reopen')}
          </Button>
        </UserHasAccess>
      )}
      <Button
        kind="ghost"
        size="sm"
        renderIcon={Wallet}
        iconDescription="Add"
        tooltipPosition="right"
        onClick={() =>
          launchWorkspace('payment-workspace', {
            bill,
            workspaceTitle: t('additionalPayment', 'Additional Payment (Balance {{billBalance}})', {
              billBalance: convertToCurrency(bill.balance),
            }),
          })
        }>
        {t('additionalPayment', 'Additional Payment')}
      </Button>
      {bill?.balance !== 0 && (
        <Button
          onClick={handleBillPayment}
          disabled={bill?.balance === 0}
          size="sm"
          renderIcon={Wallet}
          iconDescription="Add"
          tooltipPosition="left">
          {t('mpesaPayment', 'MPESA Payment')}
        </Button>
      )}

      {isProcessClaimsFormEnabled && isInsurancePayment(bill?.payments) && (
        <Button
          onClick={handleViewClaims}
          disabled={bill?.status !== 'PAID'}
          kind="danger"
          size="sm"
          renderIcon={BaggageClaim}
          iconDescription="Add"
          tooltipPosition="bottom">
          {activeVisit ? t('endVisitAndClaim', 'End visit and Process claims') : t('claim', 'Process claims')}
        </Button>
      )}
    </div>
  );
}
