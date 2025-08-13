import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
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
  LinearProgress,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert
} from '@mui/material';
import {
  CloudQueue,
  Computer,
  Add,
  Edit,
  Delete,
  PlayArrow,
  Refresh,
  Settings,
  Visibility,
  Security,
  Storage,
  NetworkCheck,
  CheckCircle,
  Error,
  Warning,
  Compare,
  FileCopy,
  CloudUpload,
  VpnKey,
  Lock,
  Https,
  Api,
  DataObject,
  Sync,
  BugReport
} from '@mui/icons-material';

interface Environment {
  id: string;
  name: string;
  type: 'development' | 'staging' | 'production' | 'testing';
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  url: string;
  description: string;
  browser_configs: BrowserConfig[];
  variables: EnvironmentVariable[];
  created: Date;
  last_updated: Date;
  last_test_run: Date;
  health_score: number;
  uptime: number;
  response_time: number;
  ssl_enabled: boolean;
  auth_required: boolean;
  deployment_method: 'manual' | 'ci_cd' | 'automated';
  tags: string[];
}

interface BrowserConfig {
  id: string;
  browser: 'chrome' | 'firefox' | 'safari' | 'edge';
  version: string;
  viewport: { width: number; height: number };
  device_type: 'desktop' | 'tablet' | 'mobile';
  enabled: boolean;
  user_agent?: string;
  additional_flags?: string[];
}

interface EnvironmentVariable {
  id: string;
  key: string;
  value: string;
  encrypted: boolean;
  description: string;
  required: boolean;
  category: 'auth' | 'api' | 'config' | 'database' | 'feature_flag';
}

interface HealthCheck {
  id: string;
  environment_id: string;
  timestamp: Date;
  status: 'healthy' | 'warning' | 'error';
  response_time: number;
  checks: {
    ssl: boolean;
    dns: boolean;
    api: boolean;
    database: boolean;
    storage: boolean;
  };
  errors: string[];
}

