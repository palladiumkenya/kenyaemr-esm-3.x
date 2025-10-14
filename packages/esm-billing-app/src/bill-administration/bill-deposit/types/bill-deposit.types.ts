import { type Patient } from '@openmrs/esm-framework';

export interface BillDeposit {
  uuid: string;
  display: string;
  patient: Patient;
  amount: number;
  depositType: string;
  status: string;
  referenceNumber: string;
  description: string;
  transactions: Array<BillDepositTransaction>;
  dateCreated: string;
  voided: boolean;
  availableBalance: number;
}

export interface BillDepositTransaction {
  uuid: string;
  display: string;
  amount: number;
  transactionType: string;
  dateCreated: string;
  reason?: string;
  voided: boolean;
}

export interface DepositFormData {
  amount: number;
  depositType: string;
  referenceNumber: string;
  description: string;
  status: string;
}

export interface BillDepositWorkspaceProps {
  patientUuid: string;
  patient: Patient;
}

export interface CreateDepositPayload {
  patient: string;
  amount: number;
  depositType: string;
  referenceNumber: string;
  description: string;
  status: string;
}

export type FormattedDeposit = {
  id: string;
  depositType: string;
  amount: number;
  status: string;
  dateCreated: string;
  referenceNumber: string;
  availableBalance: number;
  patient: Patient;
  description: string;
  transactions: Array<BillDepositTransaction>;
};
