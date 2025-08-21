import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle, registerFeatureFlag } from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';

import { configSchema } from './config-schema';
import { benefitsPackageDashboardMeta, dashboardMeta } from './dashboard.meta';
const moduleName = '@kenyaemr/esm-billing-app';
const options = {
  featureName: 'billing',
  moduleName,
};

// Dashboard and Navigation Components
import { createLeftPanelLink } from './left-panel-link.component';
import rootComponent from './root.component';

// Billing Core Components
import BillingForm from './billing-form/billing-form.component';
import BillingCheckInForm from './billing-form/billing-checkin-form.component';
import BillHistory from './bill-history/bill-history.component';

// Bill Deposit Components

// Benefits Package Components
import BenefitsPackage from './benefits-package/benefits-package.component';
import Benefits from './benefits-package/benefits/benefits.component';
import BenefitPreAuthForm from './benefits-package/forms/benefit-pre-auth-form.workspace';

// Bill Manager Components
import CancelLineItem from './billable-services/bill-manager/bill-actions/cancel-line-item.component';
import DeleteBillActionButton from './billable-services/bill-manager/bill-actions/delete-bill-action-button.component';
import EditLineItem from './billable-services/bill-manager/bill-actions/edit-line-item.component';
import RefundLineItem from './billable-services/bill-manager/bill-actions/refund-line-item.component';
import WaiveBillActionButton from './billable-services/bill-manager/bill-actions/waive-bill-action-button.component';
import { DeleteBillModal } from './billable-services/bill-manager/modals/delete-bill.modal';
import { RefundBillModal } from './billable-services/bill-manager/modals/refund-bill.modal';
import BillActionModal from './modal/bill-action.modal';
import DeleteBillableServiceModal from './billable-services/bill-manager/modals/delete-billable-service.modal';
import CancelBillWorkspace from './billable-services/bill-manager/workspaces/cancel-bill/cancel-bill.workspace';
import { EditBillForm } from './billable-services/bill-manager/workspaces/edit-bill/edit-bill-form.workspace';
import { WaiveBillForm } from './billable-services/bill-manager/workspaces/waive-bill/waive-bill-form.workspace';
import CreateBillWorkspace from './billable-services/bill-manager/workspaces/create-bill/create-bill.workspace';

// Billable Services Components
import CommodityForm from './billable-services/billables/commodity/commodity-form.workspace';
import AddServiceForm from './billable-services/billables/services/service-form.workspace';
import { BulkImportBillableServices } from './billable-services/bulk-import-billable-service.modal';

// Order Components
import DrugOrder from './billable-services/billiable-item/drug-order/drug-order.component';
import ImagingOrder from './billable-services/billiable-item/test-order/imaging-order.component';
import LabOrder from './billable-services/billiable-item/test-order/lab-order.component';
import PriceInfoOrder from './billable-services/billiable-item/test-order/price-info-order.componet';
import ProcedureOrder from './billable-services/billiable-item/test-order/procedure-order.component';
import OrderActionButton from './billable-services/billiable-item/order-actions/components/order-action-button.component';

// Claims Management Components
import ClaimsManagementOverview from './claims/claims-management/main/claims-overview-main.component';
import { ManageClaimRequest } from './claims/claims-management/table/manage-claim-request.modal';
import InitiatePaymentDialog from './invoice/payments/initiate-payment/initiate-payment.component';
import VisitAttributeTags from './invoice/payments/visit-tags/visit-attribute.component';
import DeletePaymentModeModal from './payment-modes/delete-payment-mode.modal';
import PaymentModeWorkspace from './payment-modes/payment-mode.workspace';
import RequirePaymentModal from './prompt-payment/prompt-payment-modal.component';

// Payment Points Components
import { CreatePaymentPoint } from './payment-points/create-payment-point.component';
import { ClockIn } from './payment-points/payment-point/clock-in.modal';
import { ClockOut } from './payment-points/payment-point/clock-out.modal';

