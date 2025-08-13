import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Button,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Avatar,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Api as ApiIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as TestIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Security as SecurityIcon,
  BarChart as MetricsIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
  Lock as LockIcon,
  Key as KeyIcon,
  CloudQueue as CloudIcon,
  IntegrationInstructions as IntegrationIcon,
  Description as DocsIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface APIEndpoint {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  category: string;
  status: 'active' | 'inactive' | 'deprecated';
  auth: {
    type: 'none' | 'apikey' | 'bearer' | 'basic' | 'oauth2';
    credentials?: any;
  };
  headers: Record<string, string>;
  parameters: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
    example: string;
  }>;
  responseSchema: any;
  testCases: Array<{
    id: string;
    name: string;
    request: any;
    expectedResponse: any;
    status: 'passed' | 'failed' | 'pending';
  }>;
  metrics: {
    totalCalls: number;
    successRate: number;
    avgResponseTime: number;
    errorRate: number;
    lastCalled: string;
  };
}

interface Integration {
  id: string;
  name: string;
  provider: string;
  type: 'rest' | 'graphql' | 'webhook' | 'websocket';
  baseUrl: string;
  status: 'connected' | 'disconnected' | 'error';
  auth: any;
  endpoints: string[];
  createdAt: string;
  lastSync: string;
  metrics: {
    totalRequests: number;
    successRate: number;
    avgLatency: number;
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const APIIntegrationManager: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'integration' | 'endpoint' | 'test'>('integration');
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  const generateMockIntegrations = (): Integration[] => {
    return [
      {
        id: 'int1',
        name: 'Main API Service',
        provider: 'Internal',
        type: 'rest',
        baseUrl: 'https://api.example.com/v1',
        status: 'connected',
        auth: { type: 'bearer' },
        endpoints: ['auth', 'users', 'products'],
        createdAt: '2024-01-15T10:00:00Z',
        lastSync: new Date().toISOString(),
        metrics: {
          totalRequests: 15420,
          successRate: 98.5,
          avgLatency: 245,
        },
      },
      {
        id: 'int2',
        name: 'Payment Gateway',
        provider: 'Stripe',
        type: 'rest',
        baseUrl: 'https://api.stripe.com/v1',
        status: 'connected',
        auth: { type: 'apikey' },
        endpoints: ['charges', 'customers', 'subscriptions'],
        createdAt: '2024-01-10T15:30:00Z',
        lastSync: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        metrics: {
          totalRequests: 8750,
          successRate: 99.2,
          avgLatency: 320,
        },
      },
      {
        id: 'int3',
        name: 'Analytics Service',
        provider: 'Google Analytics',
        type: 'rest',
        baseUrl: 'https://analyticsreporting.googleapis.com/v4',
        status: 'error',
        auth: { type: 'oauth2' },
        endpoints: ['reports'],
        createdAt: '2024-01-20T09:15:00Z',
        lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        metrics: {
          totalRequests: 2340,
          successRate: 85.5,
          avgLatency: 1200,
        },
      },
    ];
  };

  const generateMockEndpoints = (): APIEndpoint[] => {
    return [
      {
        id: 'ep1',
        name: 'User Authentication',
        url: '/auth/login',
        method: 'POST',
        description: 'Authenticate user credentials and return JWT token',
        category: 'Authentication',
        status: 'active',
        auth: {
          type: 'none',
        },
        headers: {
          'Content-Type': 'application/json',
        },
        parameters: [
          {
            name: 'email',
            type: 'string',
            required: true,
            description: 'User email address',
            example: 'user@example.com',
          },
          {
            name: 'password',
            type: 'string',
            required: true,
            description: 'User password',
            example: 'secretpassword',
          },
        ],
        responseSchema: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: { type: 'object' },
            expiresIn: { type: 'number' },
          },
        },
        testCases: [
          {
            id: 'tc1',
            name: 'Valid Login',
            request: {
              email: 'test@example.com',
              password: 'password123',
            },
            expectedResponse: {
              status: 200,
              body: { token: 'jwt-token', user: {} },
            },
            status: 'passed',
          },
          {
            id: 'tc2',
            name: 'Invalid Credentials',
            request: {
              email: 'test@example.com',
              password: 'wrongpassword',
            },
            expectedResponse: {
              status: 401,
              body: { error: 'Invalid credentials' },
            },
            status: 'failed',
          },
        ],
        metrics: {
          totalCalls: 5420,
          successRate: 96.8,
          avgResponseTime: 180,
          errorRate: 3.2,
          lastCalled: new Date().toISOString(),
        },
      },
      {
        id: 'ep2',
        name: 'Get User Profile',
        url: '/users/{id}',
        method: 'GET',
        description: 'Retrieve user profile information',
        category: 'Users',
        status: 'active',
        auth: {
          type: 'bearer',
        },
        headers: {
          'Authorization': 'Bearer {token}',
        },
        parameters: [
          {
            name: 'id',
            type: 'string',
            required: true,
            description: 'User ID',
            example: '12345',
          },
        ],
        responseSchema: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
            createdAt: { type: 'string' },
          },
        },
        testCases: [
          {
            id: 'tc3',
            name: 'Get Existing User',
            request: {
              id: '12345',
            },
            expectedResponse: {
              status: 200,
              body: { id: '12345', email: 'test@example.com' },
            },
            status: 'passed',
          },
        ],
        metrics: {
          totalCalls: 12340,
          successRate: 99.1,
          avgResponseTime: 95,
          errorRate: 0.9,
          lastCalled: new Date(Date.now() - 30 * 1000).toISOString(),
        },
      },
    ];
  };

  useEffect(() => {
    setIntegrations(generateMockIntegrations());
    setEndpoints(generateMockEndpoints());
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active':
      case 'passed':
        return 'success';
      case 'error':
      case 'failed':
        return 'error';
      case 'disconnected':
      case 'inactive':
      case 'deprecated':
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active':
      case 'passed':
        return <CheckCircleIcon color="success" />;
      case 'error':
      case 'failed':
        return <ErrorIcon color="error" />;
      case 'disconnected':
      case 'inactive':
      case 'deprecated':
      case 'pending':
        return <WarningIcon color="warning" />;
      default:
        return <CheckCircleIcon />;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return '#4caf50';
      case 'POST':
        return '#2196f3';
      case 'PUT':
        return '#ff9800';
      case 'DELETE':
        return '#f44336';
      case 'PATCH':
        return '#9c27b0';
      default:
        return '#757575';
    }
  };

  const handleCreateIntegration = () => {
    setDialogType('integration');
    setDialogOpen(true);
    setActiveStep(0);
  };

  const handleCreateEndpoint = () => {
    setDialogType('endpoint');
    setDialogOpen(true);
  };

  const handleTestEndpoint = (endpointId: string) => {
    setLoading(true);
    setTimeout(() => {
      // Simulate API test
      const results = {
        endpointId,
        status: 'passed',
        responseTime: Math.random() * 200 + 50,
        statusCode: 200,
        response: { success: true, data: {} },
      };
      setTestResults([...testResults, results]);
      setLoading(false);
    }, 2000);
  };

  const integrationSteps = [
    'Basic Information',
    'Authentication',
    'Configuration',
    'Test Connection',
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            API Integration Manager
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateIntegration}
            >
              Add Integration
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => window.location.reload()}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)}>
            <Tab label="Integrations" icon={<IntegrationIcon />} />
            <Tab label="Endpoints" icon={<ApiIcon />} />
            <Tab label="Analytics" icon={<MetricsIcon />} />
            <Tab label="Documentation" icon={<DocsIcon />} />
          </Tabs>
        </Box>

        {/* Integrations Tab */}
        <TabPanel value={selectedTab} index={0}>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {integrations.map((integration) => (
              <Box sx={{ flex: '1 1 33%', minWidth: '300px' }} key={integration.id}>
                <Card>
                  <CardHeader
                    avatar={
                      <Avatar>
                        <CloudIcon />
                      </Avatar>
                    }
                    title={integration.name}
                    subheader={integration.provider}
                    action={
                      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                        <MoreVertIcon />
                      </IconButton>
                    }
                  />
                  <CardContent>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        {getStatusIcon(integration.status)}
                        <Chip
                          size="small"
                          color={getStatusColor(integration.status) as any}
                          label={integration.status.toUpperCase()}
                        />
                        <Chip
                          size="small"
                          variant="outlined"
                          label={integration.type.toUpperCase()}
                        />
                      </Box>
                      <Typography variant="body2" color="textSecondary">
                        {integration.baseUrl}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Endpoints: {integration.endpoints.length}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Success Rate: {integration.metrics.successRate}%
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Avg Latency: {integration.metrics.avgLatency}ms
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" startIcon={<TestIcon />}>
                        Test
                      </Button>
                      <Button size="small" startIcon={<EditIcon />}>
                        Edit
                      </Button>
                      <Button size="small" startIcon={<VisibilityIcon />}>
                        View
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </TabPanel>

        {/* Endpoints Tab */}
        <TabPanel value={selectedTab} index={1}>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateEndpoint}
              sx={{ mb: 3 }}
            >
              Add Endpoint
            </Button>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {endpoints.map((endpoint) => (
              <Box sx={{ flex: '1 1 100%' }} key={endpoint.id}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Chip
                        size="small"
                        label={endpoint.method}
                        sx={{
                          backgroundColor: getMethodColor(endpoint.method),
                          color: 'white',
                          fontWeight: 'bold',
                          minWidth: 60,
                        }}
                      />
                      <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        {endpoint.name}
                      </Typography>
                      <Chip
                        size="small"
                        color={getStatusColor(endpoint.status) as any}
                        label={endpoint.status}
                      />
                      <Typography variant="body2" color="textSecondary">
                        {endpoint.metrics.successRate}% success
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                      <Box sx={{ flex: '1 1 50%', minWidth: '300px' }}>
                        <Typography variant="h6" gutterBottom>
                          Details
                        </Typography>
                        <Typography variant="body2" color="textSecondary" paragraph>
                          {endpoint.description}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>URL:</strong> {endpoint.url}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Category:</strong> {endpoint.category}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Auth Type:</strong> {endpoint.auth.type}
                        </Typography>

                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                          Parameters
                        </Typography>
                        <List dense>
                          {endpoint.parameters.map((param, index) => (
                            <ListItem key={index}>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body2" fontWeight="medium">
                                      {param.name}
                                    </Typography>
                                    <Chip
                                      size="small"
                                      label={param.type}
                                      variant="outlined"
                                    />
                                    {param.required && (
                                      <Chip
                                        size="small"
                                        label="required"
                                        color="error"
                                        variant="outlined"
                                      />
                                    )}
                                  </Box>
                                }
                                secondary={param.description}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                      <Box sx={{ flex: '1 1 50%', minWidth: '300px' }}>
                        <Typography variant="h6" gutterBottom>
                          Metrics
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="textSecondary">
                            Total Calls: {endpoint.metrics.totalCalls.toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Success Rate: {endpoint.metrics.successRate}%
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Avg Response Time: {endpoint.metrics.avgResponseTime}ms
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Error Rate: {endpoint.metrics.errorRate}%
                          </Typography>
                        </Box>

                        <Typography variant="h6" gutterBottom>
                          Test Cases
                        </Typography>
                        <List dense>
                          {endpoint.testCases.map((testCase) => (
                            <ListItem key={testCase.id}>
                              <ListItemIcon>
                                {getStatusIcon(testCase.status)}
                              </ListItemIcon>
                              <ListItemText
                                primary={testCase.name}
                                secondary={`Status: ${testCase.status}`}
                              />
                              <ListItemSecondaryAction>
                                <IconButton size="small">
                                  <TestIcon />
                                </IconButton>
                              </ListItemSecondaryAction>
                            </ListItem>
                          ))}
                        </List>

                        <Box sx={{ mt: 2 }}>
                          <Button
                            variant="contained"
                            startIcon={<TestIcon />}
                            onClick={() => handleTestEndpoint(endpoint.id)}
                            disabled={loading}
                            fullWidth
                          >
                            Test Endpoint
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </Box>
            ))}
          </Box>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={selectedTab} index={2}>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 50%', minWidth: '400px' }}>
              <Card>
                <CardHeader title="API Performance Overview" />
                <CardContent>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={Array.from({ length: 24 }, (_, i) => ({
                          hour: `${i}:00`,
                          requests: Math.random() * 1000 + 500,
                          errors: Math.random() * 50 + 10,
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Line type="monotone" dataKey="requests" stroke="#2196f3" />
                        <Line type="monotone" dataKey="errors" stroke="#f44336" />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 50%', minWidth: '400px' }}>
              <Card>
                <CardHeader title="Method Distribution" />
                <CardContent>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'GET', value: 45, fill: '#4caf50' },
                            { name: 'POST', value: 30, fill: '#2196f3' },
                            { name: 'PUT', value: 15, fill: '#ff9800' },
                            { name: 'DELETE', value: 10, fill: '#f44336' },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {[
                            { name: 'GET', value: 45, fill: '#4caf50' },
                            { name: 'POST', value: 30, fill: '#2196f3' },
                            { name: 'PUT', value: 15, fill: '#ff9800' },
                            { name: 'DELETE', value: 10, fill: '#f44336' },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </TabPanel>

        {/* Documentation Tab */}
        <TabPanel value={selectedTab} index={3}>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 66%', minWidth: '400px' }}>
              <Card>
                <CardHeader title="API Documentation" />
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Getting Started
                  </Typography>
                  <Typography paragraph>
                    Welcome to the API Integration Manager. This tool helps you manage and test
                    API integrations across your testing framework.
                  </Typography>
                  
                  <Typography variant="h6" gutterBottom>
                    Authentication
                  </Typography>
                  <Typography paragraph>
                    All API requests require authentication. Supported methods include:
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon><KeyIcon /></ListItemIcon>
                      <ListItemText primary="API Key" secondary="Include API key in headers" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><LockIcon /></ListItemIcon>
                      <ListItemText primary="Bearer Token" secondary="JWT tokens in Authorization header" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><SecurityIcon /></ListItemIcon>
                      <ListItemText primary="OAuth 2.0" secondary="OAuth 2.0 flow for third-party services" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 33%', minWidth: '300px' }}>
              <Card>
                <CardHeader title="Quick Actions" />
                <CardContent>
                  <List>
                    <ListItem sx={{ cursor: 'pointer' }}>
                      <ListItemIcon><AddIcon /></ListItemIcon>
                      <ListItemText primary="Create Integration" />
                    </ListItem>
                    <ListItem sx={{ cursor: 'pointer' }}>
                      <ListItemIcon><TestIcon /></ListItemIcon>
                      <ListItemText primary="Test All Endpoints" />
                    </ListItem>
                    <ListItem sx={{ cursor: 'pointer' }}>
                      <ListItemIcon><DownloadIcon /></ListItemIcon>
                      <ListItemText primary="Export Configuration" />
                    </ListItem>
                    <ListItem sx={{ cursor: 'pointer' }}>
                      <ListItemIcon><UploadIcon /></ListItemIcon>
                      <ListItemText primary="Import Configuration" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </TabPanel>

        {/* Dialog for Creating Integration */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {dialogType === 'integration' ? 'Create New Integration' : 'Create New Endpoint'}
          </DialogTitle>
          <DialogContent>
            {dialogType === 'integration' && (
              <Stepper activeStep={activeStep} orientation="vertical">
                {integrationSteps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                    <StepContent>
                      <Box sx={{ mb: 2 }}>
                        {index === 0 && (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ flex: '1 1 100%' }}>
                              <TextField
                                fullWidth
                                label="Integration Name"
                                placeholder="Enter integration name"
                              />
                            </Box>
                            <Box sx={{ flex: '1 1 100%' }}>
                              <TextField
                                fullWidth
                                label="Base URL"
                                placeholder="https://api.example.com"
                              />
                            </Box>
                            <Box sx={{ flex: '1 1 50%', minWidth: '250px' }}>
                              <FormControl fullWidth>
                                <InputLabel>Provider</InputLabel>
                                <Select defaultValue="">
                                  <MenuItem value="internal">Internal</MenuItem>
                                  <MenuItem value="stripe">Stripe</MenuItem>
                                  <MenuItem value="google">Google</MenuItem>
                                  <MenuItem value="other">Other</MenuItem>
                                </Select>
                              </FormControl>
                            </Box>
                            <Box sx={{ flex: '1 1 50%', minWidth: '250px' }}>
                              <FormControl fullWidth>
                                <InputLabel>Type</InputLabel>
                                <Select defaultValue="rest">
                                  <MenuItem value="rest">REST API</MenuItem>
                                  <MenuItem value="graphql">GraphQL</MenuItem>
                                  <MenuItem value="webhook">Webhook</MenuItem>
                                  <MenuItem value="websocket">WebSocket</MenuItem>
                                </Select>
                              </FormControl>
                            </Box>
                          </Box>
                        )}
                        {index === 1 && (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ flex: '1 1 100%' }}>
                              <FormControl fullWidth>
                                <InputLabel>Authentication Type</InputLabel>
                                <Select defaultValue="none">
                                  <MenuItem value="none">None</MenuItem>
                                  <MenuItem value="apikey">API Key</MenuItem>
                                  <MenuItem value="bearer">Bearer Token</MenuItem>
                                  <MenuItem value="basic">Basic Auth</MenuItem>
                                  <MenuItem value="oauth2">OAuth 2.0</MenuItem>
                                </Select>
                              </FormControl>
                            </Box>
                            <Box sx={{ flex: '1 1 100%' }}>
                              <TextField
                                fullWidth
                                label="API Key / Token"
                                type="password"
                                placeholder="Enter your API key or token"
                              />
                            </Box>
                          </Box>
                        )}
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Button
                          variant="contained"
                          onClick={() => setActiveStep(activeStep + 1)}
                          sx={{ mt: 1, mr: 1 }}
                          disabled={activeStep === integrationSteps.length - 1}
                        >
                          {activeStep === integrationSteps.length - 1 ? 'Finish' : 'Continue'}
                        </Button>
                        <Button
                          disabled={activeStep === 0}
                          onClick={() => setActiveStep(activeStep - 1)}
                          sx={{ mt: 1, mr: 1 }}
                        >
                          Back
                        </Button>
                      </Box>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="contained">Save</Button>
          </DialogActions>
        </Dialog>

        {/* Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => setAnchorEl(null)}>
            <EditIcon sx={{ mr: 1 }} />
            Edit Integration
          </MenuItem>
          <MenuItem onClick={() => setAnchorEl(null)}>
            <TestIcon sx={{ mr: 1 }} />
            Test Connection
          </MenuItem>
          <MenuItem onClick={() => setAnchorEl(null)}>
            <DeleteIcon sx={{ mr: 1 }} />
            Delete Integration
          </MenuItem>
        </Menu>
      </Box>
    </Container>
  );
};

export default APIIntegrationManager;
