import { ActiveRequests, LabManifest, LabManifestSample } from './types';

export const labManifest: LabManifest[] = [
  {
    uuid: '3d5c12c3-737f-495b-b987-26a7cf5d0fed',
    startDate: '2023-01-12T00:00:00.000Z',
    endDate: '2023-01-12T00:00:00.000Z',
    manifestType: 'VL',
    courierName: 'Nyeri chmt',
    labPersonContact: '0727112355',
    dispatchDate: '2023-01-12T00:00:00.000Z',
    manifestStatus: 'draft',
  },
  {
    uuid: '3d5c12c3-737f-495b-b987-26a7cf5d0fef',
    startDate: '2023-03-12T00:00:00.000Z',
    endDate: '2024-03-12T00:00:00.000Z',
    manifestType: 'VL',
    courierName: 'Kijabe chmt',
    labPersonContact: '0727112355',
    dispatchDate: '2024-03-12T00:00:00.000Z',
    manifestStatus: 'draft',
  },
  {
    uuid: '3d5c12c3-737f-495b-b987-26a7cf5d0fe1',
    startDate: '2023-04-12T00:00:00.000Z',
    endDate: '2024-07-12T00:00:00.000Z',
    manifestType: 'VL',
    courierName: 'Longisa chmt',
    labPersonContact: '0727112355',
    dispatchDate: '2024-07-12T00:00:00.000Z',
    manifestStatus: 'readyToSend',
  },
  {
    uuid: '3d5c12c3-737f-495b-b987-26a7cf5d0fe2',
    startDate: '2023-04-12T00:00:00.000Z',
    endDate: '2024-01-12T00:00:00.000Z',
    manifestType: 'VL',
    courierName: 'Kabete chmt',
    labPersonContact: '0727112355',
    dispatchDate: '2024-01-12T00:00:00.000Z',
    manifestStatus: 'readyToSend',
  },
  {
    uuid: '3d5c12c3-737f-495b-b987-26a7cf5d0fe3',
    startDate: '2023-05-12T00:00:00.000Z',
    endDate: '2024-03-12T00:00:00.000Z',
    manifestType: 'VL',
    courierName: 'Migori chmt',
    labPersonContact: '0727112355',
    dispatchDate: '2024-05-12T00:00:00.000Z',
    manifestStatus: 'sending',
  },
  {
    uuid: '3d5c12c3-737f-495b-b987-26a7cf5d0fe4',
    startDate: '2023-05-12T00:00:00.000Z',
    endDate: '2024-02-12T00:00:00.000Z',
    manifestType: 'VL',
    courierName: 'Kisumu chmt',
    labPersonContact: '0727112355',
    dispatchDate: '2024-02-12T00:00:00.000Z',
    manifestStatus: 'submitted',
  },
  {
    uuid: '3d5c12c3-737f-495b-b987-26a7cf5d0fe5',
    startDate: '2023-01-12T00:00:00.000Z',
    endDate: '2024-01-12T00:00:00.000Z',
    manifestType: 'VL',
    courierName: 'Mombasa chmt',
    labPersonContact: '0727112355',
    dispatchDate: '2024-01-12T00:00:00.000Z',
    manifestStatus: 'submitted',
  },
];

export const labManifestSamples: LabManifestSample[] = [];

export const activeRequests: ActiveRequests[] = [];
