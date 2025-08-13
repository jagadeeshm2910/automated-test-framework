import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  IconButton,
  Fab,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Tooltip,
  Badge,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Stepper,
  Step,
  StepLabel,
  Autocomplete,
  FormGroup,
  Checkbox
} from '@mui/material';
import {
  Schedule,
  Add,
  Edit,
  Delete,
  PlayArrow,
  Stop,
  Pause,
  Refresh,
  Settings,
  Visibility,
  VisibilityOff,
  AccessTime,
  Event,
  RepeatOn,
  Notifications,
  CheckCircle,
  Error,
  Warning,
  Info,
  CalendarToday,
  Today,
  DateRange,
  TimerOff,
  Timer,
  ExpandMore,
  NotificationImportant,
  Email,
  Sms,
  Webhook,
  Chat, // Replace Slack with Chat
  CloudUpload,
  History,
  TrendingUp,
  Assessment,
  Speed,
  BugReport,
  Group,
  Person,
  Public,
  Lock,
  Api,
  Storage,
  Computer,
  DeviceHub
} from '@mui/icons-material';
import { format, addDays, addWeeks, addMonths, parseISO } from 'date-fns';

interface ScheduledJob {
  id: string;
  name: string;
  description: string;
  test_suite_id: string;
  test_suite_name: string;
  schedule_type: 'once' | 'recurring' | 'cron';
  schedule_config: ScheduleConfig;
  status: 'active' | 'paused' | 'completed' | 'failed';
  created_by: string;
  created_at: Date;
  last_run: Date | null;
  next_run: Date | null;
  run_count: number;
  success_rate: number;
  notifications: NotificationConfig[];
  conditions: ExecutionCondition[];
  environments: string[];
  tags: string[];
}

interface ScheduleConfig {
  start_date: Date;
  end_date?: Date;
  time: string; // HH:mm format
  timezone: string;
  frequency?: 'daily' | 'weekly' | 'monthly';
  interval?: number; // every N days/weeks/months
  days_of_week?: number[]; // 0-6, Sunday-Saturday
  days_of_month?: number[]; // 1-31
  cron_expression?: string;
}

interface NotificationConfig {
  id: string;
  type: 'email' | 'slack' | 'webhook' | 'sms';
  recipients: string[];
  trigger: 'on_start' | 'on_success' | 'on_failure' | 'on_completion';
  enabled: boolean;
  config: any; // Type-specific configuration
}

interface ExecutionCondition {
  id: string;
  type: 'environment_health' | 'previous_success' | 'time_window' | 'resource_usage';
  config: any;
  enabled: boolean;
}

interface JobExecution {
  id: string;
  job_id: string;
  start_time: Date;
  end_time?: Date;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  duration?: number;
  tests_run: number;
  tests_passed: number;
  tests_failed: number;
  error_message?: string;
  logs: string[];
}

