import { ETLLogs } from '../Types';

export const LogMsg = [
  {
    procedure: 'initial_population_of_tables',
    startTime: '2024-11-28T09:30:12',
    endTime: '2024-11-28T09:33:15',
    completionStatus: 'Success',
  },
  {
    procedure: 'initial_creation_of_tables',
    startTime: '2024-11-28T09:30:12',
    endTime: '2024-11-28T09:33:15',
    completionStatus: 'Failed',
  },
] as Array<ETLLogs>;

export const useLogData = () =>
  LogMsg.map(({ procedure, startTime, endTime, completionStatus }) => ({
    procedure,
    startTime,
    endTime,
    completionStatus,
  }));
