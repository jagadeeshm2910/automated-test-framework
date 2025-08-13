import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  LinearProgress,
  Grid,
  Tabs,
  Tab,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  Refresh,
  Visibility,
  Delete,
  Schedule,
  CheckCircle,
  Error,
  Warning,
  Settings,
  FilterList,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { useAppContext } from '../contexts/AppContext';
import type { TestRun, TestConfiguration } from '../types/api';

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

const TestRuns: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { dispatch } = useAppContext();
  
  const [tabValue, setTabValue] = useState(0);
  const [selectedTest, setSelectedTest] = useState<TestRun | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testConfig, setTestConfig] = useState<TestConfiguration>({
    headless: true,
    timeout: 30000,
    retries: 1,
    screenshot: true,
    viewport: { width: 1920, height: 1080 },
  });

  const metadataId = searchParams.get('metadata_id');

  // Fetch test runs
  const { data: testRuns, isLoading } = useQuery({
    queryKey: ['test-runs'],
    queryFn: () => apiService.getTestRuns(),
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Fetch metadata list
  const { data: metadataList } = useQuery({
    queryKey: ['metadata-list'],
    queryFn: () => apiService.getMetadata({ limit: 100 }),
  });

  // Start test mutation
  const startTestMutation = useMutation({
    mutationFn: ({ metadataId, config }: { metadataId: string; config: TestConfiguration }) =>
      apiService.startTest(metadataId, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-runs'] });
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: { message: 'Test started successfully!', type: 'success' },
      });
      setConfigDialogOpen(false);
    },
    onError: (error) => {
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          message: `Failed to start test: ${error instanceof Error ? error.message : 'Unknown error'}`,
          type: 'error',
        },
      });
    },
  });

  // Stop test mutation
  const stopTestMutation = useMutation({
    mutationFn: (testId: string) => apiService.stopTest(testId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-runs'] });
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: { message: 'Test stopped successfully!', type: 'success' },
      });
    },
  });

  // Delete test mutation
  const deleteTestMutation = useMutation({
    mutationFn: (testId: string) => apiService.deleteTest(testId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-runs'] });
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: { message: 'Test deleted successfully!', type: 'success' },
      });
      setDeleteDialogOpen(false);
      setSelectedTest(null);
    },
  });

  const handleStartTest = (metadataId: string) => {
    setConfigDialogOpen(true);
  };

  const handleConfirmStartTest = () => {
    if (metadataId) {
      startTestMutation.mutate({ metadataId, config: testConfig });
    }
  };

  const handleViewResults = (testId: string) => {
    navigate(`/results?test_id=${testId}`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Schedule color="warning" />;
      case 'completed':
        return <CheckCircle color="success" />;
      case 'failed':
        return <Error color="error" />;
      case 'stopped':
        return <Warning color="action" />;
      default:
        return <Schedule />;
    }
  };

  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'running':
        return 'warning';
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'stopped':
        return 'default';
      default:
        return 'default';
    }
  };

  const activeTests = testRuns?.filter(test => test.status === 'running') || [];
  const completedTests = testRuns?.filter(test => ['completed', 'failed', 'stopped'].includes(test.status)) || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Test Management
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Execute and monitor UI tests for extracted form metadata
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PlayArrow />}
          onClick={() => setConfigDialogOpen(true)}
          disabled={!metadataList?.metadata?.length}
        >
          Start New Test
        </Button>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {activeTests.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Active Tests
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {completedTests.filter(t => t.status === 'completed').length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {completedTests.filter(t => t.status === 'failed').length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Failed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4">
                {testRuns?.length || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Tests
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab
            label={
              <Badge badgeContent={activeTests.length} color="warning">
                Active Tests
              </Badge>
            }
          />
          <Tab label="Test History" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {/* Active Tests */}
          {activeTests.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Test ID</TableCell>
                    <TableCell>Metadata Source</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Progress</TableCell>
                    <TableCell>Started</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activeTests.map((test) => (
                    <TableRow key={test.id}>
                      <TableCell>{test.id}</TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {test.metadata_id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(test.status)}
                          label={test.status}
                          color={getStatusColor(test.status)}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ width: 100 }}>
                          <LinearProgress
                            variant="determinate"
                            value={test.progress || 0}
                          />
                          <Typography variant="caption">
                            {test.progress || 0}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(test.started_at).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Stop Test">
                          <IconButton
                            size="small"
                            onClick={() => stopTestMutation.mutate(test.id)}
                            disabled={stopTestMutation.isPending}
                          >
                            <Stop />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Results">
                          <IconButton
                            size="small"
                            onClick={() => handleViewResults(test.id)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No Active Tests
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Start a new test to see it appear here
              </Typography>
              <Button
                variant="outlined"
                startIcon={<PlayArrow />}
                onClick={() => setConfigDialogOpen(true)}
              >
                Start Test
              </Button>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* Test History */}
          {isLoading ? (
            <Box sx={{ p: 2 }}>
              <LinearProgress />
            </Box>
          ) : testRuns && testRuns.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Test ID</TableCell>
                    <TableCell>Metadata Source</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Completed</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {testRuns.map((test) => (
                    <TableRow key={test.id}>
                      <TableCell>{test.id}</TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {test.metadata_id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(test.status)}
                          label={test.status}
                          color={getStatusColor(test.status)}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {test.completed_at
                            ? `${Math.round(
                                (new Date(test.completed_at).getTime() -
                                  new Date(test.started_at).getTime()) /
                                  1000
                              )}s`
                            : 'Running...'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {test.completed_at
                            ? new Date(test.completed_at).toLocaleString()
                            : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Results">
                          <IconButton
                            size="small"
                            onClick={() => handleViewResults(test.id)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Test">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedTest(test);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No Test History
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Start your first test to build up a history
              </Typography>
            </Box>
          )}
        </TabPanel>
      </Paper>

      {/* Start Test Configuration Dialog */}
      <Dialog open={configDialogOpen} onClose={() => setConfigDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Start New Test</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Select Metadata</InputLabel>
              <Select
                value={metadataId || ''}
                onChange={(e) => {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set('metadata_id', e.target.value);
                  navigate({ search: newParams.toString() });
                }}
              >
                {metadataList?.metadata?.map((metadata) => (
                  <MenuItem key={metadata.id} value={metadata.id}>
                    <Box>
                      <Typography variant="body2">{metadata.source_url}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {metadata.forms?.length || 0} forms • {new Date(metadata.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="h6" gutterBottom>
              Test Configuration
            </Typography>

            <TextField
              fullWidth
              label="Timeout (ms)"
              type="number"
              value={testConfig.timeout}
              onChange={(e) => setTestConfig({ ...testConfig, timeout: Number(e.target.value) })}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Retries"
              type="number"
              value={testConfig.retries}
              onChange={(e) => setTestConfig({ ...testConfig, retries: Number(e.target.value) })}
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="Viewport Width"
                type="number"
                value={testConfig.viewport?.width || 1920}
                onChange={(e) => setTestConfig({
                  ...testConfig,
                  viewport: { ...testConfig.viewport, width: Number(e.target.value) }
                })}
              />
              <TextField
                label="Viewport Height"
                type="number"
                value={testConfig.viewport?.height || 1080}
                onChange={(e) => setTestConfig({
                  ...testConfig,
                  viewport: { ...testConfig.viewport, height: Number(e.target.value) }
                })}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmStartTest}
            variant="contained"
            disabled={!metadataId || startTestMutation.isPending}
          >
            {startTestMutation.isPending ? 'Starting...' : 'Start Test'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Test</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete test "{selectedTest?.id}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => selectedTest && deleteTestMutation.mutate(selectedTest.id)}
            color="error"
            disabled={deleteTestMutation.isPending}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TestRuns;
