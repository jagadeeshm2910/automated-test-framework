import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Alert,
  CircularProgress,
  Pagination,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Visibility,
  Download,
  ExpandMore,
  CheckCircle,
  Error,
  Warning,
  Schedule,
  Image,
  Search,
  Refresh,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { ResultsQuery, TestResult } from '../types/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const Results: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tabValue, setTabValue] = useState(0);
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [screenshotDialogOpen, setScreenshotDialogOpen] = useState(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const testId = searchParams.get('test_id');
  const metadataId = searchParams.get('metadata_id');

  // Fetch test results
  const { data: resultsData, isLoading, refetch } = useQuery({
    queryKey: ['results', { testId, metadataId, status: filterStatus, page, search: searchQuery }],
    queryFn: () => apiService.getResults({
      test_id: testId || undefined,
      metadata_id: metadataId || undefined,
      status: filterStatus !== 'all' ? filterStatus : undefined,
      page,
      limit: pageSize,
      search: searchQuery || undefined,
    } as ResultsQuery),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch result details when a result is selected
  const { data: resultDetail } = useQuery({
    queryKey: ['result-detail', selectedResult?.id],
    queryFn: () => selectedResult ? apiService.getResultDetail(selectedResult.id) : null,
    enabled: !!selectedResult,
  });

  const handleViewDetail = (result: TestResult) => {
    setSelectedResult(result);
    setDetailDialogOpen(true);
  };

  const handleViewScreenshot = (screenshotUrl: string) => {
    setSelectedScreenshot(screenshotUrl);
    setScreenshotDialogOpen(true);
  };

  const handleDownloadResult = (result: TestResult) => {
    // Create a downloadable JSON file
    const dataStr = JSON.stringify(result, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `test-result-${result.id}.json`;
    link.click();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle color="success" />;
      case 'failed':
        return <Error color="error" />;
      case 'warning':
        return <Warning color="warning" />;
      case 'running':
        return <Schedule color="info" />;
      default:
        return <Schedule />;
    }
  };

  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'success':
        return 'success';
      case 'failed':
        return 'error';
      case 'warning':
        return 'warning';
      case 'running':
        return 'info';
      default:
        return 'default';
    }
  };

  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
    const newParams = new URLSearchParams(searchParams);
    if (status === 'all') {
      newParams.delete('status');
    } else {
      newParams.set('status', status);
    }
    setSearchParams(newParams);
    setPage(1);
  };

  const results = resultsData?.results || [];
  const totalPages = Math.ceil((resultsData?.total || 0) / pageSize);

  // Group results by status for stats
  const statusCounts = results.reduce((acc: Record<string, number>, result: TestResult) => {
    acc[result.status] = (acc[result.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Test Results
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Browse and analyze your UI test results and screenshots
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => refetch()}
        >
          Refresh
        </Button>
      </Box>

      {/* Quick Stats */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 18%', minWidth: '180px' }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4">
                {resultsData?.total || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Results
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 18%', minWidth: '180px' }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {statusCounts.success || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Successful
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 18%', minWidth: '180px' }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {statusCounts.failed || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Failed
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 18%', minWidth: '180px' }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {statusCounts.warning || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Warnings
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 18%', minWidth: '180px' }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {statusCounts.running || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Running
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 300px', minWidth: '200px' }}>
            <TextField
              fullWidth
              placeholder="Search results..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Box>
          <Box sx={{ flex: '0 0 200px', minWidth: '200px' }}>
            <FormControl fullWidth>
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => handleFilterChange(e.target.value)}
                label="Status Filter"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="success">Success</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
                <MenuItem value="warning">Warning</MenuItem>
                <MenuItem value="running">Running</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Paper>

      {/* Results Table */}
      <Paper>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Table View" />
          <Tab label="Screenshots" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : results.length > 0 ? (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Test ID</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Error Message</TableCell>
                      <TableCell>Screenshots</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results.map((result: TestResult) => (
                      <TableRow key={result.id}>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {result.test_id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(result.status)}
                            label={result.status}
                            color={getStatusColor(result.status)}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {result.duration ? `${result.duration}ms` : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              maxWidth: 200,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {result.error_message || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Badge badgeContent={result.screenshots?.length || 0} color="primary">
                            <Image />
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(result.created_at).toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetail(result)}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download JSON">
                            <IconButton
                              size="small"
                              onClick={() => handleDownloadResult(result)}
                            >
                              <Download />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, newPage) => setPage(newPage)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No Results Found
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {searchQuery || filterStatus !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Run some tests to see results here'}
              </Typography>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* Screenshots Gallery */}
          <Box sx={{ p: 2 }}>
            {results.filter((r: TestResult) => r.screenshots && r.screenshots.length > 0).length > 0 ? (
              <ImageList variant="masonry" cols={3} gap={8}>
                {results
                  .filter((result: TestResult) => result.screenshots && result.screenshots.length > 0)
                  .flatMap((result: TestResult) =>
                    result.screenshots!.map((screenshot, index: number) => (
                      <ImageListItem
                        key={`${result.id}-${index}`}
                        onClick={() => handleViewScreenshot(screenshot.url || screenshot.file_path)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <img
                          src={screenshot.url || screenshot.file_path}
                          alt={screenshot.step || 'Screenshot'}
                          loading="lazy"
                          style={{ borderRadius: 4 }}
                        />
                        <ImageListItemBar
                          title={screenshot.step || 'Screenshot'}
                          subtitle={`Test: ${result.test_id || result.id}`}
                          actionIcon={
                            <IconButton sx={{ color: 'rgba(255, 255, 255, 0.54)' }}>
                              <Visibility />
                            </IconButton>
                          }
                        />
                      </ImageListItem>
                    ))
                  )}
              </ImageList>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Image sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  No Screenshots Available
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Screenshots will appear here when tests are run with screenshot capture enabled
                </Typography>
              </Box>
            )}
          </Box>
        </TabPanel>
      </Paper>

      {/* Result Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Test Result Details
        </DialogTitle>
        <DialogContent>
          {selectedResult && (
            <Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="body2" color="textSecondary">
                    Test ID
                  </Typography>
                  <Typography variant="body1" fontFamily="monospace">
                    {selectedResult.test_id}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="body2" color="textSecondary">
                    Status
                  </Typography>
                  <Chip
                    icon={getStatusIcon(selectedResult.status)}
                    label={selectedResult.status}
                    color={getStatusColor(selectedResult.status)}
                    variant="outlined"
                  />
                </Box>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="body2" color="textSecondary">
                    Duration
                  </Typography>
                  <Typography variant="body1">
                    {selectedResult.duration ? `${selectedResult.duration}ms` : `${selectedResult.execution_time}ms`}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="body2" color="textSecondary">
                    Created
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedResult.created_at).toLocaleString()}
                  </Typography>
                </Box>
              </Box>

              {selectedResult.error_message && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    {selectedResult.error_message}
                  </Typography>
                </Alert>
              )}

              {resultDetail && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6">Detailed Log</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                      <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                        {resultDetail.logs || 'No detailed logs available'}
                      </Typography>
                    </Paper>
                  </AccordionDetails>
                </Accordion>
              )}

              {selectedResult.screenshots && selectedResult.screenshots.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Screenshots ({selectedResult.screenshots.length})
                  </Typography>
                  <ImageList variant="masonry" cols={2} gap={8}>
                    {selectedResult.screenshots.map((screenshot, index) => (
                      <ImageListItem
                        key={index}
                        onClick={() => handleViewScreenshot(screenshot.url || screenshot.file_path || '')}
                        sx={{ cursor: 'pointer' }}
                      >
                        <img
                          src={screenshot.url}
                          alt={screenshot.step}
                          loading="lazy"
                          style={{ borderRadius: 4 }}
                        />
                        <ImageListItemBar
                          title={screenshot.step}
                          actionIcon={
                            <IconButton sx={{ color: 'rgba(255, 255, 255, 0.54)' }}>
                              <Visibility />
                            </IconButton>
                          }
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
          {selectedResult && (
            <Button
              onClick={() => handleDownloadResult(selectedResult)}
              startIcon={<Download />}
            >
              Download
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Screenshot Viewer Dialog */}
      <Dialog
        open={screenshotDialogOpen}
        onClose={() => setScreenshotDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Screenshot Viewer</DialogTitle>
        <DialogContent>
          {selectedScreenshot && (
            <Box sx={{ textAlign: 'center' }}>
              <img
                src={selectedScreenshot}
                alt="Screenshot"
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  borderRadius: 4,
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScreenshotDialogOpen(false)}>Close</Button>
          <Button
            onClick={() => {
              if (selectedScreenshot) {
                window.open(selectedScreenshot, '_blank');
              }
            }}
            startIcon={<Download />}
          >
            Open in New Tab
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Results;
