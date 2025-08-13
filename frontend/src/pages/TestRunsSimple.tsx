import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  Psychology,
  Visibility,
  CheckCircle,
  Error,
  Warning,
  Schedule,
  Refresh,
} from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { useAppContext } from '../contexts/AppContext';
import { createNotification } from '../utils/notifications';

const TestRuns: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { dispatch } = useAppContext();
  
  const metadataId = searchParams.get('metadata_id');
  const dataGenerated = searchParams.get('data_generated') === 'true';
  
  const [activeStep, setActiveStep] = useState(0);
  const [selectedMetadataId, setSelectedMetadataId] = useState(metadataId || '');
  const [testScenario, setTestScenario] = useState<'standard_test' | 'comprehensive_test' | 'performance_test'>('standard_test');
  const [takeScreenshots, setTakeScreenshots] = useState(true);
  const [testTimeout, setTestTimeout] = useState(30000);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);

  // Fetch metadata list for selection
  const { data: metadataList, isLoading: metadataLoading } = useQuery({
    queryKey: ['metadata-list'],
    queryFn: () => apiService.getAllMetadata(),
  });

  // Fetch test runs for monitoring
  const { data: testRuns } = useQuery({
    queryKey: ['test-runs'],
    queryFn: () => apiService.getTestRuns(),
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Start test mutation
  const startTestMutation = useMutation({
    mutationFn: () => {
      if (!selectedMetadataId) throw new Error('No metadata selected');
      return apiService.startTest(parseInt(selectedMetadataId), {
        scenario: testScenario,
        take_screenshots: takeScreenshots,
        timeout: testTimeout,
      });
    },
    onSuccess: (testRun) => {
      queryClient.invalidateQueries({ queryKey: ['test-runs'] });
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: createNotification(`Test started successfully! Test ID: ${testRun.id}`, 'success'),
      });
      setActiveStep(2); // Move to monitoring step
    },
    onError: (error) => {
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: createNotification(
          `Failed to start test: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'error'
        ),
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
        payload: createNotification('Test stopped successfully!', 'success'),
      });
    },
  });

  useEffect(() => {
    if (dataGenerated) {
      setActiveStep(1); // Skip to test execution step if data is already generated
    }
  }, [dataGenerated]);

  const steps = [
    {
      label: 'Select Metadata',
      description: 'Choose extracted form metadata to test',
    },
    {
      label: 'Generate Test Data',
      description: 'Create realistic test data using AI',
    },
    {
      label: 'Execute Tests',
      description: 'Run automated UI tests with Playwright',
    },
    {
      label: 'View Results',
      description: 'Analyze test results and screenshots',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Schedule />;
      case 'completed':
        return <CheckCircle />;
      case 'failed':
        return <Error />;
      default:
        return <Warning />;
    }
  };

  const getStatusColor = (status: string): "primary" | "success" | "error" | "warning" | "default" => {
    switch (status) {
      case 'running':
        return 'warning';
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && !selectedMetadataId) {
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: createNotification('Please select metadata first', 'warning'),
      });
      return;
    }
    
    if (activeStep === 1) {
      // Navigate to data generation page
      navigate(`/data-generation?metadata_id=${selectedMetadataId}`);
      return;
    }
    
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStartTest = () => {
    setConfigDialogOpen(true);
  };

  const handleConfirmStartTest = () => {
    startTestMutation.mutate();
    setConfigDialogOpen(false);
  };

  const activeTests = testRuns?.items?.filter((test: any) => test.status === 'running') || [];
  const completedTests = testRuns?.items?.filter((test: any) => ['completed', 'failed', 'stopped'].includes(test.status)) || [];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        UI Test Management
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Complete testing workflow: Extract → Generate Data → Execute Tests → Analyze Results
      </Typography>

      {/* Test Workflow Stepper */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>{step.label}</StepLabel>
                <StepContent>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {step.description}
                  </Typography>

                  {/* Step 0: Metadata Selection */}
                  {index === 0 && (
                    <Box>
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Select Extracted Metadata</InputLabel>
                        <Select
                          value={selectedMetadataId}
                          onChange={(e) => setSelectedMetadataId(e.target.value)}
                          disabled={metadataLoading}
                        >
                          {metadataList?.items?.map((metadata: any) => (
                            <MenuItem key={metadata.id} value={metadata.id.toString()}>
                              <Box>
                                <Typography variant="body2">{metadata.url}</Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {metadata.field_count || 0} fields • {new Date(metadata.created_at).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {metadataList?.items?.length === 0 && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                          No metadata found. Please extract some form metadata first.
                          <Button sx={{ ml: 2 }} onClick={() => navigate('/extract')}>
                            Extract Metadata
                          </Button>
                        </Alert>
                      )}
                    </Box>
                  )}

                  {/* Step 1: Data Generation */}
                  {index === 1 && (
                    <Box>
                      <Alert severity="info" icon={<Psychology />} sx={{ mb: 2 }}>
                        Generate realistic test data using AI (Llama model) for comprehensive testing scenarios.
                      </Alert>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        Click "Next" to go to the data generation page where you can:
                        • Configure AI-powered data generation
                        • Select test scenarios (valid, invalid, edge cases)
                        • Set custom constraints and field rules
                      </Typography>
                    </Box>
                  )}

                  {/* Step 2: Test Execution */}
                  {index === 2 && (
                    <Box>
                      <Alert severity="success" icon={<PlayArrow />} sx={{ mb: 2 }}>
                        Ready to execute automated UI tests with Playwright
                      </Alert>
                      <Button
                        variant="contained"
                        startIcon={<PlayArrow />}
                        onClick={handleStartTest}
                        disabled={!selectedMetadataId || startTestMutation.isPending}
                        sx={{ mr: 1 }}
                      >
                        {startTestMutation.isPending ? 'Starting...' : 'Start Test Execution'}
                      </Button>
                    </Box>
                  )}

                  {/* Step 3: Results */}
                  {index === 3 && (
                    <Box>
                      <Button
                        variant="contained"
                        startIcon={<Visibility />}
                        onClick={() => navigate('/results')}
                      >
                        View Test Results & Screenshots
                      </Button>
                    </Box>
                  )}

                  <Box sx={{ mb: 1, mt: 2 }}>
                    <Button
                      disabled={index === 0}
                      onClick={handleBack}
                      sx={{ mr: 1 }}
                    >
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={
                        (index === 0 && !selectedMetadataId) ||
                        (index === steps.length - 1)
                      }
                    >
                      {index === steps.length - 1 ? 'Finish' : 'Next'}
                    </Button>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Active Tests Monitoring */}
      {activeTests.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Active Tests ({activeTests.length})
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Test ID</TableCell>
                    <TableCell>Metadata Source</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Started</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activeTests.map((test: any) => (
                    <TableRow key={test.id}>
                      <TableCell>{test.id}</TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          Metadata #{test.metadata_id}
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
                          {new Date(test.started_at).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Stop Test">
                          <IconButton
                            size="small"
                            onClick={() => stopTestMutation.mutate(test.id.toString())}
                            disabled={stopTestMutation.isPending}
                          >
                            <Stop />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Results">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/results?test_id=${test.id}`)}
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
          </CardContent>
        </Card>
      )}

      {/* Recent Test History */}
      {completedTests.length > 0 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Recent Test History ({completedTests.length})
              </Typography>
              <Button
                startIcon={<Refresh />}
                onClick={() => queryClient.invalidateQueries({ queryKey: ['test-runs'] })}
              >
                Refresh
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Test ID</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Completed</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {completedTests.slice(0, 10).map((test: any) => (
                    <TableRow key={test.id}>
                      <TableCell>{test.id}</TableCell>
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
                            : '-'}
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
                            onClick={() => navigate(`/results?test_id=${test.id}`)}
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
          </CardContent>
        </Card>
      )}

      {/* Test Configuration Dialog */}
      <Dialog open={configDialogOpen} onClose={() => setConfigDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Test Execution Configuration</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Test Scenario</InputLabel>
              <Select
                value={testScenario}
                onChange={(e) => setTestScenario(e.target.value as any)}
              >
                <MenuItem value="standard_test">Standard Test (Basic functionality)</MenuItem>
                <MenuItem value="comprehensive_test">Comprehensive Test (All scenarios)</MenuItem>
                <MenuItem value="performance_test">Performance Test (Load testing)</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={takeScreenshots}
                  onChange={(e) => setTakeScreenshots(e.target.checked)}
                />
              }
              label="Take Screenshots"
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Timeout (ms)"
              type="number"
              value={testTimeout}
              onChange={(e) => setTestTimeout(Number(e.target.value))}
              inputProps={{ min: 5000, max: 300000 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmStartTest}
            variant="contained"
            disabled={startTestMutation.isPending}
          >
            {startTestMutation.isPending ? 'Starting...' : 'Start Test'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TestRuns;
