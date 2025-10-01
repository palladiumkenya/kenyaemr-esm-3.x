import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Layer,
  Grid,
  Column,
  Tag,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Button,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Pagination,
} from '@carbon/react';
import { Add, ChartColumn, Table as TableIcon } from '@carbon/react/icons';
import { LineChart } from '@carbon/charts-react';
import { useSession, useLayoutType } from '@openmrs/esm-framework';
import '@carbon/charts/styles.css';
import styles from './partography.scss';
import PartographyDataForm from './partography-data-form.component';
import {
  usePartographyData,
  createPartographyEncounter,
  transformEncounterToChartData,
  transformEncounterToTableData,
} from './partography.resource';
import { getTranslatedPartographyGraphs, getPartographyTableHeaders, getColorForGraph } from './types/index';

enum ScaleTypes {
  LABELS = 'labels',
  LINEAR = 'linear',
}

type PartographyProps = {
  patientUuid: string;
};

const Partograph: React.FC<PartographyProps> = ({ patientUuid }) => {
  const { t } = useTranslation();

  const session = useSession();
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const controlSize = isTablet ? 'md' : 'sm';
  const [selectedTab, setSelectedTab] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedGraphType, setSelectedGraphType] = useState<string>('');
  const [graphData, setGraphData] = useState<Record<string, any[]>>({});
  const [viewMode, setViewMode] = useState<Record<string, 'graph' | 'table'>>({});
  const [currentPage, setCurrentPage] = useState<Record<string, number>>({});
  const [pageSize, setPageSize] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

  const partographGraphs = useMemo(() => getTranslatedPartographyGraphs(t), [t]);

  useEffect(() => {
    const initialViewMode = {};
    const initialCurrentPage = {};
    const initialPageSize = {};
    const initialLoading = {};

    partographGraphs.forEach((graph) => {
      initialViewMode[graph.id] = 'graph';
      initialCurrentPage[graph.id] = 1;
      initialPageSize[graph.id] = 5;
      initialLoading[graph.id] = true;
    });

    setViewMode(initialViewMode);
    setCurrentPage(initialCurrentPage);
    setPageSize(initialPageSize);
    setIsLoading(initialLoading);
  }, [partographGraphs]);

  const useGraphData = (graphType: string) => {
    const { data: encounters, isLoading, mutate } = usePartographyData(patientUuid || '', graphType);

    useEffect(() => {
      if (!isLoading) {
        const chartData = transformEncounterToChartData(encounters, graphType);

        setGraphData((prevData) => ({
          ...prevData,
          [graphType]: chartData,
        }));

        setIsLoading((prevLoading) => ({
          ...prevLoading,
          [graphType]: false,
        }));
      }
    }, [encounters, isLoading, graphType]);

    return { encounters, isLoading, mutate };
  };

  const fetalHeartRateData = useGraphData('fetal-heart-rate');
  const cervicalDilationData = useGraphData('cervical-dilation');
  const descentOfHeadData = useGraphData('descent-of-head');
  const uterineContractionsData = useGraphData('uterine-contractions');
  const maternalPulseData = useGraphData('maternal-pulse');
  const bloodPressureData = useGraphData('blood-pressure');
  const temperatureData = useGraphData('temperature');
  const urineAnalysisData = useGraphData('urine-analysis');
  const drugsFluidsData = useGraphData('drugs-fluids');
  const progressEventsData = useGraphData('progress-events');

  const graphDataHooks = {
    'fetal-heart-rate': fetalHeartRateData,
    'cervical-dilation': cervicalDilationData,
    'descent-of-head': descentOfHeadData,
    'uterine-contractions': uterineContractionsData,
    'maternal-pulse': maternalPulseData,
    'blood-pressure': bloodPressureData,
    temperature: temperatureData,
    'urine-analysis': urineAnalysisData,
    'drugs-fluids': drugsFluidsData,
    'progress-events': progressEventsData,
  };

  if (!patientUuid) {
    return (
      <div className={styles.partographyContainer}>
        <Layer>
          <Grid>
            <Column lg={16} md={8} sm={4}>
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h4>{t('noPatientSelected', 'No patient selected')}</h4>
                <p>{t('selectPatientMessage', 'Please select a patient to view partography data.')}</p>
              </div>
            </Column>
          </Grid>
        </Layer>
      </div>
    );
  }

  const handleAddDataPoint = (graphId: string) => {
    setSelectedGraphType(graphId);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      setIsLoading((prev) => ({
        ...prev,
        [formData.graphType]: true,
      }));

      const encounterResult = await createPartographyEncounter(
        patientUuid,
        formData.graphType,
        formData,
        session?.sessionLocation?.uuid,
        session?.user?.uuid,
        t,
      );

      if (!encounterResult.success) {
        throw new Error(encounterResult.message);
      }

      const currentHook = graphDataHooks[formData.graphType];
      if (currentHook?.mutate) {
        await currentHook.mutate();
      }

      setIsFormOpen(false);
      setSelectedGraphType('');
    } catch (error) {
      setIsLoading((prev) => ({
        ...prev,
        [formData.graphType]: false,
      }));
      alert(`Failed to save partography data: ${error.message}. Please try again.`);
    } finally {
      setIsLoading((prev) => ({
        ...prev,
        [formData.graphType]: false,
      }));
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedGraphType('');
  };

  const handleViewModeChange = (graphId: string, mode: 'graph' | 'table') => {
    setViewMode((prev) => ({
      ...prev,
      [graphId]: mode,
    }));
  };

  const handlePageChange = (graphId: string, page: number) => {
    setCurrentPage((prev) => ({
      ...prev,
      [graphId]: page,
    }));
  };

  const handlePageSizeChange = (graphId: string, size: number) => {
    setPageSize((prev) => ({
      ...prev,
      [graphId]: size,
    }));
    setCurrentPage((prev) => ({
      ...prev,
      [graphId]: 1,
    }));
  };

  const getTableData = (graph) => {
    const currentHook = graphDataHooks[graph.id];

    if (!currentHook?.encounters) {
      return [];
    }

    const transformedData = transformEncounterToTableData(currentHook.encounters, graph.id, t);

    return transformedData;
  };

  const getValueStatus = (value: number, graph) => {
    if (!value || typeof value !== 'number') {
      return 'normal';
    }

    const normalRanges = {
      'fetal-heart-rate': { min: 110, max: 160 },
      'maternal-pulse': { min: 60, max: 100 },
      temperature: { min: 36, max: 37.5 },
      'blood-pressure': { min: 90, max: 140 },
    };

    const range = normalRanges[graph.id];
    if (!range) {
      return 'normal';
    }

    if (value < range.min) {
      return 'low';
    }
    if (value > range.max) {
      return 'high';
    }
    return 'normal';
  };

  const renderGraph = (graph) => {
    const chartData = graphData[graph.id] || [];
    const currentViewMode = viewMode[graph.id] || 'graph';
    const tableData = getTableData(graph);
    const currentPageNum = currentPage[graph.id] || 1;
    const currentPageSize = pageSize[graph.id] || 5;
    const isGraphLoading = isLoading[graph.id] || false;

    const totalItems = tableData.length;
    const startIndex = (currentPageNum - 1) * currentPageSize;
    const endIndex = startIndex + currentPageSize;
    const paginatedData = tableData.slice(startIndex, endIndex);

    const chartOptions = {
      title: graph.title,
      axes: {
        bottom: {
          title: t('time', 'Time'),
          mapsTo: 'time',
          scaleType: ScaleTypes.LABELS,
        },
        left: {
          title: graph.yAxisLabel,
          mapsTo: 'value',
          scaleType: ScaleTypes.LINEAR,
          domain: [graph.yMin, graph.yMax],
        },
      },
      curve: 'curveMonotoneX',
      height: '500px',
      color: {
        scale: {
          [chartData[0]?.group]: getColorForGraph(graph.color),
          Systolic: '#ff6b6b',
          Diastolic: '#4ecdc4',
        },
      },
      points: {
        enabled: true,
        radius: 4,
      },
      grid: {
        x: {
          enabled: true,
        },
        y: {
          enabled: true,
        },
      },
    };

    return (
      <div className={styles.graphContainer} key={graph.id}>
        <div className={styles.graphHeader}>
          <div className={styles.graphHeaderLeft}>
            <h6>{graph.title}</h6>
            <Tag type="outline">{graph.normalRange}</Tag>
          </div>
          <div className={styles.graphHeaderRight}>
            <div className={styles.viewSwitcher}>
              <Button
                kind={currentViewMode === 'graph' ? 'primary' : 'secondary'}
                size={controlSize}
                hasIconOnly
                iconDescription={t('graphView', 'Graph View')}
                onClick={() => handleViewModeChange(graph.id, 'graph')}
                className={styles.viewButton}>
                <ChartColumn />
              </Button>
              <Button
                kind={currentViewMode === 'table' ? 'primary' : 'secondary'}
                size={controlSize}
                hasIconOnly
                iconDescription={t('tableView', 'Table View')}
                onClick={() => handleViewModeChange(graph.id, 'table')}
                className={styles.viewButton}>
                <TableIcon />
              </Button>
            </div>
            <Button kind="primary" size={controlSize} renderIcon={Add} onClick={() => handleAddDataPoint(graph.id)}>
              {t('add', 'Add')}
            </Button>
          </div>
        </div>
        <p className={styles.graphDescription}>{graph.description}</p>

        {currentViewMode === 'graph' ? (
          <>
            <div className={styles.chartContainer}>
              {isGraphLoading ? (
                <div className={styles.loadingContainer}>
                  <p>{t('loadingData', 'Loading data...')}</p>
                </div>
              ) : chartData.length > 0 ? (
                <LineChart data={chartData} options={chartOptions} />
              ) : (
                <div className={styles.emptyState}>
                  <p>{t('noDataAvailable', 'No data available for this graph')}</p>
                  <Button
                    kind="primary"
                    size={controlSize}
                    renderIcon={Add}
                    onClick={() => handleAddDataPoint(graph.id)}>
                    {t('addFirstDataPoint', 'Add first data point')}
                  </Button>
                </div>
              )}
            </div>
            {chartData.length > 0 && !isGraphLoading && (
              <div className={styles.chartStats}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>{t('latest', 'Latest')}:</span>
                  <span className={styles.statValue}>
                    {chartData[chartData.length - 1]?.value?.toFixed(1)} {graph.yAxisLabel}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>{t('average', 'Average')}:</span>
                  <span className={styles.statValue}>
                    {(chartData.reduce((sum, item) => sum + item.value, 0) / chartData.length).toFixed(1)}{' '}
                    {graph.yAxisLabel}
                  </span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className={styles.tableContainer}>
            {isGraphLoading ? (
              <div className={styles.loadingContainer}>
                <p>{t('loadingData', 'Loading data...')}</p>
              </div>
            ) : paginatedData.length > 0 ? (
              <>
                <DataTable rows={paginatedData} headers={getPartographyTableHeaders(t)}>
                  {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
                    <TableContainer title="" description="">
                      <Table {...getTableProps()} size="sm">
                        <TableHead>
                          <TableRow>
                            {headers.map((header) => (
                              <TableHeader {...getHeaderProps({ header })} key={header.key}>
                                {header.header}
                              </TableHeader>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {rows.map((row) => (
                            <TableRow {...getRowProps({ row })} key={row.id}>
                              {row.cells.map((cell) => {
                                let cellContent = cell.value;

                                if (cell.info.header === 'value' && row.cells.find((c) => c.info.header === 'value')) {
                                  const cellValue = cell.value;
                                  const status = getValueStatus(parseFloat(cellValue), graph);
                                  const statusClass =
                                    status === 'high' ? styles.highValue : status === 'low' ? styles.lowValue : '';
                                  cellContent = (
                                    <span className={statusClass}>
                                      {cellValue}
                                      {status === 'high' && <span className={styles.arrow}> ↑</span>}
                                      {status === 'low' && <span className={styles.arrow}> ↓</span>}
                                    </span>
                                  );
                                }

                                return <TableCell key={cell.id}>{cellContent}</TableCell>;
                              })}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </DataTable>

                {totalItems > 0 && (
                  <Pagination
                    page={currentPageNum}
                    totalItems={totalItems}
                    pageSize={currentPageSize}
                    pageSizes={[5, 10, 20, 50]}
                    onChange={(event) => {
                      handlePageChange(graph.id, event.page);
                      if (event.pageSize !== currentPageSize) {
                        handlePageSizeChange(graph.id, event.pageSize);
                      }
                    }}
                    size={controlSize}
                  />
                )}
                <div className={styles.tableStats}>
                  <span className={styles.recordCount}>
                    {t('showingResults', 'Showing {{start}}-{{end}} of {{total}} {{itemType}}', {
                      start: totalItems === 0 ? 0 : startIndex + 1,
                      end: Math.min(endIndex, totalItems),
                      total: totalItems,
                      itemType: totalItems === 1 ? t('record', 'record') : t('records', 'records'),
                    })}
                  </span>
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>
                <p>{t('noDataAvailable', 'No data available for this graph')}</p>
                <Button kind="primary" size={controlSize} renderIcon={Add} onClick={() => handleAddDataPoint(graph.id)}>
                  {t('addFirstDataPoint', 'Add first data point')}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.partographyContainer}>
      <Layer>
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <Tabs selectedIndex={selectedTab} onChange={(data) => setSelectedTab(data.selectedIndex)}>
              <TabList className={styles.tabList} aria-label="Partography graphs">
                {partographGraphs.map((graph) => (
                  <Tab key={graph.id}>{graph.title}</Tab>
                ))}
              </TabList>
              <TabPanels>
                {partographGraphs.map((graph) => (
                  <TabPanel key={graph.id}>{renderGraph(graph)}</TabPanel>
                ))}
              </TabPanels>
            </Tabs>
            {isFormOpen && (
              <PartographyDataForm
                isOpen={isFormOpen}
                onClose={handleFormClose}
                onSubmit={handleFormSubmit}
                graphType={selectedGraphType}
                graphTitle={partographGraphs.find((g) => g.id === selectedGraphType)?.title || ''}
              />
            )}
          </Column>
        </Grid>
      </Layer>
    </div>
  );
};

export default Partograph;
