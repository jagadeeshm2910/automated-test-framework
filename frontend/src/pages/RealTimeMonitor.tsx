import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Badge,
  Avatar,
  Switch,
  FormControlLabel,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  CheckCircle as SuccessIcon,
  BugReport as ErrorIcon,
  Info as InfoIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
  LiveTv as LiveIcon,
} from '@mui/icons-material';
import { Area } from 'recharts';
import {
  ResponsiveContainer,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts';
import { format } from 'date-fns';

interface TestExecution {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed' | 'pending' | 'stopped';
  progress: number;
  startTime: Date;
  endTime?: Date;
  steps: TestStep[];
  metadata: {
    url: string;
    browser: string;
    viewport: string;
  };
  metrics: {
    totalSteps: number;
    completedSteps: number;
    failedSteps: number;
    duration: number;
    screenshots: number;
  };
}

interface TestStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  error?: string;
  screenshot?: string;
}

interface SystemMetrics {
  cpu: number;
  memory: number;
  network: number;
  activeTests: number;
  timestamp: Date;
}

const RealTimeMonitor: React.FC = () => {
  const [executions, setExecutions] = useState<TestExecution[]>([]);
  const [selectedExecution, setSelectedExecution] = useState<TestExecution | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics[]>([]);
  const [liveMode, setLiveMode] = useState(true);

  // Simulated real-time data
  useEffect(() => {
    if (!liveMode) return;

    const interval = setInterval(() => {
      // Update system metrics
      setSystemMetrics(prev => {
        const newMetric: SystemMetrics = {
          cpu: Math.random() * 100,
          memory: Math.random() * 100,
          network: Math.random() * 100,
          activeTests: executions.filter(e => e.status === 'running').length,
          timestamp: new Date(),
        };
        return [...prev.slice(-29), newMetric]; // Keep last 30 entries
      });

      // Update test executions
      setExecutions(prev => prev.map(execution => {
        if (execution.status === 'running') {
          const newProgress = Math.min(execution.progress + Math.random() * 5, 100);
          const isComplete = newProgress >= 100;
          
          return {
            ...execution,
            progress: newProgress,
            status: isComplete ? (Math.random() > 0.2 ? 'completed' : 'failed') : 'running',
            endTime: isComplete ? new Date() : undefined,
            metrics: {
              ...execution.metrics,
              completedSteps: Math.floor((newProgress / 100) * execution.metrics.totalSteps),
              duration: Date.now() - execution.startTime.getTime(),
            },
          };
        }
        return execution;
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [liveMode, executions]);

  // Initialize with sample data
  useEffect(() => {
    const sampleExecutions: TestExecution[] = [
      {
        id: 'test_1',
        name: 'Contact Form Validation',
        status: 'running',
        progress: 45,
        startTime: new Date(Date.now() - 120000),
        steps: generateSampleSteps(),
        metadata: {
          url: 'https://example.com/contact',
          browser: 'Chrome',
          viewport: '1920x1080',
        },
        metrics: {
          totalSteps: 8,
          completedSteps: 3,
          failedSteps: 0,
          duration: 120000,
          screenshots: 3,
        },
      },
      {
        id: 'test_2',
        name: 'User Registration Flow',
        status: 'completed',
        progress: 100,
        startTime: new Date(Date.now() - 300000),
        endTime: new Date(Date.now() - 60000),
        steps: generateSampleSteps(),
        metadata: {
          url: 'https://example.com/register',
          browser: 'Firefox',
          viewport: '1366x768',
        },
        metrics: {
          totalSteps: 12,
          completedSteps: 12,
          failedSteps: 0,
          duration: 240000,
          screenshots: 12,
        },
      },
      {
        id: 'test_3',
        name: 'E-commerce Checkout',
        status: 'failed',
        progress: 67,
        startTime: new Date(Date.now() - 180000),
        endTime: new Date(Date.now() - 30000),
        steps: generateSampleSteps(),
        metadata: {
          url: 'https://shop.example.com/checkout',
          browser: 'Safari',
          viewport: '1440x900',
        },
        metrics: {
          totalSteps: 15,
          completedSteps: 10,
          failedSteps: 1,
          duration: 150000,
          screenshots: 10,
        },
      },
    ];

    setExecutions(sampleExecutions);
  }, []);

  function generateSampleSteps(): TestStep[] {
    const stepNames = [
      'Navigate to page',
      'Fill email field',
      'Fill password field',
      'Click submit button',
      'Wait for redirect',
      'Validate success message',
      'Take screenshot',
      'Check form validation',
    ];

    return stepNames.map((name, index) => ({
      id: `step_${index}`,
      name,
      status: index < 3 ? 'completed' : index === 3 ? 'running' : 'pending',
      startTime: index < 3 ? new Date(Date.now() - (3 - index) * 15000) : undefined,
      endTime: index < 3 ? new Date(Date.now() - (3 - index - 1) * 15000) : undefined,
      duration: index < 3 ? 15000 : undefined,
    }));
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return '#2196F3';
      case 'completed': return '#4CAF50';
      case 'failed': return '#F44336';
      case 'pending': return '#FF9800';
      case 'stopped': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <PlayIcon />;
      case 'completed': return <SuccessIcon />;
      case 'failed': return <ErrorIcon />;
      case 'pending': return <InfoIcon />;
      case 'stopped': return <StopIcon />;
      default: return <InfoIcon />;
    }
  };

  const stopExecution = (id: string) => {
    setExecutions(prev => prev.map(exec => 
      exec.id === id ? { ...exec, status: 'stopped' as const, endTime: new Date() } : exec
    ));
  };

  const restartExecution = (id: string) => {
    setExecutions(prev => prev.map(exec => 
      exec.id === id ? { 
        ...exec, 
        status: 'running' as const, 
        progress: 0, 
        startTime: new Date(),
        endTime: undefined,
        metrics: { ...exec.metrics, completedSteps: 0, failedSteps: 0, duration: 0 }
      } : exec
    ));
  };

  const viewExecutionDetails = (execution: TestExecution) => {
    setSelectedExecution(execution);
    setDetailDialogOpen(true);
  };

  const ExecutionCard: React.FC<{ execution: TestExecution }> = ({ execution }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: getStatusColor(execution.status), mr: 2 }}>
            {getStatusIcon(execution.status)}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6">{execution.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {execution.metadata.url} • {execution.metadata.browser}
            </Typography>
          </Box>
          <Chip 
            label={execution.status.toUpperCase()} 
            color={execution.status === 'completed' ? 'success' : 
                   execution.status === 'failed' ? 'error' : 
                   execution.status === 'running' ? 'primary' : 'default'}
            size="small"
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Progress</Typography>
            <Typography variant="body2">{Math.round(execution.progress)}%</Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={execution.progress}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 22%', minWidth: '200px' }}>
            <Typography variant="caption" color="text.secondary">Steps</Typography>
            <Typography variant="body2">
              {execution.metrics.completedSteps}/{execution.metrics.totalSteps}
            </Typography>
          </Box>
          <Box sx={{ flex: '1 1 22%', minWidth: '200px' }}>
            <Typography variant="caption" color="text.secondary">Duration</Typography>
            <Typography variant="body2">
              {Math.floor(execution.metrics.duration / 1000)}s
            </Typography>
          </Box>
          <Box sx={{ flex: '1 1 22%', minWidth: '200px' }}>
            <Typography variant="caption" color="text.secondary">Screenshots</Typography>
            <Typography variant="body2">{execution.metrics.screenshots}</Typography>
          </Box>
          <Box sx={{ flex: '1 1 22%', minWidth: '200px' }}>
            <Typography variant="caption" color="text.secondary">Errors</Typography>
            <Typography variant="body2" color={execution.metrics.failedSteps > 0 ? 'error' : 'inherit'}>
              {execution.metrics.failedSteps}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            startIcon={<ViewIcon />}
            onClick={() => viewExecutionDetails(execution)}
          >
            Details
          </Button>
          {execution.status === 'running' && (
            <Button
              size="small"
              startIcon={<StopIcon />}
              onClick={() => stopExecution(execution.id)}
              color="error"
            >
              Stop
            </Button>
          )}
          {execution.status !== 'running' && (
            <Button
              size="small"
              startIcon={<RefreshIcon />}
              onClick={() => restartExecution(execution.id)}
            >
              Restart
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  const SystemMetricsChart = () => (
    <Paper sx={{ p: 2, height: 300 }}>
      <Typography variant="h6" gutterBottom>
        System Performance
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={systemMetrics}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={(value) => format(new Date(value), 'HH:mm:ss')}
          />
          <YAxis />
          <RechartsTooltip 
            labelFormatter={(value) => format(new Date(value), 'HH:mm:ss')}
            formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="cpu" 
            stackId="1" 
            stroke="#8884d8" 
            fill="#8884d8" 
            name="CPU"
          />
          <Area 
            type="monotone" 
            dataKey="memory" 
            stackId="1" 
            stroke="#82ca9d" 
            fill="#82ca9d" 
            name="Memory"
          />
          <Area 
            type="monotone" 
            dataKey="network" 
            stackId="1" 
            stroke="#ffc658" 
            fill="#ffc658" 
            name="Network"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Paper>
  );

  const TestExecutionDetails = () => (
    <Dialog 
      open={detailDialogOpen} 
      onClose={() => setDetailDialogOpen(false)}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        {selectedExecution?.name} - Execution Details
      </DialogTitle>
      <DialogContent>
        {selectedExecution && (
          <Box>
            <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 45%', minWidth: '300px' }}>
                <Typography variant="subtitle2" gutterBottom>Test Information</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="URL" secondary={selectedExecution.metadata.url} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Browser" secondary={selectedExecution.metadata.browser} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Viewport" secondary={selectedExecution.metadata.viewport} />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Duration" 
                      secondary={`${Math.floor(selectedExecution.metrics.duration / 1000)}s`} 
                    />
                  </ListItem>
                </List>
              </Box>
              <Box sx={{ flex: '1 1 45%', minWidth: '300px' }}>
                <Typography variant="subtitle2" gutterBottom>Execution Timeline</Typography>
                <List dense>
                  {selectedExecution.steps.map((step, index) => (
                    <ListItem key={step.id}>
                      <ListItemIcon>
                        <Badge
                          badgeContent={index + 1}
                          color="primary"
                          anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                          }}
                        >
                          {getStatusIcon(step.status)}
                        </Badge>
                      </ListItemIcon>
                      <ListItemText 
                        primary={step.name}
                        secondary={
                          step.duration 
                            ? `${step.duration / 1000}s` 
                            : step.status === 'running' ? 'In progress...' : 'Waiting'
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          Real-time Test Monitor
        </Typography>
        
        <FormControlLabel
          control={
            <Switch
              checked={liveMode}
              onChange={(e) => setLiveMode(e.target.checked)}
              color="primary"
            />
          }
          label="Live Mode"
        />
        
        <Badge badgeContent={executions.filter(e => e.status === 'running').length} color="primary">
          <LiveIcon sx={{ ml: 2 }} />
        </Badge>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* Left Column - Test Executions */}
        <Box sx={{ flex: '2 1 65%', minWidth: '500px' }}>
          <Typography variant="h6" gutterBottom>
            Active Test Executions
          </Typography>
          
          {executions.length === 0 ? (
            <Alert severity="info">
              No active test executions. Start a test to see real-time monitoring.
            </Alert>
          ) : (
            executions.map(execution => (
              <ExecutionCard key={execution.id} execution={execution} />
            ))
          )}
        </Box>

        {/* Right Column - System Metrics */}
        <Box sx={{ flex: '1 1 30%', minWidth: '300px' }}>
          {/* Real-time Stats */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Live Statistics
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 45%', textAlign: 'center' }}>
                <Typography variant="h3" color="primary">
                  {executions.filter(e => e.status === 'running').length}
                </Typography>
                <Typography variant="caption">Running Tests</Typography>
              </Box>
              <Box sx={{ flex: '1 1 45%', textAlign: 'center' }}>
                <Typography variant="h3" color="success.main">
                  {executions.filter(e => e.status === 'completed').length}
                </Typography>
                <Typography variant="caption">Completed</Typography>
              </Box>
              <Box sx={{ flex: '1 1 45%', textAlign: 'center' }}>
                <Typography variant="h3" color="error.main">
                  {executions.filter(e => e.status === 'failed').length}
                </Typography>
                <Typography variant="caption">Failed</Typography>
              </Box>
              <Box sx={{ flex: '1 1 45%', textAlign: 'center' }}>
                <Typography variant="h3" color="warning.main">
                  {executions.filter(e => e.status === 'pending').length}
                </Typography>
                <Typography variant="caption">Pending</Typography>
              </Box>
            </Box>
          </Paper>

          {/* System Metrics Chart */}
          <SystemMetricsChart />
        </Box>
      </Box>

      {/* Speed Dial for Actions */}
      <SpeedDial
        ariaLabel="Test actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          icon={<PlayIcon />}
          tooltipTitle="Start New Test"
          onClick={() => {}}
        />
        <SpeedDialAction
          icon={<RefreshIcon />}
          tooltipTitle="Refresh All"
          onClick={() => {}}
        />
        <SpeedDialAction
          icon={<DownloadIcon />}
          tooltipTitle="Export Results"
          onClick={() => {}}
        />
        <SpeedDialAction
          icon={<SettingsIcon />}
          tooltipTitle="Monitor Settings"
          onClick={() => {}}
        />
      </SpeedDial>

      {/* Details Dialog */}
      <TestExecutionDetails />
    </Box>
  );
};

export default RealTimeMonitor;
