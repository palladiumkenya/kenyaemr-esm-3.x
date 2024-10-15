import { defineConfigSchema, getSyncLifecycle, registerFeatureFlag } from '@openmrs/esm-framework';
import { createDashboardGroup, createDashboardLink } from '@openmrs/esm-patient-common-lib';
import BenefitsPackage from './benefits-package/benefits-package.component';
import BenefitPreAuthForm from './benefits-package/forms/benefit-pre-auth-form.workspace';
import BenefitsEligibilyRequestForm from './benefits-package/forms/benefits-eligibility-request-form.workspace';
import BillHistory from './bill-history/bill-history.component';
import { CancelBillModal } from './billable-services/bill-manager/modals/cancel-bill.modal';
import { DeleteBillModal } from './billable-services/bill-manager/modals/delete-bill.modal';
import { DeleteBillableServiceModal } from './billable-services/bill-manager/modals/DeleteBillableService.modal';
import { RefundBillModal } from './billable-services/bill-manager/modals/refund-bill.modal';
import { EditBillForm } from './billable-services/bill-manager/workspaces/edit-bill-form.workspace';
import { WaiveBillForm } from './billable-services/bill-manager/workspaces/waive-bill-form.workspace';
import CommodityForm from './billable-services/billables/commodity/commodity-form.workspace';
import AddServiceForm from './billable-services/billables/services/service-form.workspace';
import DrugOrder from './billable-services/billiable-item/drug-order/drug-order.component';
import ImagingOrder from './billable-services/billiable-item/test-order/imaging-order.component';
import LabOrder from './billable-services/billiable-item/test-order/lab-order.component';
import PriceInfoOrder from './billable-services/billiable-item/test-order/price-info-order.componet';
import ProcedureOrder from './billable-services/billiable-item/test-order/procedure-order.component';
import TestOrderAction from './billable-services/billiable-item/test-order/test-order-action.component';
import { BulkImportBillableServices } from './billable-services/bulk-import-billable-service.modal';
import BillingCheckInForm from './billing-form/billing-checkin-form.component';
import BillingForm from './billing-form/billing-form.component';
import ClaimsManagementOverview from './claims/claims-management/main/claims-overview-main.component';
import { configSchema } from './config-schema';
import { benefitsPackageDashboardMeta, dashboardMeta } from './dashboard.meta';
import InitiatePaymentDialog from './invoice/payments/initiate-payment/initiate-payment.component';
import VisitAttributeTags from './invoice/payments/visit-tags/visit-attribute.component';
import { createLeftPanelLink } from './left-panel-link.component';
import RequirePaymentModal from './modal/require-payment-modal.component';
import { CreatePaymentPoint } from './payment-points/create-payment-point.component';
import { ClockIn } from './payment-points/payment-point/clock-in.component';
import { ClockOut } from './payment-points/payment-point/clock-out.component';
import rootComponent from './root.component';

const moduleName = '@kenyaemr/esm-billing-app';

const options = {
  featureName: 'billing',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export const billingSummaryDashboardLink = getSyncLifecycle(
  createDashboardLink({ ...dashboardMeta, moduleName }),
  options,
);

export const billingDashboardLink = getSyncLifecycle(
  createDashboardGroup({
    title: 'Billing',
    slotName: 'billing-dashboard-link-slot',
    isExpanded: false,
  }),
  options,
);

export const billingOverviewLink = getSyncLifecycle(
  createLeftPanelLink({
    name: '',
    title: 'Overview',
  }),
  options,
);

export const paymentHistoryLink = getSyncLifecycle(
  createLeftPanelLink({
    name: 'payment-history',
    title: 'Payment History',
  }),
  options,
);

export const paymentPointsLink = getSyncLifecycle(
  createLeftPanelLink({
    name: 'payment-points',
    title: 'Payment Points',
  }),
  options,
);

export const billManagerLink = getSyncLifecycle(
  createLeftPanelLink({
    name: 'bill-manager',
    title: 'Bill Manager',
  }),
  options,
);

export const chargeableItemsLink = getSyncLifecycle(
  createLeftPanelLink({
    name: 'charge-items',
    title: 'Charge Items',
  }),
  options,
);
export const claimsManagementSideNavGroup = getSyncLifecycle(
  createDashboardGroup({
    title: 'Claims Management',
    slotName: 'claims-management-dashboard-link-slot',
    isExpanded: false,
  }),
  options,
);
export const claimsManagementOverviewDashboardLink = getSyncLifecycle(
  createLeftPanelLink({
    name: 'claims-overview',
    title: 'Claims Overview',
  }),
  options,
);
export const preAuthRequestsDashboardLink = getSyncLifecycle(
  createLeftPanelLink({
    name: 'preauth-requests',
    title: 'Pre-Auth Requests',
  }),
  options,
);
export const claimsOverview = getSyncLifecycle(ClaimsManagementOverview, options);

export const benefitsPackageDashboardLink = getSyncLifecycle(
  createDashboardLink({
    ...benefitsPackageDashboardMeta,
    moduleName,
  }),
  options,
);

export const root = getSyncLifecycle(rootComponent, options);
export const billingPatientSummary = getSyncLifecycle(BillHistory, options);
export const billingCheckInForm = getSyncLifecycle(BillingCheckInForm, options);
export const deleteBillableServiceModal = getSyncLifecycle(DeleteBillableServiceModal, options);

export const billingForm = getSyncLifecycle(BillingForm, options);
export const requirePaymentModal = getSyncLifecycle(RequirePaymentModal, options);
export const visitAttributeTags = getSyncLifecycle(VisitAttributeTags, options);
export const initiatePaymentDialog = getSyncLifecycle(InitiatePaymentDialog, options);

export const labOrder = getSyncLifecycle(LabOrder, options);
export const priceInfoOrder = getSyncLifecycle(PriceInfoOrder, options);
export const procedureOrder = getSyncLifecycle(ProcedureOrder, options);
export const imagingOrder = getSyncLifecycle(ImagingOrder, options);
export const drugOrder = getSyncLifecycle(DrugOrder, options);
export const testOrderAction = getSyncLifecycle(TestOrderAction, options);

// bill manager modals
export const cancelBillModal = getSyncLifecycle(CancelBillModal, options);
export const deleteBillModal = getSyncLifecycle(DeleteBillModal, options);

// bill manager extensions
export const waiveBillForm = getSyncLifecycle(WaiveBillForm, options);
export const editBillForm = getSyncLifecycle(EditBillForm, options);
export const refundBillModal = getSyncLifecycle(RefundBillModal, options);

// Benefits
export const benefitsPackage = getSyncLifecycle(BenefitsPackage, options);
export const benefitsEligibilyRequestForm = getSyncLifecycle(BenefitsEligibilyRequestForm, options);
export const benefitsPreAuthForm = getSyncLifecycle(BenefitPreAuthForm, options);

export const createPaymentPoint = getSyncLifecycle(CreatePaymentPoint, options);

export const addServiceForm = getSyncLifecycle(AddServiceForm, options);
export const addCommodityForm = getSyncLifecycle(CommodityForm, options);

export const clockIn = getSyncLifecycle(ClockIn, options);
export const clockOut = getSyncLifecycle(ClockOut, options);

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
  registerFeatureFlag(
    'healthInformationExchange',
    'Health Information Exchange (HIE)',
    'HIE feature flag, this enables and disables the HIE feature',
  );
}

export const bulkImportBillableServicesModal = getSyncLifecycle(BulkImportBillableServices, options);
