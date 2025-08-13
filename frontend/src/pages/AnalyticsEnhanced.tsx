import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  Refresh,
  Download,
  BarChart,
  PieChart,
  ShowChart,
  BugReport,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';

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
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const COLORS = ['#1976d2', '#dc004e', '#2e7d32', '#ed6c02', '#9c27b0'];

const AnalyticsEnhanced: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [currentTab, setCurrentTab] = useState(0);

  // Fetch analytics data
  const { isLoading: analyticsLoading, refetch } = useQuery({
    queryKey: ['analytics', timeRange],
    queryFn: () => apiService.getGlobalAnalytics(),
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch performance metrics
  const { isLoading: performanceLoading } = useQuery({
    queryKey: ['performance', timeRange],
    queryFn: () => apiService.getPerformanceMetrics(),
    refetchInterval: 60000,
  });

  // Mock data for enhanced charts
  const testTrendData = [
    { date: '2024-12-01', passed: 45, failed: 5, total: 50 },
    { date: '2024-12-02', passed: 52, failed: 3, total: 55 },
    { date: '2024-12-03', passed: 48, failed: 7, total: 55 },
    { date: '2024-12-04', passed: 60, failed: 2, total: 62 },
    { date: '2024-12-05', passed: 58, failed: 4, total: 62 },
    { date: '2024-12-06', passed: 65, failed: 1, total: 66 },
    { date: '2024-12-07', passed: 72, failed: 3, total: 75 },
  ];

  const browserDistribution = [
    { name: 'Chrome', value: 65, count: 156 },
    { name: 'Firefox', value: 20, count: 48 },
    { name: 'Safari', value: 10, count: 24 },
    { name: 'Edge', value: 5, count: 12 },
  ];

  const performanceData = [
    { metric: 'Average Response Time', value: '2.3s', trend: 'down', color: 'success' },
    { metric: 'Page Load Time', value: '1.8s', trend: 'up', color: 'warning' },
    { metric: 'Test Execution Time', value: '45s', trend: 'down', color: 'success' },
    { metric: 'Error Rate', value: '3.2%', trend: 'down', color: 'success' },
  ];

  const recentFailures = [
    {
      test_id: 'T001',
      url: 'https://example.com/form1',
      error: 'Element not found: #submit-btn',
      timestamp: '2024-12-07 14:30:00',
      status: 'failed'
    },
    {
      test_id: 'T002',
      url: 'https://example.com/form2',
      error: 'Timeout waiting for element',
      timestamp: '2024-12-07 13:15:00',
      status: 'failed'
    },
    {
      test_id: 'T003',
      url: 'https://example.com/form3',
      error: 'Network error',
      timestamp: '2024-12-07 12:45:00',
      status: 'error'
    },
  ];

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Advanced Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive insights into your UI testing performance
          </Typography>
        </Box>
        
        <Box display="flex" gap={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Time Range"
            >
              <MenuItem value="1d">Last 24h</MenuItem>
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="30d">Last 30 days</MenuItem>
              <MenuItem value="90d">Last 90 days</MenuItem>
            </Select>
          </FormControl>
          
          <Tooltip title="Refresh Data">
            <IconButton onClick={() => refetch()}>
              <Refresh />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Export Data">
            <IconButton>
              <Download />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Key Metrics Cards */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 4 }}>
        {performanceData.map((metric, index) => (
          <Box key={index} sx={{ flex: '1 1 25%', minWidth: '250px' }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="between">
                  <Box>
                    <Typography variant="h4" color={metric.color}>
                      {metric.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {metric.metric}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: metric.trend === 'up' ? 'error.main' : 'success.main',
                      width: 40,
                      height: 40
                    }}
                  >
                    {metric.trend === 'up' ? <TrendingUp /> : <TrendingUp style={{ transform: 'rotate(180deg)' }} />}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Analytics Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab icon={<ShowChart />} label="Trends" />
          <Tab icon={<PieChart />} label="Distribution" />
          <Tab icon={<BarChart />} label="Performance" />
          <Tab icon={<BugReport />} label="Failures" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <TabPanel value={currentTab} index={0}>
        {/* Test Trends */}
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 66%', minWidth: '400px' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Test Success Trends
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={testTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="passed"
                      stackId="1"
                      stroke={COLORS[2]}
                      fill={COLORS[2]}
                      name="Passed"
                    />
                    <Area
                      type="monotone"
                      dataKey="failed"
                      stackId="1"
                      stroke={COLORS[1]}
                      fill={COLORS[1]}
                      name="Failed"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: '1 1 33%', minWidth: '300px' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Success Rate
                </Typography>
                <Box textAlign="center" py={2}>
                  <Typography variant="h2" color="success.main">
                    94.2%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    7-day average
                  </Typography>
                  <Chip
                    label="+2.1% from last week"
                    color="success"
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        {/* Browser Distribution */}
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 50%', minWidth: '300px' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Browser Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <RechartsTooltip />
                    <Legend />
                    <RechartsPieChart dataKey="value" data={browserDistribution} cx="50%" cy="50%" outerRadius={80}>
                      {browserDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </RechartsPieChart>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: '1 1 50%', minWidth: '300px' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Browser Usage Details
                </Typography>
                <Stack spacing={2}>
                  {browserDistribution.map((browser, index) => (
                    <Box key={browser.name} display="flex" alignItems="center" gap={2}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          backgroundColor: COLORS[index],
                          borderRadius: '50%'
                        }}
                      />
                      <Box flex={1}>
                        <Typography variant="body2">{browser.name}</Typography>
                        <LinearProgress
                          variant="determinate"
                          value={browser.value}
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {browser.value}% ({browser.count})
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </TabPanel>

      <TabPanel value={currentTab} index={2}>
        {/* Performance Metrics */}
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 100%', minWidth: '400px' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Performance Metrics Over Time
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={testTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke={COLORS[0]}
                      strokeWidth={3}
                      name="Total Tests"
                    />
                    <Line
                      type="monotone"
                      dataKey="passed"
                      stroke={COLORS[2]}
                      strokeWidth={2}
                      name="Passed Tests"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </TabPanel>

      <TabPanel value={currentTab} index={3}>
        {/* Failure Analysis */}
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 100%', minWidth: '400px' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Test Failures
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Test ID</TableCell>
                        <TableCell>URL</TableCell>
                        <TableCell>Error Message</TableCell>
                        <TableCell>Timestamp</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentFailures.map((failure, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography variant="body2" fontFamily="monospace">
                              {failure.test_id}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ maxWidth: 200 }} noWrap>
                              {failure.url}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="error">
                              {failure.error}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {failure.timestamp}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={failure.status}
                              color={failure.status === 'failed' ? 'error' : 'warning'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </TabPanel>

      {/* Loading overlay */}
      {(analyticsLoading || performanceLoading) && (
        <LinearProgress sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1301 }} />
      )}
    </Box>
  );
};

export default AnalyticsEnhanced;