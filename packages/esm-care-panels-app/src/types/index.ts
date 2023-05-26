export interface HivSummary {
  lastEncounter: {
    regimenShortDisplay: string,
    current: boolean,
    startDate: string,
    endDate: string,
  },
  firstEncounter: {
    regimenShortDisplay: string,
    current: boolean,
    startDate: string,
    endDate: string,
  }
  summary: {
    whoStage: string,
    cd4: string,
    cd4Percent: string,
    ldl_default_value: number,
    ldl_value: string,
    ldl_date: string
  }
}