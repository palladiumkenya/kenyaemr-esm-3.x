import React from 'react';
import { usePaginationInfo } from '@openmrs/esm-patient-common-lib';
import {
  DataTable,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Pagination,
} from '@carbon/react';

export interface UterineContractionsTableRow {
  id: string;
  date: string;
  timeSlot: string;
  contractionCount: string;
  contractionLevel: string;
  protein?: string;
  acetone?: string;
  volume?: string;
}

interface UterineContractionsTableProps {
  tableData: UterineContractionsTableRow[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  controlSize: 'sm' | 'md';
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const UterineContractionsTable: React.FC<UterineContractionsTableProps> = ({
  tableData,
  currentPage,
  pageSize,
  totalItems,
  controlSize,
  onPageChange,
  onPageSizeChange,
}) => {
  const totalPages = pageSize > 0 ? Math.ceil(totalItems / pageSize) : 0;
  const { pageSizes: calculatedPageSizes, itemsDisplayed } = usePaginationInfo(
    pageSize,
    totalPages,
    currentPage,
    tableData.length,
  );

  return (
    <TableContainer>
      <Table size={controlSize} useZebraStyles>
        <TableHead>
          <TableRow>
            <TableHeader>Date</TableHeader>
            <TableHeader>Time Slot</TableHeader>
            <TableHeader>Contraction Count</TableHeader>
            <TableHeader>Contraction Level</TableHeader>
            <TableHeader>Protein</TableHeader>
            <TableHeader>Acetone</TableHeader>
            <TableHeader>Volume (ml)</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {tableData.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.date}</TableCell>
              <TableCell>{row.timeSlot}</TableCell>
              <TableCell>{row.contractionCount}</TableCell>
              <TableCell>{row.contractionLevel}</TableCell>
              <TableCell>{row.protein || ''}</TableCell>
              <TableCell>{row.acetone || ''}</TableCell>
              <TableCell>{row.volume || ''}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination
        page={currentPage}
        pageSize={pageSize}
        totalItems={totalItems}
        pageSizes={calculatedPageSizes}
        onChange={({ page, pageSize }) => {
          onPageChange(page);
          onPageSizeChange(pageSize);
        }}
      />
      <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#444' }}>{itemsDisplayed}</div>
    </TableContainer>
  );
};

export default UterineContractionsTable;