// Bill Deposit Components
import BillDepositSearch from './bill-deposit/components/search/bill-deposit-search.component';
import AddDepositWorkspace from './bill-deposit/components/forms/add-deposit.workspace';
import DeleteDepositModal from './bill-deposit/components/modal/delete-deposit.modal';
import ReverseTransactionModal from './bill-deposit/components/modal/reverse-transaction.modal';
import DepositTransactionWorkspace from './bill-deposit/components/forms/deposit-transactions/deposit-transaction.workspace';

// Print Preview Components
import PrintPreviewModal from './print-preview/print-preview.modal';
import PaymentWorkspace from './invoice/payments/payment-form/payment.workspace';

// Translation
export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

// Dashboard Links
export const billingSummaryDashboardLink = getSyncLifecycle(
  createDashboardLink({ ...dashboardMeta, icon: 'omrs-icon-money', moduleName }),
  options,
);

// Navigation Links
// t('overview', 'Overview')
export const billingOverviewLink = getSyncLifecycle(
  createLeftPanelLink({
    name: '',
    title: 'overview',
  }),
  options,
);
// t('Exemptions', 'Exemptions')
export const billableExemptionsLink = getSyncLifecycle(
  createLeftPanelLink({
    name: 'billable-exemptions',
    title: 'Exemptions',
  }),
  options,
);
// t('Payment History', 'Payment History')
export const paymentHistoryLink = getSyncLifecycle(
  createLeftPanelLink({
    name: 'payment-history',
    title: 'Payment History',
  }),
  options,
);
// t('Payment Points', 'Payment Points')
export const paymentPointsLink = getSyncLifecycle(
  createLeftPanelLink({
    name: 'payment-points',
    title: 'Payment Points',
  }),
  options,
);
// t('Payment Modes', 'Payment Modes')
export const paymentModesLink = getSyncLifecycle(
  createLeftPanelLink({
    name: 'payment-modes',
    title: 'Payment Modes',
  }),
  options,
);
// t('Bill Manager', 'Bill Manager')
export const billManagerLink = getSyncLifecycle(
  createLeftPanelLink({
    name: 'bill-manager',
    title: 'Bill Manager',
  }),
  options,
);
// t('Charge Items', 'Charge Items')
export const chargeableItemsLink = getSyncLifecycle(
  createLeftPanelLink({
    name: 'charge-items',
    title: 'Charge Items',
  }),
  options,
);
// t('Claims Overview', 'Claims Overview')
export const claimsManagementOverviewDashboardLink = getSyncLifecycle(
  createLeftPanelLink({
    name: 'claims-overview',
    title: 'Claims Overview',
  }),
  options,
);
// t('Pre-Auth Requests', 'Pre-Auth Requests')
export const preAuthRequestsDashboardLink = getSyncLifecycle(
  createLeftPanelLink({
    name: 'preauth-requests',
    title: 'Pre-Auth Requests',
  }),
  options,
);

// t('Bill Deposit', 'Bill Deposit')
export const billDepositDashboardLink = getSyncLifecycle(
  createLeftPanelLink({
    name: 'bill-deposit',
    title: 'Bill Deposit',
  }),
  options,
);
// t('Insurance benefits', 'Insurance benefits')
export const benefitsPackageDashboardLink = getSyncLifecycle(
  createDashboardLink({
    ...benefitsPackageDashboardMeta,
    icon: '',
    moduleName,
  }),
  options,
);

// Core Components
export const root = getSyncLifecycle(rootComponent, options);
export const billingPatientSummary = getSyncLifecycle(BillHistory, options);
export const billingCheckInForm = getSyncLifecycle(BillingCheckInForm, options);
export const billingForm = getSyncLifecycle(BillingForm, options);

