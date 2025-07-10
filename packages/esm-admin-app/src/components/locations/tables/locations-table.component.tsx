import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DataTable,
  DataTableSkeleton,
  InlineLoading,
  Pagination,
  Search,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tile,
  Tag,
} from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { WorkspaceContainer, isDesktop as desktopLayout, launchWorkspace, useLayoutType } from '@openmrs/esm-framework';
import styles from './locations-table.scss';
import { CardHeader } from '@openmrs/esm-patient-common-lib';
import { useFacilitiesTagged } from './locations-table.resource';
import { useLocationTags } from '../hooks/useLocationTags';

const LocationsTable: React.FC = () => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const isDesktop = desktopLayout(layout);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { locationTagList, isLoading: tagsLoading, error: tagsError } = useLocationTags();
  const { facilityList, isLoading: taggedLoading } = useFacilitiesTagged({ results: locationTagList });

  const handleAddLocationWorkspace = () => {
    launchWorkspace('add-location-workspace', {
      workspaceTitle: t('addLocation', 'Add Location'),
    });
  };

  const handleSearchLocationWorkspace = () => {
    launchWorkspace('search-location-workspace', {
      workspaceTitle: t('tagLocation', 'Tag Location'),
    });
  };

  const tableHeaders = [
    {
      key: 'name',
      header: t('locationName', 'Location Name'),
    },
    {
      key: 'description',
      header: t('description', 'Description'),
    },
    {
      key: 'tags',
      header: t('tags', 'Tags'),
    },
  ];

  const getLocationTags = (resource) => {
    if (!resource?.meta?.tag) {
      return [];
    }

    return resource.meta.tag.filter((tag) => tag.system && tag.system.includes('location-tag')).map((tag) => tag.code);
  };

  const rows = useMemo(() => {
    const uniqueFacilities = new Map();

    facilityList.forEach((facility) => {
      const resource = facility.resource;
      const uuid = resource?.id;

      if (uuid && !uniqueFacilities.has(uuid)) {
        uniqueFacilities.set(uuid, facility);
      }
    });

    return Array.from(uniqueFacilities.values()).map((facility) => {
      const resource = facility.resource;
      const tags = getLocationTags(resource);

      return {
        id: resource?.id,
        name: resource?.name || resource?.partOf?.display || '--',
        description: resource?.description || '--',
        tags: tags.length > 0 ? tags.join(', ') : '--',
      };
    });
  }, [facilityList]);

  const filteredRows = useMemo(() => {
    if (!searchTerm) {
      return rows;
    }

    return rows.filter(
      (row) =>
        row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.tags.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [rows, searchTerm]);

  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredRows.slice(startIndex, endIndex);
  }, [filteredRows, currentPage, pageSize]);

  if (tagsLoading || (taggedLoading && !facilityList.length)) {
    return (
      <>
        <div className={styles.widgetCard}>
          <DataTableSkeleton role="progressbar" compact={isDesktop} zebra />
        </div>
      </>
    );
  }

  return (
    <>
      <div className={styles.widgetCard}>
        <CardHeader title={t('locations', 'Locations')}>
          <span className={styles.backgroundDataFetchingIndicator}>
            <span>{tagsLoading ? <InlineLoading /> : null}</span>
          </span>
          <div className={styles.headerActions}>
            <>
              <div className={styles.filterContainer}>
                <Search
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder={t('search', 'Search location')}
                  value={searchTerm}
                  labelText={t('search', 'Search location')}
                />
              </div>
              <Button
                kind="ghost"
                renderIcon={(props) => <Add size={16} {...props} />}
                onClick={handleAddLocationWorkspace}>
                {t('addLocation', 'Add Location')}
              </Button>
              <Button
                kind="ghost"
                renderIcon={(props) => <Add size={16} {...props} />}
                onClick={handleSearchLocationWorkspace}>
                {t('tagLocation', 'Tag Location')}
              </Button>
            </>
          </div>
        </CardHeader>

        <DataTable rows={paginatedRows} headers={tableHeaders} isSortable size={isTablet ? 'lg' : 'sm'} useZebraStyles>
          {({ rows, headers, getTableProps }) => {
            return (
              <TableContainer>
                <Table {...getTableProps()}>
                  <TableHead>
                    <TableRow>
                      {headers.map((header) => (
                        <TableHeader key={header.key}>{header.header}</TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>
                            {cell.id.includes('tags') && cell.value !== 'No tags' ? (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                {cell.value.split(', ').map((tag, index) => (
                                  <Tag key={index} type="blue" size="sm">
                                    {tag}
                                  </Tag>
                                ))}
                              </div>
                            ) : (
                              cell.value
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {rows.length === 0 ? (
                  <div className={styles.tileContainer}>
                    <Tile className={styles.tile}>
                      <div className={styles.tileContent}>
                        <p className={styles.content}>
                          {searchTerm
                            ? t('noSearchResults', `No results found for "${searchTerm}"`)
                            : t('noData', 'No data to display')}
                        </p>
                        <p className={styles.helper}>
                          {searchTerm
                            ? t('tryDifferentSearch', 'Try a different search term')
                            : t('checkFilters', 'Check the filters above')}
                        </p>
                      </div>
                    </Tile>
                  </div>
                ) : null}
                <Pagination
                  backwardText="Previous page"
                  forwardText="Next page"
                  page={currentPage}
                  pageSize={pageSize}
                  pageSizes={[10, 20, 30, 40, 50]}
                  totalItems={filteredRows.length}
                  onChange={({ pageSize: newPageSize, page }) => {
                    if (newPageSize !== pageSize) {
                      setPageSize(newPageSize);
                      setCurrentPage(1);
                    }
                    if (page !== currentPage) {
                      setCurrentPage(page);
                    }
                  }}
                />
              </TableContainer>
            );
          }}
        </DataTable>
      </div>
      <WorkspaceContainer contextKey="locations" />
    </>
  );
};

export default LocationsTable;
