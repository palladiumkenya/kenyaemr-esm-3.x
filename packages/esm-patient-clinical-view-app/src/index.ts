import { defineConfigSchema, getSyncLifecycle } from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { inPatientClinicalEncounterDashboardMeta } from './clinical-encounter/clinical-encounter-dashboard-meta';
import ClinicalEncounterDashboard from './clinical-encounter/dashboard/clinical-encounter-dashboard.component';
import ClinicalViewSection from './clinical-view-group/clinical-view-section.component';
import { createDashboardGroup } from './clinical-view-group/createDashboardGroup';
import { configSchema } from './config-schema';
import BirthDateCalculator from './contact-list/birthdate-calculator.component';
import ContactList from './contact-list/contact-list.component';
import ContactListForm from './contact-list/contact-list.workspace';
import {
  caseEncounterDashboardMeta,
  caseManagementDashboardMeta,
  contactListDashboardMeta,
  familyHistoryDashboardMeta,
  otherRelationshipsDashboardMeta,
  relationshipsDashboardMeta,
} from './dashboard.meta';
import FamilyHistory from './family-partner-history/family-history.component';
import AntenatalCare from './maternal-and-child-health/antenatal-care.component';
import LabourDelivery from './maternal-and-child-health/labour-delivery.component';
import {
  antenatalDashboardMeta,
  labourAndDeliveryDashboardMeta,
  maternalAndChildHealthNavGroup,
  postnatalDashboardMeta,
} from './maternal-and-child-health/mch-dashboard.meta';
import PostnatalCare from './maternal-and-child-health/postnatal-care.component';
import GenericDashboard from './specialized-clinics/generic-nav-links/generic-dashboard.component';
import GenericNavLinks from './specialized-clinics/generic-nav-links/generic-nav-links.component';
import DefaulterTracing from './specialized-clinics/hiv-care-and-treatment-services/defaulter-tracing/defaulter-tracing.component';
import {
  defaulterTracingDashboardMeta,
  hivCareAndTreatmentNavGroup,
  htsDashboardMeta,
} from './specialized-clinics/hiv-care-and-treatment-services/hiv-care-and-treatment-dashboard.meta';
import HivTestingEncountersList from './specialized-clinics/hiv-care-and-treatment-services/hiv-testing-services/views/hiv-testing/hiv-testing-services.component';
import { specialClinicsNavGroup } from './specialized-clinics/special-clinic-dashboard.meta';
import { createLeftPanelLink } from './left-panel-link.component';
import WrapComponent from './case-management/wrap/wrap.component';
import CaseManagementForm from './case-management/workspace/case-management.workspace';
import Relationships from './relationships/relationships.component';
import CaseEncounterOverviewComponent from './case-management/encounters/case-encounter-overview.component';
import FamilyRelationshipForm from './family-partner-history/family-relationship.workspace';
import { OtherRelationships } from './other-relationships/other-relationships.component';
import { OtherRelationshipsForm } from './other-relationships/other-relationships.workspace';

const moduleName = '@kenyaemr/esm-patient-clinical-view-app';

const options = {
  featureName: 'patient-clinical-view-app',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

// Dashboard groups and links setup for the patient chart, leveraging the ESM framework lifecycle utilities

// Special Clinics navigation group in the patient chart sidebar
export const specialClinicsSideNavGroup = getSyncLifecycle(createDashboardGroup(specialClinicsNavGroup), options);

// Link and view for clinical encounters in the patient chart
export const inPatientClinicalEncounterLink = getSyncLifecycle(
  createDashboardLink(inPatientClinicalEncounterDashboardMeta),
  options,
);
export const inPatientClinicalEncounter = getSyncLifecycle(ClinicalEncounterDashboard, options);
export const clinicalViewPatientDashboard = getSyncLifecycle(ClinicalViewSection, options);

// Navigation group for HIV Care and Treatment in the patient chart sidebar
export const hivCareAndTreatMentSideNavGroup = getSyncLifecycle(
  createDashboardGroup(hivCareAndTreatmentNavGroup),
  options,
);

// Dashboard links for HIV Care and Treatment services and views for clinical encounters
export const defaulterTracingLink = getSyncLifecycle(createDashboardLink(defaulterTracingDashboardMeta), options);
export const htsDashboardLink = getSyncLifecycle(createDashboardLink(htsDashboardMeta), options);
export const htsClinicalView = getSyncLifecycle(HivTestingEncountersList, options);
export const defaulterTracing = getSyncLifecycle(DefaulterTracing, options);

// Dashboard links for Family History and the corresponding view in the patient chart
export const familyHistory = getSyncLifecycle(FamilyHistory, options);
export const familyHistoryLink = getSyncLifecycle(createDashboardLink(familyHistoryDashboardMeta), options);
export const familyRelationshipForm = getSyncLifecycle(FamilyRelationshipForm, options);

// Dashboard links for Other relationships and the corresponding view in the patient chart
export const otherRelationships = getSyncLifecycle(OtherRelationships, options);
export const otherRelationshipsLink = getSyncLifecycle(createDashboardLink(otherRelationshipsDashboardMeta), options);
export const otherRelationshipsForm = getSyncLifecycle(OtherRelationshipsForm, options);

// Relationships links for Family History and the corresponding view in the patient chart
export const relationshipsLink = getSyncLifecycle(createDashboardLink(relationshipsDashboardMeta), options);
export const relationships = getSyncLifecycle(Relationships, options);

// Contacts
export const contactList = getSyncLifecycle(ContactList, options);
export const contactListLink = getSyncLifecycle(createDashboardLink(contactListDashboardMeta), options);
export const contactListForm = getSyncLifecycle(ContactListForm, options);
export const birthDateCalculator = getSyncLifecycle(BirthDateCalculator, options);

// Navigation group for Maternal and Child Health in the patient chart sidebar
export const maternalAndChildHealthSideNavGroup = getSyncLifecycle(
  createDashboardGroup(maternalAndChildHealthNavGroup),
  options,
);

// Views for Maternal and Child Health services like Antenatal Care, Postnatal Care, and Labour & Delivery
export const antenatalCare = getSyncLifecycle(AntenatalCare, options);
export const postnatalCare = getSyncLifecycle(PostnatalCare, options);
export const labourAndDelivery = getSyncLifecycle(LabourDelivery, options);

// Case Management
export const caseManagementDashboardLink = getSyncLifecycle(createLeftPanelLink(caseManagementDashboardMeta), options);
export const wrapComponent = getSyncLifecycle(WrapComponent, options);
export const caseManagementForm = getSyncLifecycle(CaseManagementForm, options);
export const caseEncounterDashboardLink = getSyncLifecycle(createDashboardLink(caseEncounterDashboardMeta), options);
// export const caseEncounterHeader = getSyncLifecycle(CaseEncounterHeader, options);
export const caseEncounterTable = getSyncLifecycle(CaseEncounterOverviewComponent, options);

// Dashboard links for Maternal and Child Health services
export const antenatalCareLink = getSyncLifecycle(createDashboardLink(antenatalDashboardMeta), options);
export const postnatalCareLink = getSyncLifecycle(createDashboardLink(postnatalDashboardMeta), options);
export const labourAndDeliveryLink = getSyncLifecycle(createDashboardLink(labourAndDeliveryDashboardMeta), options);

export const genericNavLinks = getSyncLifecycle(GenericNavLinks, options);
export const genericDashboard = getSyncLifecycle(GenericDashboard, options);

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}
