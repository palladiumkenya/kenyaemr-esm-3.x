import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle, registerFeatureFlag } from '@openmrs/esm-framework';

import { configSchema } from './config-schema';
import { accountingDashboardMeta } from './dashboard.meta';
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

// Patient Billing Components
import CancelLineItem from './bill-administration/patient-billing/bill-actions/cancel-line-item.component';
import DeleteBillActionButton from './bill-administration/patient-billing/bill-actions/delete-bill-action-button.component';
import EditLineItem from './bill-administration/patient-billing/bill-actions/edit-line-item.component';
import RefundLineItem from './bill-administration/patient-billing/bill-actions/refund-line-item.component';
import WaiveBillActionButton from './bill-administration/patient-billing/bill-actions/waive-bill-action-button.component';
import { DeleteBillModal } from './bill-administration/patient-billing/modals/delete-bill.modal';
import { RefundBillModal } from './bill-administration/patient-billing/modals/refund-bill.modal';
import BillActionModal from './modal/bill-action.modal';
import DeleteBillableServiceModal from './bill-administration/patient-billing/modals/delete-billable-service.modal';
import CancelBillWorkspace from './bill-administration/patient-billing/workspaces/cancel-bill/cancel-bill.workspace';
import { EditBillForm } from './bill-administration/patient-billing/workspaces/edit-bill/edit-bill-form.workspace';
import { WaiveBillForm } from './bill-administration/patient-billing/workspaces/waive-bill/waive-bill-form.workspace';
import CreateBillWorkspace from './bill-administration/patient-billing/workspaces/create-bill/create-bill.workspace';

// Billable Services Components
import AddServiceForm from './bill-administration/service-catalog/services/service-form.workspace';
import CommodityForm from './bill-administration/service-catalog/commodity/commodity-form.workspace';
import BulkImportBillableServices from './bill-administration/service-catalog/bulk-import-billable-service.modal';

// Order Components
import DrugOrder from './billable-services/billable-orders/drug-order/drug-order.component';
import ImagingOrder from './billable-services/billable-orders/test-order/imaging-order.component';
import LabOrder from './billable-services/billable-orders/test-order/lab-order.component';
import PriceInfoOrder from './billable-services/billable-orders/test-order/price-info-order.componet';
import ProcedureOrder from './billable-services/billable-orders/test-order/procedure-order.component';
import OrderActionButton from './billable-services/billable-orders/order-actions/components/order-action-button.component';

// Claims Management Components
import ClaimsManagementOverview from './claims/claims-management/main/claims-overview-main.component';
import { ManageClaimRequest } from './claims/claims-management/table/manage-claim-request.modal';
import InitiatePaymentDialog from './invoice/payments/initiate-payment/initiate-payment.component';
import VisitAttributeTags from './invoice/payments/visit-tags/visit-attribute.component';
import DeletePaymentModeModal from './bill-administration/payment-modes/delete-payment-mode.modal';
import PaymentModeWorkspace from './bill-administration/payment-modes/payment-mode.workspace';
import RequirePaymentModal from './prompt-payment/prompt-payment-modal.component';

// Payment Points Components
import { CreatePaymentPoint } from './bill-administration/payment-points/create-payment-point.component';
import { ClockIn } from './bill-administration/payment-points/payment-point/clock-in.modal';
import { ClockOut } from './bill-administration/payment-points/payment-point/clock-out.modal';

// Print Preview Components
import PrintPreviewModal from './print-preview/print-preview.modal';
import PaymentWorkspace from './invoice/payments/payment-form/payment.workspace';

// Translation
export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

// Core Components
export const root = getSyncLifecycle(rootComponent, options);
export const billingPatientSummary = getSyncLifecycle(BillHistory, options);
export const billingCheckInForm = getSyncLifecycle(BillingCheckInForm, options);
export const billingForm = getSyncLifecycle(BillingForm, options);
export const billingDashboard = getAsyncLifecycle(
  () => import('./billing-dashboard/billing-dashboard.component'),
  options,
);

// Patient Billing Components
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
export const commodityForm = getSyncLifecycle(CommodityForm, options);
export const bulkImportBillableServicesModal = getSyncLifecycle(BulkImportBillableServices, options);

// Claims Management Components
export const claimsOverview = getSyncLifecycle(ClaimsManagementOverview, options);
export const manageClaimRequestModal = getSyncLifecycle(ManageClaimRequest, options);

// Print Preview Components
export const printPreviewModal = getSyncLifecycle(PrintPreviewModal, options);
export const patientBannerShaStatus = getAsyncLifecycle(
  () => import('./billing-form/social-health-authority/patient-banner-sha-status.extension'),
  {
    featureName: 'patient-sha-status',
    moduleName,
  },
);

export const accountingDashboardLink = getSyncLifecycle(createLeftPanelLink({ ...accountingDashboardMeta }), options);
export * from './bill-administration/index';

// App Startup
export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
  registerFeatureFlag(
    'healthInformationExchange',
    'Health Information Exchange (HIE)',
    'HIE feature flag, this enables and disables the HIE feature',
  );
}
