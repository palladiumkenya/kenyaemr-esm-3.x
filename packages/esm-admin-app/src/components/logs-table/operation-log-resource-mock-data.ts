import { ETLLogs } from '../../types';

export const LogMsg = [
  {
    procedure: 'initial population of tables',
    startTime: '2024-11-28T09:30:12',
    endTime: '2024-11-28T09:33:15',
    completionStatus: 'Success',
  },
  {
    procedure: 'initial creation of tables',
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
