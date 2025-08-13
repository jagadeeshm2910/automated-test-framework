import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
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
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  Autocomplete,
  Stack,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as RunIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
  Save as SaveIcon,
  ExpandMore as ExpandIcon,
  Code as CodeIcon,
  Speed as PerformanceIcon,
  Security as SecurityIcon,
  Accessibility as AccessibilityIcon,
  BugReport as TestIcon,
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
} from '@mui/icons-material';

interface TestConfiguration {
  id: string;
  name: string;
  description: string;
  type: 'functional' | 'performance' | 'security' | 'accessibility' | 'visual';
  browser: string[];
  viewport: string[];
  timeout: number;
  retries: number;
  parallel: boolean;
  headless: boolean;
  screenshots: boolean;
  video: boolean;
  tags: string[];
  environment: string;
  baseUrl: string;
  schedule?: {
    enabled: boolean;
    cron: string;
    timezone: string;
  };
  notifications: {
    onSuccess: boolean;
    onFailure: boolean;
    email: string[];
    slack?: string;
  };
  advanced: {
    userAgent?: string;
    customHeaders?: Record<string, string>;
    cookies?: Record<string, string>;
    localStorage?: Record<string, string>;
    geolocation?: { latitude: number; longitude: number };
  };
}

const TestConfigurationManager: React.FC = () => {
  const [configurations, setConfigurations] = useState<TestConfiguration[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<TestConfiguration | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    // Load sample configurations
    const sampleConfigs: TestConfiguration[] = [
      {
        id: 'config_1',
        name: 'Standard Functional Tests',
        description: 'Basic functional testing configuration for form validation',
        type: 'functional',
        browser: ['chrome', 'firefox'],
        viewport: ['1920x1080', '1366x768'],
        timeout: 30000,
        retries: 2,
        parallel: true,
        headless: true,
        screenshots: true,
        video: false,
        tags: ['functional', 'forms', 'regression'],
        environment: 'staging',
        baseUrl: 'https://staging.example.com',
        schedule: {
          enabled: true,
          cron: '0 2 * * *',
          timezone: 'UTC',
        },
        notifications: {
          onSuccess: false,
          onFailure: true,
          email: ['team@example.com'],
        },
        advanced: {},
      },
      {
        id: 'config_2',
        name: 'Performance Testing Suite',
        description: 'Load testing and performance metrics collection',
        type: 'performance',
        browser: ['chrome'],
        viewport: ['1920x1080'],
        timeout: 60000,
        retries: 1,
        parallel: false,
        headless: true,
        screenshots: false,
        video: true,
        tags: ['performance', 'load', 'metrics'],
        environment: 'production',
        baseUrl: 'https://example.com',
        notifications: {
          onSuccess: true,
          onFailure: true,
          email: ['perf-team@example.com'],
          slack: '#performance-alerts',
        },
        advanced: {
          userAgent: 'Performance-Test-Bot/1.0',
        },
      },
    ];
    setConfigurations(sampleConfigs);
  }, []);

  const handleCreateNew = () => {
    const newConfig: TestConfiguration = {
      id: `config_${Date.now()}`,
      name: 'New Configuration',
      description: '',
      type: 'functional',
      browser: ['chrome'],
      viewport: ['1920x1080'],
      timeout: 30000,
      retries: 2,
      parallel: true,
      headless: true,
      screenshots: true,
      video: false,
      tags: [],
      environment: 'staging',
      baseUrl: '',
      notifications: {
        onSuccess: false,
        onFailure: true,
        email: [],
      },
      advanced: {},
    };
    setSelectedConfig(newConfig);
    setDialogOpen(true);
    setActiveStep(0);
  };

  const handleEdit = (config: TestConfiguration) => {
    setSelectedConfig(config);
    setDialogOpen(true);
    setActiveStep(0);
  };

  const handleSave = () => {
    if (!selectedConfig) return;

    setConfigurations(prev => {
      const existing = prev.find(c => c.id === selectedConfig.id);
      if (existing) {
        return prev.map(c => c.id === selectedConfig.id ? selectedConfig : c);
      } else {
        return [...prev, selectedConfig];
      }
    });
    setDialogOpen(false);
    setSelectedConfig(null);
  };

  const handleDelete = (id: string) => {
    setConfigurations(prev => prev.filter(c => c.id !== id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'functional': return <TestIcon />;
      case 'performance': return <PerformanceIcon />;
      case 'security': return <SecurityIcon />;
      case 'accessibility': return <AccessibilityIcon />;
      default: return <SettingsIcon />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'functional': return 'primary';
      case 'performance': return 'warning';
      case 'security': return 'error';
      case 'accessibility': return 'success';
      default: return 'default';
    }
  };

  const ConfigurationSteps = () => {
    const steps = [
      'Basic Information',
      'Test Environment',
      'Browser & Viewport',
      'Execution Settings',
      'Notifications',
      'Advanced Options',
    ];

    const handleNext = () => {
      setActiveStep(prev => Math.min(prev + 1, steps.length - 1));
    };

    const handleBack = () => {
      setActiveStep(prev => Math.max(prev - 1, 0));
    };

    if (!selectedConfig) return null;

    return (
      <Box sx={{ width: '100%' }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {/* Step 1: Basic Information */}
          <Step>
            <StepLabel>Basic Information</StepLabel>
            <StepContent>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Configuration Name"
                  value={selectedConfig.name}
                  onChange={(e) => setSelectedConfig({
                    ...selectedConfig,
                    name: e.target.value
                  })}
                />
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={selectedConfig.description}
                  onChange={(e) => setSelectedConfig({
                    ...selectedConfig,
                    description: e.target.value
                  })}
                />
                <FormControl fullWidth>
                  <InputLabel>Test Type</InputLabel>
                  <Select
                    value={selectedConfig.type}
                    onChange={(e) => setSelectedConfig({
                      ...selectedConfig,
                      type: e.target.value as any
                    })}
                  >
                    <MenuItem value="functional">Functional Testing</MenuItem>
                    <MenuItem value="performance">Performance Testing</MenuItem>
                    <MenuItem value="security">Security Testing</MenuItem>
                    <MenuItem value="accessibility">Accessibility Testing</MenuItem>
                    <MenuItem value="visual">Visual Regression Testing</MenuItem>
                  </Select>
                </FormControl>
                <Autocomplete
                  multiple
                  freeSolo
                  options={['functional', 'regression', 'smoke', 'integration', 'e2e']}
                  value={selectedConfig.tags}
                  onChange={(_, newValue) => setSelectedConfig({
                    ...selectedConfig,
                    tags: newValue
                  })}
                  renderInput={(params) => (
                    <TextField {...params} label="Tags" placeholder="Add tags" />
                  )}
                />
                <Box sx={{ display: 'flex', gap: 1, pt: 2 }}>
                  <Button onClick={handleNext} variant="contained">
                    Next
                  </Button>
                </Box>
              </Stack>
            </StepContent>
          </Step>

          {/* Step 2: Test Environment */}
          <Step>
            <StepLabel>Test Environment</StepLabel>
            <StepContent>
              <Stack spacing={3}>
                <FormControl fullWidth>
                  <InputLabel>Environment</InputLabel>
                  <Select
                    value={selectedConfig.environment}
                    onChange={(e) => setSelectedConfig({
                      ...selectedConfig,
                      environment: e.target.value
                    })}
                  >
                    <MenuItem value="development">Development</MenuItem>
                    <MenuItem value="staging">Staging</MenuItem>
                    <MenuItem value="production">Production</MenuItem>
                    <MenuItem value="local">Local</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Base URL"
                  value={selectedConfig.baseUrl}
                  onChange={(e) => setSelectedConfig({
                    ...selectedConfig,
                    baseUrl: e.target.value
                  })}
                />
                <Box sx={{ display: 'flex', gap: 1, pt: 2 }}>
                  <Button onClick={handleBack}>Back</Button>
                  <Button onClick={handleNext} variant="contained">
                    Next
                  </Button>
                </Box>
              </Stack>
            </StepContent>
          </Step>

          {/* Step 3: Browser & Viewport */}
          <Step>
            <StepLabel>Browser & Viewport Configuration</StepLabel>
            <StepContent>
              <Stack spacing={3}>
                <Autocomplete
                  multiple
                  options={['chrome', 'firefox', 'safari', 'edge']}
                  value={selectedConfig.browser}
                  onChange={(_, newValue) => setSelectedConfig({
                    ...selectedConfig,
                    browser: newValue
                  })}
                  renderInput={(params) => (
                    <TextField {...params} label="Browsers" />
                  )}
                />
                <Autocomplete
                  multiple
                  freeSolo
                  options={['1920x1080', '1366x768', '1280x720', '768x1024', '375x667']}
                  value={selectedConfig.viewport}
                  onChange={(_, newValue) => setSelectedConfig({
                    ...selectedConfig,
                    viewport: newValue
                  })}
                  renderInput={(params) => (
                    <TextField {...params} label="Viewports" />
                  )}
                />
                <Box sx={{ display: 'flex', gap: 1, pt: 2 }}>
                  <Button onClick={handleBack}>Back</Button>
                  <Button onClick={handleNext} variant="contained">
                    Next
                  </Button>
                </Box>
              </Stack>
            </StepContent>
          </Step>

          {/* Step 4: Execution Settings */}
          <Step>
            <StepLabel>Execution Settings</StepLabel>
            <StepContent>
              <Stack spacing={3}>
                <Box>
                  <Typography gutterBottom>Timeout (seconds)</Typography>
                  <Slider
                    value={selectedConfig.timeout / 1000}
                    onChange={(_, value) => setSelectedConfig({
                      ...selectedConfig,
                      timeout: (value as number) * 1000
                    })}
                    min={10}
                    max={300}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Box>
                <Box>
                  <Typography gutterBottom>Retry Count</Typography>
                  <Slider
                    value={selectedConfig.retries}
                    onChange={(_, value) => setSelectedConfig({
                      ...selectedConfig,
                      retries: value as number
                    })}
                    min={0}
                    max={5}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedConfig.parallel}
                      onChange={(e) => setSelectedConfig({
                        ...selectedConfig,
                        parallel: e.target.checked
                      })}
                    />
                  }
                  label="Run tests in parallel"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedConfig.headless}
                      onChange={(e) => setSelectedConfig({
                        ...selectedConfig,
                        headless: e.target.checked
                      })}
                    />
                  }
                  label="Headless mode"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedConfig.screenshots}
                      onChange={(e) => setSelectedConfig({
                        ...selectedConfig,
                        screenshots: e.target.checked
                      })}
                    />
                  }
                  label="Capture screenshots"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedConfig.video}
                      onChange={(e) => setSelectedConfig({
                        ...selectedConfig,
                        video: e.target.checked
                      })}
                    />
                  }
                  label="Record video"
                />
                <Box sx={{ display: 'flex', gap: 1, pt: 2 }}>
                  <Button onClick={handleBack}>Back</Button>
                  <Button onClick={handleNext} variant="contained">
                    Next
                  </Button>
                </Box>
              </Stack>
            </StepContent>
          </Step>

          {/* Step 5: Notifications */}
          <Step>
            <StepLabel>Notifications</StepLabel>
            <StepContent>
              <Stack spacing={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedConfig.notifications.onSuccess}
                      onChange={(e) => setSelectedConfig({
                        ...selectedConfig,
                        notifications: {
                          ...selectedConfig.notifications,
                          onSuccess: e.target.checked
                        }
                      })}
                    />
                  }
                  label="Notify on success"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedConfig.notifications.onFailure}
                      onChange={(e) => setSelectedConfig({
                        ...selectedConfig,
                        notifications: {
                          ...selectedConfig.notifications,
                          onFailure: e.target.checked
                        }
                      })}
                    />
                  }
                  label="Notify on failure"
                />
                <Autocomplete
                  multiple
                  freeSolo
                  options={[]}
                  value={selectedConfig.notifications.email}
                  onChange={(_, newValue) => setSelectedConfig({
                    ...selectedConfig,
                    notifications: {
                      ...selectedConfig.notifications,
                      email: newValue
                    }
                  })}
                  renderInput={(params) => (
                    <TextField {...params} label="Email Recipients" />
                  )}
                />
                <TextField
                  fullWidth
                  label="Slack Channel (optional)"
                  value={selectedConfig.notifications.slack || ''}
                  onChange={(e) => setSelectedConfig({
                    ...selectedConfig,
                    notifications: {
                      ...selectedConfig.notifications,
                      slack: e.target.value
                    }
                  })}
                />
                <Box sx={{ display: 'flex', gap: 1, pt: 2 }}>
                  <Button onClick={handleBack}>Back</Button>
                  <Button onClick={handleNext} variant="contained">
                    Next
                  </Button>
                </Box>
              </Stack>
            </StepContent>
          </Step>

          {/* Step 6: Advanced Options */}
          <Step>
            <StepLabel>Advanced Options</StepLabel>
            <StepContent>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Custom User Agent"
                  value={selectedConfig.advanced.userAgent || ''}
                  onChange={(e) => setSelectedConfig({
                    ...selectedConfig,
                    advanced: {
                      ...selectedConfig.advanced,
                      userAgent: e.target.value
                    }
                  })}
                />
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Custom Headers (JSON)"
                  value={JSON.stringify(selectedConfig.advanced.customHeaders || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const headers = JSON.parse(e.target.value);
                      setSelectedConfig({
                        ...selectedConfig,
                        advanced: {
                          ...selectedConfig.advanced,
                          customHeaders: headers
                        }
                      });
                    } catch {
                      // Invalid JSON, ignore
                    }
                  }}
                />
                <Box sx={{ display: 'flex', gap: 1, pt: 2 }}>
                  <Button onClick={handleBack}>Back</Button>
                  <Button onClick={handleSave} variant="contained" color="primary">
                    Save Configuration
                  </Button>
                </Box>
              </Stack>
            </StepContent>
          </Step>
        </Stepper>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <SettingsIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          Test Configuration Manager
        </Typography>
        
        <Button
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
          variant="contained"
        >
          New Configuration
        </Button>
      </Box>

      {/* Configurations List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {configurations.map((config) => (
          <Card key={config.id}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ mr: 2, mt: 0.5 }}>
                  {getTypeIcon(config.type)}
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {config.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {config.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip 
                      label={config.type} 
                      color={getTypeColor(config.type) as any}
                      size="small"
                    />
                    <Chip 
                      label={config.environment} 
                      variant="outlined" 
                      size="small"
                    />
                    <Chip 
                      label={`${config.browser.length} browsers`} 
                      variant="outlined" 
                      size="small"
                    />
                    {config.parallel && (
                      <Chip label="Parallel" color="primary" size="small" />
                    )}
                    {config.schedule?.enabled && (
                      <Chip 
                        icon={<ScheduleIcon />}
                        label="Scheduled" 
                        color="secondary" 
                        size="small"
                      />
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="caption" color="text.secondary">
                      <strong>Timeout:</strong> {config.timeout / 1000}s
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      <strong>Retries:</strong> {config.retries}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      <strong>Tags:</strong> {config.tags.join(', ') || 'None'}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <IconButton 
                    onClick={() => handleEdit(config)}
                    color="primary"
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => {}}
                    color="success"
                    size="small"
                  >
                    <RunIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleDelete(config.id)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {configurations.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 3 }}>
          <SettingsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Test Configurations Yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create your first test configuration to get started with automated testing.
          </Typography>
          <Button
            startIcon={<AddIcon />}
            onClick={handleCreateNew}
            variant="contained"
            size="large"
          >
            Create Configuration
          </Button>
        </Paper>
      )}

      {/* Configuration Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {selectedConfig?.id.startsWith('config_') && selectedConfig.id !== `config_${Date.now()}` 
            ? 'Edit Configuration' 
            : 'Create New Configuration'}
        </DialogTitle>
        <DialogContent>
          <ConfigurationSteps />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TestConfigurationManager;
