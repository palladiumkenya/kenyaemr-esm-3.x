export type DashboardConfig = {
  name: string;
  slot: string;
  title: string;
};

export interface MappedAdrEncounter {
  encounterUuid: string;
  encounterTypeUuid: string;
  patientUuid: string;
  patientName: string;
  encounterType: string;
  encounterDatetime: string;
  visitTypeName: string;
  formName: string;
  location: string;
  provider: string;
  formUuid?: string;
  visitUuid?: string;
  visitTypeUuid?: string;
}