const EnvironmentManager: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [loading, setLoading] = useState(false);
  const [openEnvDialog, setOpenEnvDialog] = useState(false);
  const [openVarDialog, setOpenVarDialog] = useState(false);
  const [selectedEnv, setSelectedEnv] = useState<Environment | null>(null);
  const [selectedEnvId, setSelectedEnvId] = useState<string>('');
  const [showSecrets, setShowSecrets] = useState(false);
  const [stepperActiveStep, setStepperActiveStep] = useState(0);

  // Mock data
  useEffect(() => {
    const mockEnvironments: Environment[] = [
      {
        id: 'env1',
        name: 'Production',
        type: 'production',
        status: 'active',
        url: 'https://app.example.com',
        description: 'Production environment for live users',
        browser_configs: [
          {
            id: 'bc1',
            browser: 'chrome',
            version: '120.0',
            viewport: { width: 1920, height: 1080 },
            device_type: 'desktop',
            enabled: true
          },
          {
            id: 'bc2',
            browser: 'firefox',
            version: '119.0',
            viewport: { width: 1920, height: 1080 },
            device_type: 'desktop',
            enabled: true
          }
        ],
        variables: [
          {
            id: 'var1',
            key: 'API_BASE_URL',
            value: 'https://api.example.com',
            encrypted: false,
            description: 'Base URL for API calls',
            required: true,
            category: 'api'
          },
          {
            id: 'var2',
            key: 'DATABASE_PASSWORD',
            value: '••••••••••••',
            encrypted: true,
            description: 'Database connection password',
            required: true,
            category: 'database'
          }
        ],
        created: new Date('2024-01-10'),
        last_updated: new Date('2024-01-22'),
        last_test_run: new Date('2024-01-23'),
        health_score: 98.5,
        uptime: 99.9,
        response_time: 145,
        ssl_enabled: true,
        auth_required: true,
        deployment_method: 'ci_cd',
        tags: ['production', 'critical', 'monitored']
      },
      {
        id: 'env2',
        name: 'Staging',
        type: 'staging',
        status: 'active',
        url: 'https://staging.example.com',
        description: 'Pre-production testing environment',
        browser_configs: [
          {
            id: 'bc3',
            browser: 'chrome',
            version: '121.0',
            viewport: { width: 1920, height: 1080 },
            device_type: 'desktop',
            enabled: true
          }
        ],
        variables: [
          {
            id: 'var3',
            key: 'API_BASE_URL',
            value: 'https://staging-api.example.com',
            encrypted: false,
            description: 'Staging API base URL',
            required: true,
            category: 'api'
          }
        ],
        created: new Date('2024-01-08'),
        last_updated: new Date('2024-01-21'),
        last_test_run: new Date('2024-01-23'),
        health_score: 95.2,
        uptime: 99.5,
        response_time: 180,
        ssl_enabled: true,
        auth_required: false,
        deployment_method: 'automated',
        tags: ['staging', 'testing']
      },
      {
        id: 'env3',
        name: 'Development',
        type: 'development',
        status: 'maintenance',
        url: 'https://dev.example.com',
        description: 'Development environment for feature testing',
        browser_configs: [
          {
            id: 'bc4',
            browser: 'chrome',
            version: 'latest',
            viewport: { width: 1366, height: 768 },
            device_type: 'desktop',
            enabled: true
          }
        ],
        variables: [
          {
            id: 'var4',
            key: 'DEBUG_MODE',
            value: 'true',
            encrypted: false,
            description: 'Enable debug logging',
            required: false,
            category: 'config'
          }
        ],
        created: new Date('2024-01-05'),
        last_updated: new Date('2024-01-20'),
        last_test_run: new Date('2024-01-22'),
        health_score: 87.3,
        uptime: 95.0,
        response_time: 250,
        ssl_enabled: false,
        auth_required: false,
        deployment_method: 'manual',
        tags: ['development', 'experimental']
      }
    ];

    const mockHealthChecks: HealthCheck[] = [
      {
        id: 'hc1',
        environment_id: 'env1',
        timestamp: new Date(),
        status: 'healthy',
        response_time: 145,
        checks: {
          ssl: true,
          dns: true,
          api: true,
          database: true,
          storage: true
        },
        errors: []
      },
      {
        id: 'hc2',
        environment_id: 'env2',
        timestamp: new Date(),
        status: 'warning',
        response_time: 280,
        checks: {
          ssl: true,
          dns: true,
          api: true,
          database: false,
          storage: true
        },
        errors: ['Database connection timeout']
      }
    ];

    setEnvironments(mockEnvironments);
    setHealthChecks(mockHealthChecks);
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateEnvironment = () => {
    setSelectedEnv(null);
    setStepperActiveStep(0);
    setOpenEnvDialog(true);
  };

  const handleEditEnvironment = (env: Environment) => {
    setSelectedEnv(env);
    setStepperActiveStep(0);
    setOpenEnvDialog(true);
  };

  const handleDeleteEnvironment = (id: string) => {
    setEnvironments(prev => prev.filter(env => env.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'maintenance': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'production': return 'error';
      case 'staging': return 'warning';
      case 'development': return 'info';
      case 'testing': return 'secondary';
      default: return 'default';
    }
  };

  const getBrowserIcon = (_browser: string) => {
    // For simplicity, using generic computer icon
    // In a real app, you'd use specific browser icons
    return <Computer />;
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle color="success" />;
      case 'warning': return <Warning color="warning" />;
      case 'error': return <Error color="error" />;
      default: return <BugReport />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'auth': return <Security />;
      case 'api': return <Api />;
      case 'config': return <Settings />;
      case 'database': return <Storage />;
      case 'feature_flag': return <BugReport />;
      default: return <DataObject />;
    }
  };

  // Environments Tab
  const EnvironmentsTab = () => (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateEnvironment}
        >
          Add Environment
        </Button>
        <Button
          startIcon={<Refresh />}
          onClick={() => setLoading(true)}
          disabled={loading}
        >
          Refresh Status
        </Button>
        <Button
          startIcon={<NetworkCheck />}
          variant="outlined"
        >
          Run Health Checks
        </Button>
        <Button
          startIcon={<Compare />}
          variant="outlined"
        >
          Compare Environments
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {environments.map((env) => {
          const healthCheck = healthChecks.find(hc => hc.environment_id === env.id);
          
          return (
            <Box key={env.id} sx={{ flex: '1 1 45%', minWidth: '400px' }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" component="div">
                        {env.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {env.description}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                      <Chip
                        label={env.type.toUpperCase()}
                        color={getTypeColor(env.type)}
                        size="small"
                      />
                      <Chip
                        label={env.status.toUpperCase()}
                        color={getStatusColor(env.status)}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      URL: <a href={env.url} target="_blank" rel="noopener noreferrer">{env.url}</a>
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Last Test: {env.last_test_run.toLocaleDateString()}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Box sx={{ flex: 1, textAlign: 'center' }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="primary">
                          {env.health_score}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Health Score
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ flex: 1, textAlign: 'center' }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="success.main">
                          {env.uptime}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Uptime
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ flex: 1, textAlign: 'center' }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6">
                          {env.response_time}ms
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Response
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    {env.ssl_enabled && <Chip icon={<Https />} label="SSL" size="small" />}
                    {env.auth_required && <Chip icon={<Lock />} label="Auth" size="small" />}
                    <Chip icon={<Sync />} label={env.deployment_method.replace('_', ' ')} size="small" />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {env.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>

                  {healthCheck && (
                    <Box sx={{ mt: 2, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {getHealthIcon(healthCheck.status)}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          Health Check: {healthCheck.status.toUpperCase()}
                        </Typography>
                      </Box>
                      {healthCheck.errors.length > 0 && (
                        <Typography variant="caption" color="error">
                          {healthCheck.errors.join(', ')}
                        </Typography>
                      )}
                    </Box>
                  )}
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Box>
                    <Tooltip title="Run Tests">
                      <IconButton size="small" color="primary">
                        <PlayArrow />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedEnvId(env.id);
                          setTabValue(1);
                        }}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleEditEnvironment(env)}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Button
                    size="small"
                    startIcon={<Delete />}
                    onClick={() => handleDeleteEnvironment(env.id)}
                    color="error"
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Box>
          );
        })}
      </Box>
    </Box>
  );

  // Variables Tab
  const VariablesTab = () => {
    const selectedEnvironment = selectedEnvId 
      ? environments.find(env => env.id === selectedEnvId)
      : environments[0];

    if (!selectedEnvironment) {
      return (
        <Alert severity="info">
          Please select an environment to view its variables.
        </Alert>
      );
    }

    return (
      <Box>
        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Environment</InputLabel>
            <Select
              value={selectedEnvId || selectedEnvironment.id}
              onChange={(e) => setSelectedEnvId(e.target.value)}
            >
              {environments.map((env) => (
                <MenuItem key={env.id} value={env.id}>
                  {env.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenVarDialog(true)}
          >
            Add Variable
          </Button>
          <Button
            startIcon={<FileCopy />}
            variant="outlined"
          >
            Copy from Environment
          </Button>
          <FormControlLabel
            control={
              <Switch
                checked={showSecrets}
                onChange={(e) => setShowSecrets(e.target.checked)}
              />
            }
            label="Show Encrypted Values"
          />
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Variable</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Required</TableCell>
                <TableCell>Encrypted</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedEnvironment.variables.map((variable) => (
                <TableRow key={variable.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getCategoryIcon(variable.category)}
                      <Box sx={{ ml: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          {variable.key}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {variable.description}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ maxWidth: 200 }}>
                      {variable.encrypted && !showSecrets ? (
                        <Typography variant="body2" fontFamily="monospace">
                          ••••••••••••
                        </Typography>
                      ) : (
                        <Typography
                          variant="body2"
                          fontFamily="monospace"
                          sx={{
                            wordBreak: 'break-all',
                            maxWidth: '200px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {variable.value}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={variable.category.replace('_', ' ')}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {variable.required ? (
                      <CheckCircle color="warning" fontSize="small" />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Optional
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {variable.encrypted && (
                      <Chip
                        icon={<Security />}
                        label="Encrypted"
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit">
                      <IconButton size="small">
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Copy">
                      <IconButton size="small">
                        <FileCopy />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small">
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  // Browser Configs Tab
  const BrowserConfigsTab = () => {
    const selectedEnvironment = selectedEnvId 
      ? environments.find(env => env.id === selectedEnvId)
      : environments[0];

    if (!selectedEnvironment) {
      return (
        <Alert severity="info">
          Please select an environment to view its browser configurations.
        </Alert>
      );
    }

    return (
      <Box>
        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Environment</InputLabel>
            <Select
              value={selectedEnvId || selectedEnvironment.id}
              onChange={(e) => setSelectedEnvId(e.target.value)}
            >
              {environments.map((env) => (
                <MenuItem key={env.id} value={env.id}>
                  {env.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<Add />}
          >
            Add Browser Config
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {selectedEnvironment.browser_configs.map((config) => (
            <Box key={config.id} sx={{ flex: '1 1 30%', minWidth: '300px' }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {getBrowserIcon(config.browser)}
                    <Typography variant="h6" sx={{ ml: 1, textTransform: 'capitalize' }}>
                      {config.browser}
                    </Typography>
                    <Switch
                      checked={config.enabled}
                      sx={{ ml: 'auto' }}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Version: {config.version}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Viewport: {config.viewport.width} × {config.viewport.height}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Device: {config.device_type}
                  </Typography>

                  {config.user_agent && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        User Agent:
                      </Typography>
                      <Typography
                        variant="caption"
                        fontFamily="monospace"
                        sx={{ display: 'block', wordBreak: 'break-all' }}
                      >
                        {config.user_agent}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                <CardActions>
                  <Button size="small" startIcon={<Edit />}>
                    Edit
                  </Button>
                  <Button size="small" startIcon={<Delete />} color="error">
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  const environmentSteps = [
    'Basic Information',
    'Configuration',
    'Browser Settings',
    'Environment Variables',
    'Review & Create'
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Environment Manager
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage test environments, configurations, and deployment settings
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<CloudUpload />}
          >
            Import Config
          </Button>
          <Button
            variant="outlined"
            startIcon={<Settings />}
          >
            Global Settings
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
          <Tab label="Environments" icon={<CloudQueue />} />
          <Tab label="Variables" icon={<VpnKey />} />
          <Tab label="Browser Configs" icon={<Computer />} />
          <Tab label="Health Monitoring" icon={<NetworkCheck />} />
        </Tabs>
      </Paper>

      <Box sx={{ mt: 3 }}>
        {tabValue === 0 && <EnvironmentsTab />}
        {tabValue === 1 && <VariablesTab />}
        {tabValue === 2 && <BrowserConfigsTab />}
        {tabValue === 3 && (
          <Alert severity="info">
            Health Monitoring - Coming soon! Continuous monitoring of environment health and performance.
          </Alert>
        )}
      </Box>

      {/* Environment Creation/Edit Dialog */}
      <Dialog
        open={openEnvDialog}
        onClose={() => setOpenEnvDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedEnv ? 'Edit Environment' : 'Create New Environment'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Stepper activeStep={stepperActiveStep} orientation="vertical">
              {environmentSteps.map((label, index) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                  <StepContent>
                    {index === 0 && (
                      <Box sx={{ mb: 2 }}>
                        <TextField
                          label="Environment Name"
                          fullWidth
                          sx={{ mb: 2 }}
                          defaultValue={selectedEnv?.name}
                        />
                        <FormControl fullWidth sx={{ mb: 2 }}>
                          <InputLabel>Type</InputLabel>
                          <Select defaultValue={selectedEnv?.type || 'development'}>
                            <MenuItem value="development">Development</MenuItem>
                            <MenuItem value="testing">Testing</MenuItem>
                            <MenuItem value="staging">Staging</MenuItem>
                            <MenuItem value="production">Production</MenuItem>
                          </Select>
                        </FormControl>
                        <TextField
                          label="Description"
                          fullWidth
                          multiline
                          rows={3}
                          defaultValue={selectedEnv?.description}
                        />
                      </Box>
                    )}
                    <Box sx={{ mb: 1 }}>
                      <Button
                        variant="contained"
                        onClick={() => setStepperActiveStep(index + 1)}
                        sx={{ mt: 1, mr: 1 }}
                        disabled={index === environmentSteps.length - 1}
                      >
                        {index === environmentSteps.length - 1 ? 'Finish' : 'Continue'}
                      </Button>
                      <Button
                        disabled={index === 0}
                        onClick={() => setStepperActiveStep(index - 1)}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        Back
                      </Button>
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEnvDialog(false)}>Cancel</Button>
          <Button variant="contained">
            {selectedEnv ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Variable Dialog */}
      <Dialog
        open={openVarDialog}
        onClose={() => setOpenVarDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Environment Variable</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              label="Variable Key"
              fullWidth
              sx={{ mb: 2 }}
              placeholder="API_BASE_URL"
            />
            <TextField
              label="Variable Value"
              fullWidth
              sx={{ mb: 2 }}
              placeholder="https://api.example.com"
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Category</InputLabel>
              <Select defaultValue="config">
                <MenuItem value="auth">Authentication</MenuItem>
                <MenuItem value="api">API</MenuItem>
                <MenuItem value="config">Configuration</MenuItem>
                <MenuItem value="database">Database</MenuItem>
                <MenuItem value="feature_flag">Feature Flag</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={<Switch />}
              label="Required variable"
            />
            <FormControlLabel
              control={<Switch />}
              label="Encrypt value"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenVarDialog(false)}>Cancel</Button>
          <Button variant="contained">Add Variable</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnvironmentManager;
