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
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Tooltip,
  Badge,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Slider,
  Switch,
  FormControlLabel,
  Autocomplete
} from '@mui/material';
import {
  Assessment,
  TrendingUp,
  TrendingDown,
  BugReport,
  CheckCircle,
  Error,
  Warning,
  Schedule,
  Speed,
  Download,
  Share,
  FilterList,
  DateRange,
  ExpandMore,
  Visibility,
  Timeline,
  PieChart,
  BarChart,
  ShowChart,
  TableChart,
  Dashboard,
  Compare,
  History,
  Star,
  ThumbUp,
  ThumbDown,
  Refresh,
  Settings
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Scatter,
  ScatterChart
} from 'recharts';
import { format, subDays, subWeeks, subMonths } from 'date-fns';

interface TestExecution {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'skipped' | 'running';
  duration: number;
  timestamp: Date;
  browser: string;
  environment: string;
  issues: Issue[];
  screenshots: string[];
  coverage: number;
  performance_score: number;
}

interface Issue {
  id: string;
  type: 'error' | 'warning' | 'info';
  severity: 'critical' | 'major' | 'minor';
  message: string;
  element: string;
  screenshot?: string;
  stack_trace?: string;
}

interface TestSuite {
  id: string;
  name: string;
  executions: TestExecution[];
  success_rate: number;
  avg_duration: number;
  last_run: Date;
  trend: 'improving' | 'stable' | 'declining';
}

interface PerformanceMetric {
  timestamp: Date;
  response_time: number;
  memory_usage: number;
  cpu_usage: number;
  network_requests: number;
  errors: number;
}