const TestScheduler: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [jobs, setJobs] = useState<ScheduledJob[]>([]);
  const [executions, setExecutions] = useState<JobExecution[]>([]);
  const [loading, setLoading] = useState(false);
  const [openJobDialog, setOpenJobDialog] = useState(false);
  const [openExecutionDialog, setOpenExecutionDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState<ScheduledJob | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<JobExecution | null>(null);
  const [stepperActiveStep, setStepperActiveStep] = useState(0);

  // Mock data
  useEffect(() => {
    const now = new Date();
    
    const mockJobs: ScheduledJob[] = [
      {
        id: 'job1',
        name: 'Daily User Flow Tests',
        description: 'Complete user registration and login flow testing',
        test_suite_id: 'suite1',
        test_suite_name: 'User Authentication Suite',
        schedule_type: 'recurring',
        schedule_config: {
          start_date: new Date('2024-01-01'),
          time: '02:00',
          timezone: 'UTC',
          frequency: 'daily',
          interval: 1
        },
        status: 'active',
        created_by: 'admin@example.com',
        created_at: new Date('2024-01-01'),
        last_run: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        next_run: new Date(now.getTime() + 2 * 60 * 60 * 1000),
        run_count: 23,
        success_rate: 95.7,
        notifications: [
          {
            id: 'notif1',
            type: 'email',
            recipients: ['admin@example.com'],
            trigger: 'on_failure',
            enabled: true,
            config: {}
          }
        ],
        conditions: [
          {
            id: 'cond1',
            type: 'environment_health',
            config: { min_health_score: 90 },
            enabled: true
          }
        ],
        environments: ['production'],
        tags: ['critical', 'daily']
      },
      {
        id: 'job2',
        name: 'Weekly Regression Tests',
        description: 'Comprehensive regression testing across all features',
        test_suite_id: 'suite2',
        test_suite_name: 'Full Regression Suite',
        schedule_type: 'recurring',
        schedule_config: {
          start_date: new Date('2024-01-01'),
          time: '20:00',
          timezone: 'UTC',
          frequency: 'weekly',
          interval: 1,
          days_of_week: [0] // Sunday
        },
        status: 'active',
        created_by: 'qa@example.com',
        created_at: new Date('2024-01-01'),
        last_run: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        next_run: addWeeks(now, 1),
        run_count: 4,
        success_rate: 87.5,
        notifications: [
          {
            id: 'notif2',
            type: 'slack',
            recipients: ['#qa-team'],
            trigger: 'on_completion',
            enabled: true,
            config: { webhook_url: 'https://hooks.slack.com/...' }
          }
        ],
        conditions: [],
        environments: ['staging', 'production'],
        tags: ['regression', 'weekly']
      },
      {
        id: 'job3',
        name: 'Monthly Performance Audit',
        description: 'Performance and accessibility testing',
        test_suite_id: 'suite3',
        test_suite_name: 'Performance & Accessibility Suite',
        schedule_type: 'recurring',
        schedule_config: {
          start_date: new Date('2024-01-01'),
          time: '01:00',
          timezone: 'UTC',
          frequency: 'monthly',
          interval: 1,
          days_of_month: [1]
        },
        status: 'paused',
        created_by: 'admin@example.com',
        created_at: new Date('2024-01-01'),
        last_run: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        next_run: addMonths(now, 1),
        run_count: 1,
        success_rate: 100,
        notifications: [],
        conditions: [
          {
            id: 'cond2',
            type: 'time_window',
            config: { start_hour: 0, end_hour: 6 },
            enabled: true
          }
        ],
        environments: ['production'],
        tags: ['performance', 'monthly']
      }
    ];

    const mockExecutions: JobExecution[] = [
      {
        id: 'exec1',
        job_id: 'job1',
        start_time: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        end_time: new Date(now.getTime() - 1.5 * 60 * 60 * 1000),
        status: 'completed',
        duration: 1800, // 30 minutes
        tests_run: 25,
        tests_passed: 24,
        tests_failed: 1,
        logs: ['Started test execution', 'Environment health check passed', 'Test execution completed']
      },
      {
        id: 'exec2',
        job_id: 'job2',
        start_time: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        end_time: new Date(now.getTime() - 22 * 60 * 60 * 1000),
        status: 'completed',
        duration: 7200, // 2 hours
        tests_run: 150,
        tests_passed: 147,
        tests_failed: 3,
        logs: ['Started weekly regression tests', 'Multiple environments tested', 'Tests completed successfully']
      },
      {
        id: 'exec3',
        job_id: 'job1',
        start_time: new Date(now.getTime() - 10 * 60 * 1000),
        status: 'running',
        tests_run: 15,
        tests_passed: 14,
        tests_failed: 1,
        logs: ['Started test execution', 'Running user authentication tests', 'Currently processing payment flow']
      }
    ];

    setJobs(mockJobs);
    setExecutions(mockExecutions);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateJob = () => {
    setSelectedJob(null);
    setStepperActiveStep(0);
    setOpenJobDialog(true);
  };

  const handleEditJob = (job: ScheduledJob) => {
    setSelectedJob(job);
    setStepperActiveStep(0);
    setOpenJobDialog(true);
  };

  const handleDeleteJob = (id: string) => {
    setJobs(prev => prev.filter(job => job.id !== id));
  };

  const handleToggleJob = (id: string) => {
    setJobs(prev => 
      prev.map(job => 
        job.id === id 
          ? { ...job, status: job.status === 'active' ? 'paused' : 'active' }
          : job
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'paused': return 'warning';
      case 'completed': return 'info';
      case 'failed': return 'error';
      case 'running': return 'primary';
      default: return 'default';
    }
  };

  const getFrequencyDisplay = (config: ScheduleConfig) => {
    if (config.frequency === 'daily') {
      return `Every ${config.interval === 1 ? 'day' : `${config.interval} days`} at ${config.time}`;
    } else if (config.frequency === 'weekly') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayNames = config.days_of_week?.map(d => days[d]).join(', ') || 'Sunday';
      return `Weekly on ${dayNames} at ${config.time}`;
    } else if (config.frequency === 'monthly') {
      const dayStr = config.days_of_month?.join(', ') || '1st';
      return `Monthly on day ${dayStr} at ${config.time}`;
    }
    return 'Custom schedule';
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Jobs Tab
  const JobsTab = () => (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateJob}
        >
          Create Scheduled Job
        </Button>
        <Button
          startIcon={<Refresh />}
          onClick={() => setLoading(true)}
          disabled={loading}
        >
          Refresh
        </Button>
        <Button
          startIcon={<PlayArrow />}
          variant="outlined"
        >
          Run All Active
        </Button>
        <Button
          startIcon={<Pause />}
          variant="outlined"
        >
          Pause All
        </Button>
      </Box>

      <Grid container spacing={3}>
        {jobs.map((job) => (
          <Grid item xs={12} lg={6} key={job.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" component="div">
                      {job.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {job.description}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                    <Chip
                      label={job.status.toUpperCase()}
                      color={getStatusColor(job.status)}
                      size="small"
                    />
                    <Switch
                      checked={job.status === 'active'}
                      onChange={() => handleToggleJob(job.id)}
                      size="small"
                    />
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Test Suite:</strong> {job.test_suite_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Schedule:</strong> {getFrequencyDisplay(job.schedule_config)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Next Run:</strong> {job.next_run ? format(job.next_run, 'MMM dd, yyyy HH:mm') : 'N/A'}
                  </Typography>
                </Box>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="primary">
                        {job.run_count}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Executions
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="success.main">
                        {job.success_rate.toFixed(1)}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Success Rate
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6">
                        {job.environments.length}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Environments
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap' }}>
                  {job.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  {job.notifications.length > 0 && (
                    <Chip
                      icon={<Notifications />}
                      label={`${job.notifications.length} notifications`}
                      size="small"
                      color="info"
                      variant="outlined"
                    />
                  )}
                  {job.conditions.length > 0 && (
                    <Chip
                      icon={<CheckCircle />}
                      label={`${job.conditions.length} conditions`}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  )}
                </Box>
              </CardContent>

              <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                <Box>
                  <Tooltip title="Run Now">
                    <IconButton size="small" color="primary">
                      <PlayArrow />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="View History">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedJob(job);
                        setTabValue(1);
                      }}
                    >
                      <History />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => handleEditJob(job)}
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Button
                  size="small"
                  startIcon={<Delete />}
                  onClick={() => handleDeleteJob(job.id)}
                  color="error"
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  // Executions Tab
  const ExecutionsTab = () => {
    const filteredExecutions = selectedJob 
      ? executions.filter(exec => exec.job_id === selectedJob.id)
      : executions;

    return (
      <Box>
        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          {selectedJob && (
            <Alert severity="info" sx={{ flexGrow: 1 }}>
              Showing executions for: <strong>{selectedJob.name}</strong>
              <Button 
                size="small" 
                onClick={() => setSelectedJob(null)}
                sx={{ ml: 1 }}
              >
                Show All
              </Button>
            </Alert>
          )}
          <Button
            startIcon={<Refresh />}
            onClick={() => setLoading(true)}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Job</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Tests</TableCell>
                <TableCell>Success Rate</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredExecutions.map((execution) => {
                const job = jobs.find(j => j.id === execution.job_id);
                const successRate = execution.tests_run > 0 
                  ? (execution.tests_passed / execution.tests_run * 100).toFixed(1)
                  : '0';

                return (
                  <TableRow key={execution.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {job?.name || 'Unknown Job'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {execution.id}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={execution.status.toUpperCase()}
                        color={getStatusColor(execution.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(execution.start_time, 'MMM dd, HH:mm')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {execution.duration ? (
                        <Typography variant="body2">
                          {formatDuration(execution.duration)}
                        </Typography>
                      ) : (
                        <Chip label="Running" color="primary" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {execution.tests_run} total
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {execution.tests_passed} passed, {execution.tests_failed} failed
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color={parseFloat(successRate) >= 90 ? 'success.main' : 'warning.main'}
                      >
                        {successRate}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedExecution(execution);
                            setOpenExecutionDialog(true);
                          }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      {execution.status === 'running' && (
                        <Tooltip title="Stop">
                          <IconButton size="small" color="error">
                            <Stop />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const jobCreationSteps = [
    'Basic Information',
    'Test Suite Selection',
    'Schedule Configuration',
    'Notifications',
    'Execution Conditions',
    'Review & Create'
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Test Scheduler
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Automate test execution with flexible scheduling and advanced conditions
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<CalendarToday />}
          >
            Calendar View
          </Button>
          <Button
            variant="outlined"
            startIcon={<Settings />}
          >
            Scheduler Settings
          </Button>
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Scheduled Jobs" icon={<Schedule />} />
          <Tab label="Execution History" icon={<History />} />
          <Tab label="Calendar" icon={<CalendarToday />} />
          <Tab label="Templates" icon={<CloudUpload />} />
        </Tabs>
      </Paper>

      <Box sx={{ mt: 3 }}>
        {tabValue === 0 && <JobsTab />}
        {tabValue === 1 && <ExecutionsTab />}
        {tabValue === 2 && (
          <Alert severity="info">
            Calendar View - Coming soon! Visual calendar interface for managing scheduled tests.
          </Alert>
        )}
        {tabValue === 3 && (
          <Alert severity="info">
            Job Templates - Coming soon! Pre-configured job templates for common testing scenarios.
          </Alert>
        )}
      </Box>

      {/* Job Creation/Edit Dialog */}
      <Dialog
        open={openJobDialog}
        onClose={() => setOpenJobDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedJob ? 'Edit Scheduled Job' : 'Create New Scheduled Job'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Stepper activeStep={stepperActiveStep} orientation="vertical">
              {jobCreationSteps.map((label, index) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                  {index === 0 && (
                    <Box sx={{ mb: 2 }}>
                      <TextField
                        label="Job Name"
                        fullWidth
                        sx={{ mb: 2 }}
                        defaultValue={selectedJob?.name}
                      />
                      <TextField
                        label="Description"
                        fullWidth
                        multiline
                        rows={3}
                        defaultValue={selectedJob?.description}
                      />
                    </Box>
                  )}
                </Step>
              ))}
            </Stepper>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenJobDialog(false)}>Cancel</Button>
          <Button variant="contained">
            {selectedJob ? 'Update Job' : 'Create Job'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Execution Details Dialog */}
      <Dialog
        open={openExecutionDialog}
        onClose={() => setOpenExecutionDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Execution Details</DialogTitle>
        <DialogContent>
          {selectedExecution && (
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Execution Info
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>ID:</strong> {selectedExecution.id}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Status:</strong> {selectedExecution.status}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Started:</strong> {format(selectedExecution.start_time, 'MMM dd, yyyy HH:mm:ss')}
                  </Typography>
                  {selectedExecution.end_time && (
                    <Typography variant="body2" gutterBottom>
                      <strong>Completed:</strong> {format(selectedExecution.end_time, 'MMM dd, yyyy HH:mm:ss')}
                    </Typography>
                  )}
                  {selectedExecution.duration && (
                    <Typography variant="body2" gutterBottom>
                      <strong>Duration:</strong> {formatDuration(selectedExecution.duration)}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Test Results
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Total Tests:</strong> {selectedExecution.tests_run}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Passed:</strong> {selectedExecution.tests_passed}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Failed:</strong> {selectedExecution.tests_failed}
                  </Typography>
                  {selectedExecution.error_message && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {selectedExecution.error_message}
                    </Alert>
                  )}
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Execution Logs
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.100', maxHeight: 200, overflow: 'auto' }}>
                  {selectedExecution.logs.map((log, index) => (
                    <Typography
                      key={index}
                      variant="body2"
                      fontFamily="monospace"
                      sx={{ mb: 0.5 }}
                    >
                      {log}
                    </Typography>
                  ))}
                </Paper>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenExecutionDialog(false)}>Close</Button>
          <Button variant="outlined" startIcon={<CloudUpload />}>
            Export Logs
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TestScheduler;
