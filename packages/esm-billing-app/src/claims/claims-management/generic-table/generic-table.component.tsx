import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
  Pagination,
  TableExpandHeader,
  TableExpandRow,
  TableExpandedRow,
  ContentSwitcher,
  Switch,
} from '@carbon/react';
import { isDesktop, useLayoutType } from '@openmrs/esm-framework';
import { CardHeader } from '@openmrs/esm-patient-common-lib';
import styles from './generic-table.scss';

interface GenericDataTableProps {
  cardTitle: string;
  contentSwitcherTabs: { name: string; component: ReactNode }[];
  rows: any[];
  headers: any[];
  renderExpandedRow?: (row: any) => ReactNode;
  bills: any[];
  paginated?: boolean;
  pageSizes?: number[];
  currentPage?: number;
  goTo?: (page: number) => void;
}

const GenericDataTable: React.FC<GenericDataTableProps> = ({
  cardTitle,
  contentSwitcherTabs,
  rows,
  headers,
  renderExpandedRow,
  paginated = true,
  pageSizes = [10, 20, 30],
  currentPage = 1,
  goTo,
}) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const [pageSize, setPageSize] = React.useState(pageSizes[0]);
  const responsiveSize = isDesktop(layout) ? 'sm' : 'lg';
  const [activeIndex, setActiveIndex] = React.useState(0);

  return (
    <div>
      <CardHeader title={t(cardTitle, cardTitle)}>
        <div className={styles.contentSwitcherWrapper}>
          <div className={styles.switcherContainer}>
            <ContentSwitcher
              className={styles.contentSwitcher}
              size="lg"
              selectedIndex={activeIndex}
              onChange={(event) => setActiveIndex(event.index)}>
              {contentSwitcherTabs.map((tab, index) => (
                <Switch key={index} name={tab.name} text={tab.name} />
              ))}
            </ContentSwitcher>
          </div>
        </div>
      </CardHeader>
    </div>
  );
};

export default GenericDataTable;
