import React, { useMemo, useState } from 'react';
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
} from '@carbon/react';
import { Add, Edit } from '@carbon/react/icons';
import {
  ErrorState,
  WorkspaceContainer,
  isDesktop as desktopLayout,
  launchWorkspace,
  useLayoutType,
} from '@openmrs/esm-framework';
import styles from './locations-table.scss';
import { CardHeader } from '@openmrs/esm-patient-common-lib';
import { useFacilityLocations } from '../hooks/UseFacilityLocations';

const LocationsTable: React.FC = () => {
  const { t } = useTranslation();
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { allLocations, isLoading, error, mutate } = useFacilityLocations();

  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const responsiveSize = isTablet ? 'lg' : 'sm';
  const isDesktop = desktopLayout(layout);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const searchedLocations = useMemo(() => {
    if (!allLocations || !Array.isArray(allLocations)) {
      return [];
    }

    if (!searchTerm.trim()) {
      return allLocations;
    }

    const lowercaseSearchTerm = searchTerm.toLowerCase();

    const matchingLocations = [];
    const nonMatchingLocations = [];

    allLocations.forEach((location) => {
      const name = (location.name || location.display || '').toLowerCase();
      const description = (location.description || '').toLowerCase();
      const masterFacilityCode = (location?.attributes?.map((attr) => attr.value)?.[0] || '').toLowerCase();
      const address = `${location.address5 || ''} ${location.address6 || ''}`.trim().toLowerCase();
      const countyDistrict = (location.countyDistrict || '').toLowerCase();
      const stateProvince = (location.stateProvince || '').toLowerCase();
      const country = (location.country || '').toLowerCase();

      const isMatch =
        name.includes(lowercaseSearchTerm) ||
        description.includes(lowercaseSearchTerm) ||
        masterFacilityCode.includes(lowercaseSearchTerm) ||
        address.includes(lowercaseSearchTerm) ||
        countyDistrict.includes(lowercaseSearchTerm) ||
        stateProvince.includes(lowercaseSearchTerm) ||
        country.includes(lowercaseSearchTerm);

      if (isMatch) {
        matchingLocations.push({ ...location, isMatch: true });
      } else {
        nonMatchingLocations.push({ ...location, isMatch: false });
      }
    });

    return [...matchingLocations, ...nonMatchingLocations];
  }, [allLocations, searchTerm]);

  const totalCount = searchedLocations.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedLocations = searchedLocations.slice(startIndex, endIndex);

  const paginated = totalPages > 1;

  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm.trim() || !text) {
      return text;
    }

    const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} style={{ backgroundColor: '#ffeb3b', padding: '0 2px' }}>
          {part}
        </mark>
      ) : (
        part
      ),
    );
  };

  const locationData = useMemo(() => {
    if (!paginatedLocations || !Array.isArray(paginatedLocations)) {
      return [];
    }

    return paginatedLocations.map((location) => ({
      uuid: location.uuid,
      name: location.name || location.display,
      display: location.display,
      description: location.description || '-',
      stateProvince: location.stateProvince || '-',
      country: location.country || '-',
      countyDistrict: location.countyDistrict || '-',
      address: `${location.address5 || ''} ${location.address6 || ''}`.trim() || '-',
      masterFacilityCode: location?.attributes?.map((attr) => attr.value)?.[0] || '-',
      tags: location.tags || [],
      location: location,
      isMatch: location.isMatch || false,
    }));
  }, [paginatedLocations]);

  const handleAddLocationWorkspace = () => {
    launchWorkspace('add-location-workspace', {
      workspaceTitle: t('addLocation', 'Add Location'),
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
      key: 'masterFacilityCode',
      header: t('facilityCode', 'Facility Code'),
    },
    {
      key: 'address',
      header: t('address', 'Address'),
    },
    {
      key: 'countyDistrict',
      header: t('district', 'District'),
    },
    {
      key: 'stateProvince',
      header: t('province', 'Province'),
    },
    {
      key: 'country',
      header: t('country', 'Country'),
    },
    {
      key: 'actions',
      header: t('actions', 'Actions'),
    },
  ];

  const tableRows = useMemo(() => {
    return locationData.map((location) => ({
      id: location.uuid,
      name: highlightSearchTerm(location.name, searchTerm),
      description: highlightSearchTerm(location.description, searchTerm),
      masterFacilityCode: highlightSearchTerm(location.masterFacilityCode, searchTerm),
      address: highlightSearchTerm(location.address, searchTerm),
      countyDistrict: highlightSearchTerm(location.countyDistrict, searchTerm),
      stateProvince: highlightSearchTerm(location.stateProvince, searchTerm),
      country: highlightSearchTerm(location.country, searchTerm),
      actions: (
        <>
          <Button
            renderIcon={Edit}
            onClick={() => {
              launchWorkspace('add-location-workspace', {
                workspaceTitle: t('editLocation', 'Edit location'),
                location: location.location,
              });
            }}
            kind={'ghost'}
            iconDescription={t('editLocation', 'Edit location')}
            hasIconOnly
            size={responsiveSize}
            tooltipPosition="right"
          />
        </>
      ),
    }));
  }, [locationData, searchTerm, responsiveSize, mutate, t]);

  if (isLoading && !allLocations?.length) {
    return (
      <>
        <div className={styles.widgetCard}>
          <DataTableSkeleton role="progressbar" compact={isDesktop} zebra />
        </div>
      </>
    );
  }

  if (error) {
    const headerTitle = t('errorFetchingLocations', 'Error fetching locations');
    return (
      <>
        <div className={styles.widgetCard}>
          <ErrorState error={error} headerTitle={headerTitle} />
        </div>
      </>
    );
  }

  return (
    <>
      <div className={styles.widgetCard}>
        <CardHeader title={t('locations', 'Locations')}>
          <span className={styles.backgroundDataFetchingIndicator}>
            <span>{isLoading ? <InlineLoading /> : null}</span>
          </span>
          <div className={styles.headerActions}>
            <>
              <div className={styles.filterContainer}>
                <Search
                  onChange={handleSearch}
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
            </>
          </div>
        </CardHeader>

        <DataTable rows={tableRows} headers={tableHeaders} isSortable size={isTablet ? 'lg' : 'sm'} useZebraStyles>
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
                      <TableRow
                        key={row.id}
                        style={{
                          backgroundColor: locationData.find((loc) => loc.uuid === row.id)?.isMatch
                            ? '#f0f8ff'
                            : 'transparent',
                        }}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>{cell.value}</TableCell>
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
                            ? t(
                                'searchResults',
                                `Found ${searchedLocations.filter((loc) => loc.isMatch).length} matching results`,
                              )
                            : t('noData', 'No data to display')}
                        </p>
                        <p className={styles.helper}>
                          {searchTerm
                            ? t('matchingResultsShownFirst', 'Matching results are shown first and highlighted')
                            : t('checkFilters', 'Check the filters above')}
                        </p>
                      </div>
                    </Tile>
                  </div>
                ) : null}
                {paginated && (
                  <Pagination
                    backwardText="Previous page"
                    forwardText="Next page"
                    page={currentPage}
                    pageNumberText="Page Number"
                    pageSize={pageSize}
                    pageSizes={[10, 20, 30, 40, 50]}
                    totalItems={totalCount}
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
                )}
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
