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
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  LinearProgress,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  BugReport as BugReportIcon,
  Timeline as TimelineIcon,
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

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  status: 'good' | 'warning' | 'critical';
  threshold: {
    warning: number;
    critical: number;
  };
  history: Array<{
    timestamp: string;
    value: number;
  }>;
}

interface TestPerformanceData {
  testId: string;
  testName: string;
  url: string;
  timestamp: string;
  metrics: {
    loadTime: number;
    timeToFirstByte: number;
    timeToInteractive: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    firstInputDelay: number;
  };
  resourceMetrics: {
    totalRequests: number;
    totalSize: number;
    cacheHitRate: number;
    errorRate: number;
  };
  performanceScore: number;
  status: 'passed' | 'failed' | 'warning';
}

export interface AlertRule {
  // Future use interface for performance alerts
  id: string;
  name: string;
  metric: string;
  operator: '>' | '<' | '=' | '>=' | '<=';
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  notifications: string[];
}

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [testResults, setTestResults] = useState<TestPerformanceData[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const timeRanges = [
    { value: '15m', label: '15 minutes' },
    { value: '1h', label: '1 hour' },
    { value: '6h', label: '6 hours' },
    { value: '24h', label: '24 hours' },
    { value: '7d', label: '7 days' },
    { value: '30d', label: '30 days' },
  ];

  const generateMockMetrics = (): PerformanceMetric[] => {
    return [
      {
        id: 'response_time',
        name: 'Average Response Time',
        value: 245,
        unit: 'ms',
        trend: 'down',
        trendValue: -12,
        status: 'good',
        threshold: { warning: 500, critical: 1000 },
        history: Array.from({ length: 24 }, (_, i) => ({
          timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
          value: Math.random() * 200 + 200,
        })),
      },
      {
        id: 'throughput',
        name: 'Requests per Second',
        value: 1250,
        unit: 'req/s',
        trend: 'up',
        trendValue: 8,
        status: 'good',
        threshold: { warning: 800, critical: 500 },
        history: Array.from({ length: 24 }, (_, i) => ({
          timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
          value: Math.random() * 300 + 1000,
        })),
      },
      {
        id: 'error_rate',
        name: 'Error Rate',
        value: 2.4,
        unit: '%',
        trend: 'up',
        trendValue: 0.8,
        status: 'warning',
        threshold: { warning: 2, critical: 5 },
        history: Array.from({ length: 24 }, (_, i) => ({
          timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
          value: Math.random() * 3 + 1,
        })),
      },
      {
        id: 'cpu_usage',
        name: 'CPU Usage',
        value: 68,
        unit: '%',
        trend: 'stable',
        trendValue: 0,
        status: 'warning',
        threshold: { warning: 70, critical: 90 },
        history: Array.from({ length: 24 }, (_, i) => ({
          timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
          value: Math.random() * 30 + 50,
        })),
      },
      {
        id: 'memory_usage',
        name: 'Memory Usage',
        value: 4.2,
        unit: 'GB',
        trend: 'up',
        trendValue: 5,
        status: 'good',
        threshold: { warning: 6, critical: 8 },
        history: Array.from({ length: 24 }, (_, i) => ({
          timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
          value: Math.random() * 2 + 3,
        })),
      },
      {
        id: 'network_latency',
        name: 'Network Latency',
        value: 45,
        unit: 'ms',
        trend: 'down',
        trendValue: -3,
        status: 'good',
        threshold: { warning: 100, critical: 200 },
        history: Array.from({ length: 24 }, (_, i) => ({
          timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
          value: Math.random() * 50 + 30,
        })),
      },
    ];
  };

  const generateMockTestResults = (): TestPerformanceData[] => {
    const testNames = [
      'Login Flow Test',
      'Checkout Process Test',
      'Search Functionality Test',
      'Product Page Load Test',
      'User Registration Test',
      'Dashboard Load Test',
      'Mobile Navigation Test',
      'Form Submission Test',
    ];

    return Array.from({ length: 50 }, (_, i) => ({
      testId: `test_${i + 1}`,
      testName: testNames[Math.floor(Math.random() * testNames.length)],
      url: `https://example.com/page${Math.floor(Math.random() * 10) + 1}`,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      metrics: {
        loadTime: Math.random() * 3000 + 1000,
        timeToFirstByte: Math.random() * 500 + 100,
        timeToInteractive: Math.random() * 2000 + 1500,
        largestContentfulPaint: Math.random() * 2500 + 1000,
        cumulativeLayoutShift: Math.random() * 0.1,
        firstInputDelay: Math.random() * 100 + 50,
      },
      resourceMetrics: {
        totalRequests: Math.floor(Math.random() * 50) + 20,
        totalSize: Math.random() * 2000 + 500,
        cacheHitRate: Math.random() * 30 + 70,
        errorRate: Math.random() * 5,
      },
      performanceScore: Math.floor(Math.random() * 40) + 60,
      status: ['passed', 'failed', 'warning'][Math.floor(Math.random() * 3)] as 'passed' | 'failed' | 'warning',
    }));
  };

  useEffect(() => {
    setMetrics(generateMockMetrics());
    setTestResults(generateMockTestResults());

    // Auto-refresh interval
    if (autoRefresh) {
      const interval = setInterval(() => {
        setMetrics(generateMockMetrics());
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
      case 'passed':
        return 'success';
      case 'warning':
        return 'warning';
      case 'critical':
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
      case 'passed':
        return <CheckCircleIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'critical':
      case 'failed':
        return <ErrorIcon color="error" />;
      default:
        return <CheckCircleIcon />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon color="success" />;
      case 'down':
        return <TrendingDownIcon color="error" />;
      default:
        return <></>;
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setMetrics(generateMockMetrics());
      setTestResults(generateMockTestResults());
      setLoading(false);
    }, 1000);
  };

  const filteredTestResults = testResults.filter(result => 
    filterStatus === 'all' || result.status === filterStatus
  );

  const paginatedResults = filteredTestResults.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Performance Monitor
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                label="Time Range"
              >
                {timeRanges.map((range) => (
                  <MenuItem key={range.value} value={range.value}>
                    {range.label}
                  </MenuItem>
                ))}
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
              onClick={handleRefresh}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
            >
              Refresh
            </Button>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem onClick={() => setAnchorEl(null)}>
                <DownloadIcon sx={{ mr: 1 }} />
                Export Data
              </MenuItem>
              <MenuItem onClick={() => setAnchorEl(null)}>
                <VisibilityIcon sx={{ mr: 1 }} />
                Configure View
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* Performance Metrics Overview */}
        <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
          {metrics.map((metric) => (
            <Box key={metric.id} sx={{ flex: '1 1 15%', minWidth: '200px' }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography color="textSecondary" variant="caption" display="block">
                        {metric.name}
                      </Typography>
                      <Typography variant="h5" component="div" fontWeight="bold">
                        {metric.value.toLocaleString()} {metric.unit}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      color={getStatusColor(metric.status) as any}
                      label={metric.status.toUpperCase()}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getTrendIcon(metric.trend)}
                      <Typography
                        variant="body2"
                        color={metric.trend === 'up' ? 'success.main' : metric.trend === 'down' ? 'error.main' : 'textSecondary'}
                        sx={{ ml: 0.5 }}
                      >
                        {metric.trendValue > 0 ? '+' : ''}{metric.trendValue}%
                      </Typography>
                    </Box>
                    {getStatusIcon(metric.status)}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>

        {/* Performance Charts */}
        <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '2 1 65%', minWidth: '400px' }}>
            <Card>
              <CardHeader title="Performance Trends" />
              <CardContent>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics[0]?.history || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="timestamp" 
                        tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                      />
                      <YAxis />
                      <RechartsTooltip
                        labelFormatter={(value) => new Date(value).toLocaleString()}
                        formatter={(value: any) => [`${value.toFixed(0)} ms`, 'Response Time']}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#1976d2"
                        strokeWidth={2}
                        dot={false}
                        name="Response Time"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 30%', minWidth: '300px' }}>
            <Card>
              <CardHeader title="Performance Distribution" />
              <CardContent>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Excellent', value: 35, fill: '#4caf50' },
                          { name: 'Good', value: 45, fill: '#2196f3' },
                          { name: 'Needs Improvement', value: 15, fill: '#ff9800' },
                          { name: 'Poor', value: 5, fill: '#f44336' },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent! * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: 'Excellent', value: 35, fill: '#4caf50' },
                          { name: 'Good', value: 45, fill: '#2196f3' },
                          { name: 'Needs Improvement', value: 15, fill: '#ff9800' },
                          { name: 'Poor', value: 5, fill: '#f44336' },
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

        {/* Test Results Table */}
        <Card>
          <CardHeader 
            title="Recent Test Results"
            action={
              <Box sx={{ display: 'flex', gap: 1 }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Filter Status</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Filter Status"
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="passed">Passed</MenuItem>
                    <MenuItem value="failed">Failed</MenuItem>
                    <MenuItem value="warning">Warning</MenuItem>
                  </Select>
                </FormControl>
                <IconButton>
                  <FilterIcon />
                </IconButton>
              </Box>
            }
          />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Test Name</TableCell>
                  <TableCell>URL</TableCell>
                  <TableCell>Load Time</TableCell>
                  <TableCell>Performance Score</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedResults.map((result) => (
                  <TableRow key={result.testId} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {result.testName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {result.url}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {result.metrics.loadTime.toFixed(0)}ms
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={result.performanceScore}
                          sx={{ width: 60, height: 8, borderRadius: 4 }}
                          color={
                            result.performanceScore >= 80 ? 'success' :
                            result.performanceScore >= 60 ? 'warning' : 'error'
                          }
                        />
                        <Typography variant="body2">
                          {result.performanceScore}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={getStatusColor(result.status) as any}
                        label={result.status.toUpperCase()}
                        icon={getStatusIcon(result.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {new Date(result.timestamp).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Timeline">
                          <IconButton size="small">
                            <TimelineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Debug">
                          <IconButton size="small">
                            <BugReportIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={filteredTestResults.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Card>
      </Box>
    </Container>
  );
};

export default PerformanceMonitor;
