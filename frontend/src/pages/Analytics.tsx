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
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  Speed,
  CheckCircle,
  Schedule,
  Assessment,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';

// Color palette for charts
const COLORS = ['#1976d2', '#dc004e', '#2e7d32', '#ed6c02', '#9c27b0', '#00695c'];

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  color?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon,
  color = '#1976d2',
}) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" component="h2">
            {value}
          </Typography>
          {change && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <TrendingUp
                sx={{
                  fontSize: 16,
                  mr: 0.5,
                  color: changeType === 'increase' ? 'success.main' : 
                         changeType === 'decrease' ? 'error.main' : 'text.secondary',
                  transform: changeType === 'decrease' ? 'rotate(180deg)' : 'none',
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: changeType === 'increase' ? 'success.main' : 
                         changeType === 'decrease' ? 'error.main' : 'text.secondary',
                }}
              >
                {change}
              </Typography>
            </Box>
          )}
        </Box>
        <Box
          sx={{
            color: color,
            backgroundColor: color + '20',
            borderRadius: '50%',
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');

  // Fetch analytics data
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useQuery({
    queryKey: ['analytics', timeRange],
    queryFn: () => apiService.getGlobalAnalytics(),
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch performance metrics
  const { data: performance } = useQuery({
    queryKey: ['performance', timeRange],
    queryFn: () => apiService.getPerformanceMetrics(),
    refetchInterval: 60000,
  });

  // Mock data for charts (since we might not have backend data yet)
  const testSuccessData = [
    { name: 'Mon', success: 12, failed: 3, total: 15 },
    { name: 'Tue', success: 19, failed: 2, total: 21 },
    { name: 'Wed', success: 8, failed: 5, total: 13 },
    { name: 'Thu', success: 15, failed: 1, total: 16 },
    { name: 'Fri', success: 22, failed: 4, total: 26 },
    { name: 'Sat', success: 18, failed: 2, total: 20 },
    { name: 'Sun', success: 14, failed: 3, total: 17 },
  ];

  const responseTimeData = [
    { name: '00:00', avgTime: 2.4, maxTime: 4.1 },
    { name: '04:00', avgTime: 1.8, maxTime: 3.2 },
    { name: '08:00', avgTime: 3.2, maxTime: 5.8 },
    { name: '12:00', avgTime: 4.1, maxTime: 7.2 },
    { name: '16:00', avgTime: 3.8, maxTime: 6.5 },
    { name: '20:00', avgTime: 2.9, maxTime: 4.8 },
  ];

  const testTypeDistribution = [
    { name: 'Form Validation', value: 35, count: 142 },
    { name: 'Navigation', value: 25, count: 102 },
    { name: 'Input Fields', value: 20, count: 81 },
    { name: 'Submit Actions', value: 15, count: 61 },
    { name: 'Error Handling', value: 5, count: 20 },
  ];

  const browserUsage = [
    { name: 'Chrome', value: 60 },
    { name: 'Firefox', value: 25 },
    { name: 'Safari', value: 10 },
    { name: 'Edge', value: 5 },
  ];

  if (analyticsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (analyticsError) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        Analytics data is currently unavailable. Showing sample data for demonstration.
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Analytics Dashboard
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Comprehensive insights into your UI testing performance
          </Typography>
        </Box>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            label="Time Range"
          >
            <MenuItem value="1d">Last 24 Hours</MenuItem>
            <MenuItem value="7d">Last 7 Days</MenuItem>
            <MenuItem value="30d">Last 30 Days</MenuItem>
            <MenuItem value="90d">Last 90 Days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Key Metrics */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 4 }}>
        <Box sx={{ flex: '1 1 25%', minWidth: '250px' }}>
          <MetricCard
            title="Total Tests Run"
            value={analytics?.totals?.test_runs || 1248}
            change="+12% vs last period"
            changeType="increase"
            icon={<Assessment />}
            color="#1976d2"
          />
        </Box>
        <Box sx={{ flex: '1 1 25%', minWidth: '250px' }}>
          <MetricCard
            title="Success Rate"
            value={`${analytics?.test_run_status?.success_rate_percent || 87}%`}
            change="+2.3% vs last period"
            changeType="increase"
            icon={<CheckCircle />}
            color="#2e7d32"
          />
        </Box>
        <Box sx={{ flex: '1 1 25%', minWidth: '250px' }}>
          <MetricCard
            title="Avg Response Time"
            value={`${performance?.avg_response_time || 3.2}s`}
            change="-0.5s vs last period"
            changeType="increase"
            icon={<Speed />}
            color="#ed6c02"
          />
        </Box>
        <Box sx={{ flex: '1 1 25%', minWidth: '250px' }}>
          <MetricCard
            title="Active Tests"
            value={analytics?.test_run_status?.running || 7}
            icon={<Schedule />}
            color="#9c27b0"
          />
        </Box>
      </Box>

      {/* Charts Section */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 4 }}>
        {/* Test Success Rate Over Time */}
        <Box sx={{ flex: '1 1 66%', minWidth: '400px' }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Test Results Over Time
            </Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <AreaChart data={testSuccessData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="success"
                    stackId="1"
                    stroke="#2e7d32"
                    fill="#2e7d32"
                    fillOpacity={0.8}
                  />
                  <Area
                    type="monotone"
                    dataKey="failed"
                    stackId="1"
                    stroke="#d32f2f"
                    fill="#d32f2f"
                    fillOpacity={0.8}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Box>

        {/* Test Type Distribution */}
        <Box sx={{ flex: '1 1 33%', minWidth: '300px' }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Test Type Distribution
            </Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={testTypeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {testTypeDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Box>

        {/* Response Time Analysis */}
        <Box sx={{ flex: '1 1 50%', minWidth: '300px' }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Response Time Analysis
            </Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="avgTime"
                    stroke="#1976d2"
                    strokeWidth={2}
                    name="Average Time (s)"
                  />
                  <Line
                    type="monotone"
                    dataKey="maxTime"
                    stroke="#dc004e"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Max Time (s)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Box>

        {/* Browser Usage */}
        <Box sx={{ flex: '1 1 50%', minWidth: '300px' }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Browser Usage
            </Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={browserUsage} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Performance Summary Table */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Performance Summary
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Metric</TableCell>
                <TableCell align="right">Current Value</TableCell>
                <TableCell align="right">Target</TableCell>
                <TableCell align="right">Status</TableCell>
                <TableCell align="right">Trend</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Average Test Duration</TableCell>
                <TableCell align="right">3.2s</TableCell>
                <TableCell align="right">&lt; 5s</TableCell>
                <TableCell align="right">
                  <Chip label="Good" color="success" size="small" />
                </TableCell>
                <TableCell align="right">
                  <Chip label="-5%" color="success" size="small" />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Success Rate</TableCell>
                <TableCell align="right">87%</TableCell>
                <TableCell align="right">&gt; 85%</TableCell>
                <TableCell align="right">
                  <Chip label="Good" color="success" size="small" />
                </TableCell>
                <TableCell align="right">
                  <Chip label="+2%" color="success" size="small" />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Error Rate</TableCell>
                <TableCell align="right">13%</TableCell>
                <TableCell align="right">&lt; 15%</TableCell>
                <TableCell align="right">
                  <Chip label="Good" color="success" size="small" />
                </TableCell>
                <TableCell align="right">
                  <Chip label="-2%" color="success" size="small" />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Peak Queue Time</TableCell>
                <TableCell align="right">45s</TableCell>
                <TableCell align="right">&lt; 60s</TableCell>
                <TableCell align="right">
                  <Chip label="Good" color="success" size="small" />
                </TableCell>
                <TableCell align="right">
                  <Chip label="+8%" color="warning" size="small" />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Resource Utilization</TableCell>
                <TableCell align="right">67%</TableCell>
                <TableCell align="right">&lt; 80%</TableCell>
                <TableCell align="right">
                  <Chip label="Good" color="success" size="small" />
                </TableCell>
                <TableCell align="right">
                  <Chip label="+3%" color="info" size="small" />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default Analytics;
