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
  visit: string;
  form: string;
  location: string;
  provider: string;
}
