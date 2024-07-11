import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MappedBill } from '../../../types';

interface BillsContextProps {
  bills: MappedBill[];
  setBills: (bills: MappedBill[]) => void;
}

const BillsContext = createContext<BillsContextProps | undefined>(undefined);

export const BillsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [bills, setBills] = useState<MappedBill[]>([]);

  return <BillsContext.Provider value={{ bills, setBills }}>{children}</BillsContext.Provider>;
};

export const useBillsContext = () => {
  const context = useContext(BillsContext);
  if (!context) {
    throw new Error('useBillsContext must be used within a BillsProvider');
  }
  return context;
};
