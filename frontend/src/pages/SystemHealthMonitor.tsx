import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Stack,
  IconButton,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Badge,
  Avatar
} from '@mui/material';
import {
  HealthAndSafety,
  Monitor,
  Speed,
  Storage,
  Memory,
  NetworkCheck,
  Security,
  Api,
  CheckCircle,
  Error,
  Warning,
  Info,
  Refresh,
  Settings,
  Notifications,
  TrendingUp,
  TrendingDown,
  Timeline,
  Computer,
  Cloud,
  Router,
  Dns,
  Https,
  VpnKey,
  Schedule,
  History,
  BugReport,
  Assessment,
  AutoAwesome,
  DataUsage,
  PowerSettingsNew,
  SignalWifiConnectedNoInternet4
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format, subMinutes, subHours } from 'date-fns';

interface SystemHealth {
  overall_status: 'healthy' | 'warning' | 'critical' | 'unknown';
  overall_score: number;
  components: HealthComponent[];
  metrics: SystemMetrics;
  alerts: SystemAlert[];
  last_updated: Date;
}

interface HealthComponent {
  id: string;
  name: string;
  type: 'service' | 'database' | 'api' | 'infrastructure' | 'external';
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  response_time: number;
  uptime: number;
  last_check: Date;
  details: {
    version?: string;
    memory_usage?: number;
    cpu_usage?: number;
    error_rate?: number;
    throughput?: number;
  };
  dependencies: string[];
}

interface SystemMetrics {
  timestamp: Date;
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_in: number;
  network_out: number;
  active_connections: number;
  requests_per_minute: number;
  error_rate: number;
  response_time_avg: number;
}

interface SystemAlert {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  component?: string;
  timestamp: Date;
  acknowledged: boolean;
  resolved: boolean;
}