const TestReporting: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedSuite, setSelectedSuite] = useState<string>('all');
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(false);
  const [openReport, setOpenReport] = useState(false);
  const [reportType, setReportType] = useState('summary');

  // Mock data
  useEffect(() => {
    const generateMockData = () => {
      const now = new Date();
      const mockPerformanceData: PerformanceMetric[] = [];
      
      for (let i = 30; i >= 0; i--) {
        mockPerformanceData.push({
          timestamp: subDays(now, i),
          response_time: 200 + Math.random() * 300,
          memory_usage: 60 + Math.random() * 40,
          cpu_usage: 30 + Math.random() * 50,
          network_requests: 15 + Math.random() * 10,
          errors: Math.floor(Math.random() * 5)
        });
      }

      const mockTestSuites: TestSuite[] = [
        {
          id: 'suite1',
          name: 'User Authentication',
          executions: [],
          success_rate: 94.5,
          avg_duration: 180,
          last_run: subDays(now, 1),
          trend: 'improving'
        },
        {
          id: 'suite2',
          name: 'Payment Processing',
          executions: [],
          success_rate: 87.2,
          avg_duration: 250,
          last_run: subDays(now, 2),
          trend: 'stable'
        },
        {
          id: 'suite3',
          name: 'Product Catalog',
          executions: [],
          success_rate: 78.9,
          avg_duration: 320,
          last_run: subDays(now, 3),
          trend: 'declining'
        }
      ];

      setPerformanceData(mockPerformanceData);
      setTestSuites(mockTestSuites);
    };

    generateMockData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp color="success" />;
      case 'declining': return <TrendingDown color="error" />;
      default: return <Timeline color="info" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'success';
      case 'failed': return 'error';
      case 'skipped': return 'warning';
      default: return 'info';
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

  // Summary Dashboard Tab
  const SummaryTab = () => {
    const totalTests = testSuites.reduce((acc, suite) => acc + suite.executions.length, 0);
    const avgSuccessRate = testSuites.reduce((acc, suite) => acc + suite.success_rate, 0) / testSuites.length;
    const totalIssues = 42; // Mock data
    const criticalIssues = 3; // Mock data

    const successRateData = performanceData.slice(-7).map((data, index) => ({
      date: format(data.timestamp, 'MMM dd'),
      success_rate: 85 + Math.random() * 15,
      total_tests: 20 + Math.floor(Math.random() * 10)
    }));

    const issueDistribution = [
      { name: 'Passed', value: Math.floor(avgSuccessRate), color: '#4caf50' },
      { name: 'Failed', value: Math.floor(100 - avgSuccessRate), color: '#f44336' }
    ];

    return (
      <Box>
        {/* Key Metrics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <Assessment />
                  </Avatar>
                  <Box>
                    <Typography variant="h4">{totalTests}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Tests
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUp color="success" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="success.main">
                    +12% from last week
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                    <CheckCircle />
                  </Avatar>
                  <Box>
                    <Typography variant="h4">{avgSuccessRate.toFixed(1)}%</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Success Rate
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={avgSuccessRate}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                    <BugReport />
                  </Avatar>
                  <Box>
                    <Typography variant="h4">{totalIssues}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Issues
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={`${criticalIssues} Critical`}
                  color="error"
                  size="small"
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                    <Speed />
                  </Avatar>
                  <Box>
                    <Typography variant="h4">2.3s</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Duration
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingDown color="error" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="error.main">
                    +0.2s slower
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Success Rate Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={successRateData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="success_rate"
                    stroke="#8884d8"
                    strokeWidth={2}
                    name="Success Rate (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Test Results Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <pie
                    data={issueDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {issueDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </pie>
                  <RechartsTooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* Test Suites Summary */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Test Suites Overview
          </Typography>
          <Grid container spacing={2}>
            {testSuites.map((suite) => (
              <Grid item xs={12} md={4} key={suite.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" component="div">
                        {suite.name}
                      </Typography>
                      {getTrendIcon(suite.trend)}
                    </Box>
                    <Typography variant="h4" color="primary" gutterBottom>
                      {suite.success_rate.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Duration: {formatDuration(suite.avg_duration)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Last Run: {format(suite.last_run, 'MMM dd, HH:mm')}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={suite.success_rate}
                      sx={{ mt: 2, height: 6, borderRadius: 3 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    );
  };

  // Performance Tab
  const PerformanceTab = () => (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Response Time Trends
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceData.slice(-14)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                />
                <YAxis />
                <RechartsTooltip
                  labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                  formatter={(value) => [`${value}ms`, 'Response Time']}
                />
                <Area
                  type="monotone"
                  dataKey="response_time"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Resource Usage
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={performanceData.slice(-14)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                />
                <YAxis />
                <RechartsTooltip
                  labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="memory_usage"
                  fill="#82ca9d"
                  stroke="#82ca9d"
                  fillOpacity={0.3}
                  name="Memory Usage (%)"
                />
                <Line
                  type="monotone"
                  dataKey="cpu_usage"
                  stroke="#ff7300"
                  strokeWidth={2}
                  name="CPU Usage (%)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Error Distribution Over Time
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={performanceData.slice(-14)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                />
                <YAxis />
                <RechartsTooltip
                  labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                  formatter={(value) => [value, 'Errors']}
                />
                <Bar dataKey="errors" fill="#f44336" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  // Issues Tab
  const IssuesTab = () => {
    const mockIssues = [
      {
        id: '1',
        type: 'error' as const,
        severity: 'critical' as const,
        message: 'Login form validation failed',
        element: '#login-form',
        count: 15,
        first_seen: subDays(new Date(), 3),
        last_seen: new Date()
      },
      {
        id: '2',
        type: 'warning' as const,
        severity: 'major' as const,
        message: 'Slow page load detected',
        element: '.product-grid',
        count: 8,
        first_seen: subDays(new Date(), 5),
        last_seen: subDays(new Date(), 1)
      },
      {
        id: '3',
        type: 'info' as const,
        severity: 'minor' as const,
        message: 'Accessibility warning: Missing alt text',
        element: 'img.product-image',
        count: 23,
        first_seen: subWeeks(new Date(), 2),
        last_seen: new Date()
      }
    ];

    const getIssueIcon = (type: string) => {
      switch (type) {
        case 'error': return <Error color="error" />;
        case 'warning': return <Warning color="warning" />;
        default: return <Info color="info" />;
      }
    };

    const getSeverityChip = (severity: string) => {
      const colors = {
        critical: 'error' as const,
        major: 'warning' as const,
        minor: 'info' as const
      };
      return (
        <Chip
          label={severity.toUpperCase()}
          color={colors[severity as keyof typeof colors]}
          size="small"
        />
      );
    };

    return (
      <Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Issue</TableCell>
                <TableCell>Severity</TableCell>
                <TableCell>Element</TableCell>
                <TableCell align="right">Count</TableCell>
                <TableCell>First Seen</TableCell>
                <TableCell>Last Seen</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockIssues.map((issue) => (
                <TableRow key={issue.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getIssueIcon(issue.type)}
                      <Typography sx={{ ml: 1 }}>{issue.message}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{getSeverityChip(issue.severity)}</TableCell>
                  <TableCell>
                    <code style={{ background: '#f5f5f5', padding: '2px 4px', borderRadius: '3px' }}>
                      {issue.element}
                    </code>
                  </TableCell>
                  <TableCell align="right">
                    <Badge badgeContent={issue.count} color="error">
                      <BugReport />
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(issue.first_seen, 'MMM dd, HH:mm')}
                  </TableCell>
                  <TableCell>
                    {format(issue.last_seen, 'MMM dd, HH:mm')}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton size="small">
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Mark as Resolved">
                      <IconButton size="small">
                        <CheckCircle />
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

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Test Reporting & Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive test results analysis, performance metrics, and issue tracking
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="1d">Last Day</MenuItem>
              <MenuItem value="7d">Last Week</MenuItem>
              <MenuItem value="30d">Last Month</MenuItem>
              <MenuItem value="90d">Last Quarter</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={() => setOpenReport(true)}
          >
            Export Report
          </Button>
          <Button
            variant="outlined"
            startIcon={<Share />}
          >
            Share
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => setLoading(true)}
            disabled={loading}
          >
            Refresh
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
          <Tab label="Summary" icon={<Dashboard />} />
          <Tab label="Performance" icon={<Speed />} />
          <Tab label="Issues" icon={<BugReport />} />
          <Tab label="Trends" icon={<TrendingUp />} />
          <Tab label="Comparisons" icon={<Compare />} />
        </Tabs>
      </Paper>

      <Box sx={{ mt: 3 }}>
        {tabValue === 0 && <SummaryTab />}
        {tabValue === 1 && <PerformanceTab />}
        {tabValue === 2 && <IssuesTab />}
        {tabValue === 3 && (
          <Alert severity="info">
            Trends Analysis - Coming soon! Historical trend analysis with predictive insights.
          </Alert>
        )}
        {tabValue === 4 && (
          <Alert severity="info">
            Comparisons - Coming soon! Compare test results across different time periods, environments, and configurations.
          </Alert>
        )}
      </Box>

      {/* Export Report Dialog */}
      <Dialog
        open={openReport}
        onClose={() => setOpenReport(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Export Test Report</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <MenuItem value="summary">Executive Summary</MenuItem>
                <MenuItem value="detailed">Detailed Analysis</MenuItem>
                <MenuItem value="performance">Performance Report</MenuItem>
                <MenuItem value="issues">Issues Report</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Format</InputLabel>
              <Select defaultValue="pdf">
                <MenuItem value="pdf">PDF</MenuItem>
                <MenuItem value="excel">Excel</MenuItem>
                <MenuItem value="csv">CSV</MenuItem>
                <MenuItem value="json">JSON</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Include screenshots"
            />
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Include performance metrics"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReport(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<Download />}>
            Generate Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TestReporting;
