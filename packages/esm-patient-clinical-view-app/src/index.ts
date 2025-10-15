import { defineConfigSchema, getSyncLifecycle } from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';

import { inPatientClinicalEncounterDashboardMeta } from './clinical-encounter/clinical-encounter-dashboard-meta';
import {
  caseEncounterDashboardMeta,
  caseManagementDashboardMeta,
  contactListDashboardMeta,
  peerCalendarDashboardMeta,
  relationshipsDashboardMeta,
  specialClinicsDashboardMeta,
} from './dashboard/dashboard.meta';
import { maternalAndChildHealthDashboardMeta } from './maternal-and-child-health/mch-dashboard.meta';
import { hivCareAndTreatmentDashboardMeta } from './specialized-clinics/hiv-care-and-treatment-services/hiv-care-and-treatment-dashboard.meta';
import { inPatientMeta } from './in-patient/in-patient.meta';

import ClinicalEncounterDashboard from './clinical-encounter/dashboard/clinical-encounter-dashboard.component';
import BirthDateCalculator from './relationships/modals/birthdate-calculator.modal';
import ContactListForm from './contact-list/contact-list.workspace';
import ContactDashboard from './contact-list/contact-dashboard.component';
import ContactListUpdateForm from './contact-list/forms/contact-list-update.workspace';

import AntenatalCare from './maternal-and-child-health/antenatal-care.component';
import LabourDelivery from './maternal-and-child-health/labour-delivery.component';
import PostnatalCare from './maternal-and-child-health/postnatal-care.component';
import MaternalAndChildDashboard from './maternal-and-child-health/maternal-and-child.component';
import Partography from './maternal-and-child-health/partography/partograph.component';

import HivCareAndTreatment from './specialized-clinics/hiv-care-and-treatment-services/hiv-care-and-treatment.component';

import Relationships from './relationships/relationships.component';
import FamilyRelationshipForm from './family-partner-history/family-relationship.workspace';
import DeleteRelationshipConfirmDialog from './relationships/modals/delete-relationship-dialog.modal';

import WrapComponent from './case-management/wrap/wrap.component';
import CaseManagementForm from './case-management/workspace/case-management.workspace';
import CaseEncounterOverviewComponent from './case-management/encounters/case-encounter-overview.component';
import EndRelationshipWorkspace from './case-management/workspace/case-management-workspace.component';

import InPatient from './in-patient/in-patient.component';

import PeerCalendar from './peer-calendar/peer-calendar.component';
import PeerForm from './peer-calendar/forms/peer-form.workspace';
import FormEntryWorkspace from './peer-calendar/forms/form-entry.workspace';

import { configSchema } from './config-schema';
import SpecialClinicDashboard from './special-clinics/special-clinic.component';
import { createDashboardLink as createDashboardLink2 } from './dashboard/createDashboardLink';
import { createLeftPanelLink } from './left-panel-link.component';
import PatientCaseForm from './case-management/encounters/patient-case.workspace';

const moduleName = '@kenyaemr/esm-patient-clinical-view-app';

const options = {
  featureName: 'patient-clinical-view-app',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export const hivCareAndTreatmentLink = getSyncLifecycle(
  createDashboardLink2(hivCareAndTreatmentDashboardMeta),
  options,
);
export const hivCareAndTreatment = getSyncLifecycle(HivCareAndTreatment, options);

export const relationshipsLink = getSyncLifecycle(createDashboardLink(relationshipsDashboardMeta), options);
export const relationships = getSyncLifecycle(Relationships, options);
export const relationshipDeleteConfirmialog = getSyncLifecycle(DeleteRelationshipConfirmDialog, options);
export const familyRelationshipForm = getSyncLifecycle(FamilyRelationshipForm, options);

export const clinicalEncounterLink = getSyncLifecycle(
  createDashboardLink(inPatientClinicalEncounterDashboardMeta),
  options,
);
export const clinicalEncounter = getSyncLifecycle(ClinicalEncounterDashboard, options);

export const contactListLink = getSyncLifecycle(createDashboardLink(contactListDashboardMeta), options);
export const contactList = getSyncLifecycle(ContactDashboard, options);
export const contactListForm = getSyncLifecycle(ContactListForm, options);
export const contactListUpdateForm = getSyncLifecycle(ContactListUpdateForm, options);
export const birthDateCalculator = getSyncLifecycle(BirthDateCalculator, options);

export const peerCalendar = getSyncLifecycle(PeerCalendar, options);
export const peerCalendarDashboardLink = getSyncLifecycle(createLeftPanelLink(peerCalendarDashboardMeta), options);
export const peersForm = getSyncLifecycle(PeerForm, options);
export const peerCalendarFormEntry = getSyncLifecycle(FormEntryWorkspace, options);

export const maternalAndChildHealthDashboardLink = getSyncLifecycle(
  createDashboardLink2(maternalAndChildHealthDashboardMeta),
  options,
);
export const maternalAndChildHealthDashboard = getSyncLifecycle(MaternalAndChildDashboard, options);
export const antenatalCare = getSyncLifecycle(AntenatalCare, options);
export const postnatalCare = getSyncLifecycle(PostnatalCare, options);
export const labourAndDelivery = getSyncLifecycle(LabourDelivery, options);
export const partograph = getSyncLifecycle(Partography, options);

export const caseManagementDashboardLink = getSyncLifecycle(createLeftPanelLink(caseManagementDashboardMeta), options);
export const wrapComponent = getSyncLifecycle(WrapComponent, options);
export const caseManagementForm = getSyncLifecycle(CaseManagementForm, options);
export const addPatientCaseForm = getSyncLifecycle(PatientCaseForm, options);
export const caseEncounterDashboardLink = getSyncLifecycle(createDashboardLink(caseEncounterDashboardMeta), options);
export const caseEncounterTable = getSyncLifecycle(CaseEncounterOverviewComponent, options);
export const endRelationshipWorkspace = getSyncLifecycle(EndRelationshipWorkspace, options);

export const inPatientChartLink = getSyncLifecycle(createDashboardLink(inPatientMeta), options);
export const inPatientChartDashboard = getSyncLifecycle(InPatient, options);

export const specialClinicsDashboardLink = getSyncLifecycle(createDashboardLink(specialClinicsDashboardMeta), options);
export const specialClinicsDashboard = getSyncLifecycle(SpecialClinicDashboard, options);

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}