const SystemHealthMonitor: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [metricsHistory, setMetricsHistory] = useState<SystemMetrics[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');

  // Mock data generation
  useEffect(() => {
    const generateMockData = () => {
      const now = new Date();
      
      // Generate metrics history
      const history: SystemMetrics[] = [];
      for (let i = 60; i >= 0; i--) {
        history.push({
          timestamp: subMinutes(now, i),
          cpu_usage: 30 + Math.random() * 40,
          memory_usage: 50 + Math.random() * 30,
          disk_usage: 60 + Math.random() * 20,
          network_in: 100 + Math.random() * 200,
          network_out: 80 + Math.random() * 150,
          active_connections: 50 + Math.floor(Math.random() * 100),
          requests_per_minute: 1000 + Math.floor(Math.random() * 2000),
          error_rate: Math.random() * 5,
          response_time_avg: 150 + Math.random() * 100
        });
      }

      const mockComponents: HealthComponent[] = [
        {
          id: 'web-server',
          name: 'Web Server',
          type: 'service',
          status: 'healthy',
          response_time: 45,
          uptime: 99.9,
          last_check: now,
          details: {
            version: 'nginx/1.21.6',
            memory_usage: 15,
            cpu_usage: 8,
            error_rate: 0.1,
            throughput: 1250
          },
          dependencies: ['database', 'api-gateway']
        },
        {
          id: 'database',
          name: 'PostgreSQL Database',
          type: 'database',
          status: 'healthy',
          response_time: 12,
          uptime: 99.95,
          last_check: now,
          details: {
            version: 'PostgreSQL 14.5',
            memory_usage: 45,
            cpu_usage: 15,
            error_rate: 0.05
          },
          dependencies: []
        },
        {
          id: 'api-gateway',
          name: 'API Gateway',
          type: 'api',
          status: 'warning',
          response_time: 180,
          uptime: 98.5,
          last_check: now,
          details: {
            version: 'Kong 3.0',
            memory_usage: 25,
            cpu_usage: 35,
            error_rate: 2.5,
            throughput: 850
          },
          dependencies: ['auth-service']
        },
        {
          id: 'auth-service',
          name: 'Authentication Service',
          type: 'service',
          status: 'healthy',
          response_time: 95,
          uptime: 99.8,
          last_check: now,
          details: {
            version: 'Auth v2.1.4',
            memory_usage: 20,
            cpu_usage: 12,
            error_rate: 0.2
          },
          dependencies: ['database']
        },
        {
          id: 'redis-cache',
          name: 'Redis Cache',
          type: 'database',
          status: 'healthy',
          response_time: 3,
          uptime: 99.99,
          last_check: now,
          details: {
            version: 'Redis 7.0.5',
            memory_usage: 35,
            cpu_usage: 5,
            error_rate: 0.01
          },
          dependencies: []
        },
        {
          id: 'test-runner',
          name: 'Test Execution Engine',
          type: 'service',
          status: 'healthy',
          response_time: 250,
          uptime: 99.2,
          last_check: now,
          details: {
            version: 'TestRunner v1.8.2',
            memory_usage: 60,
            cpu_usage: 25,
            error_rate: 1.2
          },
          dependencies: ['database', 'web-server']
        },
        {
          id: 'cdn',
          name: 'Content Delivery Network',
          type: 'external',
          status: 'healthy',
          response_time: 65,
          uptime: 99.7,
          last_check: now,
          details: {
            version: 'CloudFlare',
            error_rate: 0.3
          },
          dependencies: []
        }
      ];

      const mockAlerts: SystemAlert[] = [
        {
          id: 'alert1',
          severity: 'warning',
          title: 'High Response Time',
          message: 'API Gateway response time has exceeded 150ms threshold',
          component: 'api-gateway',
          timestamp: subMinutes(now, 15),
          acknowledged: false,
          resolved: false
        },
        {
          id: 'alert2',
          severity: 'info',
          title: 'Scheduled Maintenance',
          message: 'Database maintenance window scheduled for next Sunday 2:00 AM',
          component: 'database',
          timestamp: subHours(now, 2),
          acknowledged: true,
          resolved: false
        },
        {
          id: 'alert3',
          severity: 'error',
          title: 'Service Restart',
          message: 'Test execution service was automatically restarted due to memory leak',
          component: 'test-runner',
          timestamp: subHours(now, 6),
          acknowledged: true,
          resolved: true
        }
      ];

      const mockHealth: SystemHealth = {
        overall_status: 'warning',
        overall_score: 92.5,
        components: mockComponents,
        metrics: history[history.length - 1],
        alerts: mockAlerts,
        last_updated: now
      };

      setSystemHealth(mockHealth);
      setMetricsHistory(history);
    };

    generateMockData();

    // Auto-refresh
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(generateMockData, refreshInterval * 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      case 'unknown': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle color="success" />;
      case 'warning': return <Warning color="warning" />;
      case 'critical': return <Error color="error" />;
      case 'unknown': return <Info color="disabled" />;
      default: return <Info />;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'info': return <Info color="info" />;
      case 'warning': return <Warning color="warning" />;
      case 'error': return <Error color="error" />;
      case 'critical': return <BugReport color="error" />;
      default: return <Info />;
    }
  };

  const getComponentTypeIcon = (type: string) => {
    switch (type) {
      case 'service': return <Computer />;
      case 'database': return <Storage />;
      case 'api': return <Api />;
      case 'infrastructure': return <Router />;
      case 'external': return <Cloud />;
      default: return <Computer />;
    }
  };

  // Overview Tab
  const OverviewTab = () => (
    <Box>
      {/* System Status Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: systemHealth?.overall_status === 'healthy' ? 'success.main' : 
                             systemHealth?.overall_status === 'warning' ? 'warning.main' : 'error.main',
                    mr: 2
                  }}
                >
                  <HealthAndSafety />
                </Avatar>
                <Box>
                  <Typography variant="h4">
                    {systemHealth?.overall_score.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    System Health
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={systemHealth?.overall_status.toUpperCase()}
                color={getStatusColor(systemHealth?.overall_status || 'unknown')}
                size="small"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <Monitor />
                </Avatar>
                <Box>
                  <Typography variant="h4">
                    {systemHealth?.components.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Components
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="success.main">
                {systemHealth?.components.filter(c => c.status === 'healthy').length} Healthy
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <Speed />
                </Avatar>
                <Box>
                  <Typography variant="h4">
                    {systemHealth?.metrics.response_time_avg.toFixed(0)}ms
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Response
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="success.main">
                -15ms from last hour
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <Notifications />
                </Avatar>
                <Box>
                  <Typography variant="h4">
                    {systemHealth?.alerts.filter(a => !a.acknowledged).length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Alerts
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="warning.main">
                {systemHealth?.alerts.filter(a => a.severity === 'critical').length} Critical
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* System Metrics Chart */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Performance Metrics
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metricsHistory.slice(-30)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value) => format(new Date(value), 'HH:mm')}
                />
                <YAxis />
                <RechartsTooltip
                  labelFormatter={(value) => format(new Date(value), 'HH:mm:ss')}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cpu_usage"
                  stroke="#8884d8"
                  name="CPU Usage (%)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="memory_usage"
                  stroke="#82ca9d"
                  name="Memory Usage (%)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="response_time_avg"
                  stroke="#ffc658"
                  name="Response Time (ms)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Component Status
            </Typography>
            <List>
              {systemHealth?.components.slice(0, 6).map((component) => (
                <ListItem key={component.id} sx={{ px: 0 }}>
                  <ListItemIcon>
                    {getComponentTypeIcon(component.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={component.name}
                    secondary={`${component.response_time}ms • ${component.uptime}% uptime`}
                  />
                  {getStatusIcon(component.status)}
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Alerts */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Recent Alerts
        </Typography>
        <List>
          {systemHealth?.alerts.slice(0, 5).map((alert) => (
            <React.Fragment key={alert.id}>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  {getSeverityIcon(alert.severity)}
                </ListItemIcon>
                <ListItemText
                  primary={alert.title}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {alert.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(alert.timestamp, 'MMM dd, HH:mm')} • {alert.component}
                      </Typography>
                    </Box>
                  }
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {alert.acknowledged && (
                    <Chip label="Acknowledged" size="small" color="info" />
                  )}
                  {alert.resolved && (
                    <Chip label="Resolved" size="small" color="success" />
                  )}
                </Box>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );

  // Components Tab
  const ComponentsTab = () => (
    <Box>
      <Grid container spacing={3}>
        {systemHealth?.components.map((component) => (
          <Grid item xs={12} md={6} lg={4} key={component.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getComponentTypeIcon(component.type)}
                    <Box sx={{ ml: 1 }}>
                      <Typography variant="h6">
                        {component.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {component.type.toUpperCase()}
                      </Typography>
                    </Box>
                  </Box>
                  {getStatusIcon(component.status)}
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Response Time
                      </Typography>
                      <Typography variant="h6">
                        {component.response_time}ms
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Uptime
                      </Typography>
                      <Typography variant="h6">
                        {component.uptime}%
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                {component.details.version && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Version: {component.details.version}
                  </Typography>
                )}

                <Box sx={{ mt: 2 }}>
                  {component.details.memory_usage && (
                    <Box sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Memory</Typography>
                        <Typography variant="body2">{component.details.memory_usage}%</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={component.details.memory_usage}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  )}

                  {component.details.cpu_usage && (
                    <Box sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">CPU</Typography>
                        <Typography variant="body2">{component.details.cpu_usage}%</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={component.details.cpu_usage}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  )}

                  {component.details.error_rate !== undefined && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Error Rate</Typography>
                      <Typography variant="body2" color={component.details.error_rate > 1 ? 'error' : 'success.main'}>
                        {component.details.error_rate.toFixed(2)}%
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  Last checked: {format(component.last_check, 'HH:mm:ss')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  // Alerts Tab
  const AlertsTab = () => (
    <Box>
      <List>
        {systemHealth?.alerts.map((alert) => (
          <React.Fragment key={alert.id}>
            <ListItem sx={{ px: 0, py: 2 }}>
              <ListItemIcon>
                {getSeverityIcon(alert.severity)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1">{alert.title}</Typography>
                    <Chip
                      label={alert.severity.toUpperCase()}
                      size="small"
                      color={
                        alert.severity === 'critical' ? 'error' :
                        alert.severity === 'error' ? 'error' :
                        alert.severity === 'warning' ? 'warning' : 'info'
                      }
                    />
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {alert.message}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        {format(alert.timestamp, 'MMM dd, yyyy HH:mm')} • Component: {alert.component}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {!alert.acknowledged && (
                          <Button size="small" variant="outlined">
                            Acknowledge
                          </Button>
                        )}
                        {!alert.resolved && alert.acknowledged && (
                          <Button size="small" variant="contained">
                            Resolve
                          </Button>
                        )}
                        {alert.acknowledged && (
                          <Chip label="Acknowledged" size="small" color="info" />
                        )}
                        {alert.resolved && (
                          <Chip label="Resolved" size="small" color="success" />
                        )}
                      </Box>
                    </Box>
                  </Box>
                }
              />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            System Health Monitor
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Real-time monitoring and health status of all system components
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
            >
              <MenuItem value="15m">Last 15 minutes</MenuItem>
              <MenuItem value="1h">Last hour</MenuItem>
              <MenuItem value="6h">Last 6 hours</MenuItem>
              <MenuItem value="24h">Last 24 hours</MenuItem>
            </Select>
          </FormControl>
          
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
            }
            label="Auto Refresh"
          />
          
          <Button
            variant="outlined"
            startIcon={loading ? <CircularProgress size={16} /> : <Refresh />}
            onClick={() => setLoading(true)}
            disabled={loading}
          >
            Refresh
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<Settings />}
          >
            Settings
          </Button>
        </Box>
      </Box>

      {systemHealth?.overall_status === 'critical' && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle1">Critical System Issues Detected</Typography>
          Multiple components are experiencing problems. Immediate attention required.
        </Alert>
      )}

      {systemHealth?.overall_status === 'warning' && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle1">System Performance Degraded</Typography>
          Some components are experiencing issues. Monitor closely.
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Overview" icon={<Assessment />} />
          <Tab label="Components" icon={<Computer />} />
          <Tab label="Alerts" icon={<Notifications />} />
          <Tab label="Performance" icon={<TrendingUp />} />
        </Tabs>
      </Paper>

      <Box sx={{ mt: 3 }}>
        {tabValue === 0 && <OverviewTab />}
        {tabValue === 1 && <ComponentsTab />}
        {tabValue === 2 && <AlertsTab />}
        {tabValue === 3 && (
          <Alert severity="info">
            Performance Analysis - Coming soon! Detailed performance metrics and trend analysis.
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default SystemHealthMonitor;