// Bill Manager Components
export const deleteBillableServiceModal = getSyncLifecycle(DeleteBillableServiceModal, options);
export const createBillWorkspace = getSyncLifecycle(CreateBillWorkspace, options);
export const deleteBillModal = getSyncLifecycle(DeleteBillModal, options);
export const waiveBillForm = getSyncLifecycle(WaiveBillForm, options);
export const editBillForm = getSyncLifecycle(EditBillForm, options);
export const refundBillModal = getSyncLifecycle(RefundBillModal, options);
export const billActionModal = getSyncLifecycle(BillActionModal, options);
export const cancelBillWorkspace = getSyncLifecycle(CancelBillWorkspace, options);
export const waiveBillActionButton = getSyncLifecycle(WaiveBillActionButton, options);
export const deleteBillActionButton = getSyncLifecycle(DeleteBillActionButton, options);
export const refundLineItem = getSyncLifecycle(RefundLineItem, options);
export const cancelLineItem = getSyncLifecycle(CancelLineItem, options);
export const editLineItem = getSyncLifecycle(EditLineItem, options);

// Order Components
export const labOrder = getSyncLifecycle(LabOrder, options);
export const priceInfoOrder = getSyncLifecycle(PriceInfoOrder, options);
export const procedureOrder = getSyncLifecycle(ProcedureOrder, options);
export const imagingOrder = getSyncLifecycle(ImagingOrder, options);
export const drugOrder = getSyncLifecycle(DrugOrder, options);
export const orderActionButton = getSyncLifecycle(OrderActionButton, options);

// Benefits Components
export const benefitsPackage = getSyncLifecycle(BenefitsPackage, options);
export const benefits = getSyncLifecycle(Benefits, options);
export const benefitsPreAuthForm = getSyncLifecycle(BenefitPreAuthForm, options);

// Payment Components
export const requirePaymentModal = getSyncLifecycle(RequirePaymentModal, options);
export const visitAttributeTags = getSyncLifecycle(VisitAttributeTags, options);
export const initiatePaymentDialog = getSyncLifecycle(InitiatePaymentDialog, options);
export const paymentModeWorkspace = getSyncLifecycle(PaymentModeWorkspace, options);
export const deletePaymentModeModal = getSyncLifecycle(DeletePaymentModeModal, options);
export const paymentWorkspace = getSyncLifecycle(PaymentWorkspace, options);

// Payment Points Components
export const createPaymentPoint = getSyncLifecycle(CreatePaymentPoint, options);
export const clockIn = getSyncLifecycle(ClockIn, options);
export const clockOut = getSyncLifecycle(ClockOut, options);

// Service Management Components
export const addServiceForm = getSyncLifecycle(AddServiceForm, options);
export const addCommodityForm = getSyncLifecycle(CommodityForm, options);
export const bulkImportBillableServicesModal = getSyncLifecycle(BulkImportBillableServices, options);

// Claims Management Components
export const claimsOverview = getSyncLifecycle(ClaimsManagementOverview, options);
export const manageClaimRequestModal = getSyncLifecycle(ManageClaimRequest, options);

// Bill Deposit Components
export const billDepositSearch = getSyncLifecycle(BillDepositSearch, options);
export const addDepositWorkspace = getSyncLifecycle(AddDepositWorkspace, options);
export const deleteDepositModal = getSyncLifecycle(DeleteDepositModal, options);
export const depositTransactionWorkspace = getSyncLifecycle(DepositTransactionWorkspace, options);
export const reverseTransactionModal = getSyncLifecycle(ReverseTransactionModal, options);

// Print Preview Components
export const printPreviewModal = getSyncLifecycle(PrintPreviewModal, options);
export const patientBannerShaStatus = getAsyncLifecycle(
  () => import('./billing-form/social-health-authority/patient-banner-sha-status.extension'),
  {
    featureName: 'patient-sha-status',
    moduleName,
  },
);

// App Startup
export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
  registerFeatureFlag(
    'healthInformationExchange',
    'Health Information Exchange (HIE)',
    'HIE feature flag, this enables and disables the HIE feature',
  );
}
