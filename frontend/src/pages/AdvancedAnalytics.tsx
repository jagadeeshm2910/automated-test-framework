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
  CircularProgress,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Avatar,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  BugReport as BugReportIcon,
  Psychology as AIIcon,
  Insights as InsightsIcon,
  Compare as CompareIcon,
  Dataset as DataIcon,
  Science as PredictiveIcon,
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
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
} from 'recharts';

interface AnalyticsData {
  timestamp: string;
  testsRun: number;
  passRate: number;
  failRate: number;
  avgDuration: number;
  coverage: number;
  performance: number;
  bugs: number;
  users: number;
}

interface MetricCard {
  id: string;
  title: string;
  value: number | string;
  unit?: string;
  change?: number;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
  icon: React.ReactNode;
  color: string;
}

interface PredictiveInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'forecast' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  actionRequired: boolean;
}

interface CustomFilter {
  dateRange: [Date, Date];
  testTypes: string[];
  environments: string[];
  browsers: string[];
  teams: string[];
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

const AdvancedAnalytics: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [timeRange, setTimeRange] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [metricCards, setMetricCards] = useState<MetricCard[]>([]);
  const [predictiveInsights, setPredictiveInsights] = useState<PredictiveInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [customFilters, setCustomFilters] = useState<CustomFilter>({
    dateRange: [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()],
    testTypes: ['unit', 'integration', 'e2e', 'performance'],
    environments: ['development', 'staging', 'production'],
    browsers: ['chrome', 'firefox', 'safari', 'edge'],
    teams: ['frontend', 'backend', 'qa', 'devops'],
  });

  const timeRanges = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' },
  ];

  const generateMockAnalyticsData = (): AnalyticsData[] => {
    const now = new Date();
    const days = 30;
    
    return Array.from({ length: days }, (_, i) => {
      const date = new Date(now.getTime() - (days - 1 - i) * 24 * 60 * 60 * 1000);
      return {
        timestamp: date.toISOString().split('T')[0],
        testsRun: Math.floor(Math.random() * 500) + 200,
        passRate: Math.random() * 15 + 85, // 85-100%
        failRate: Math.random() * 10 + 2, // 2-12%
        avgDuration: Math.random() * 300 + 120, // 120-420 seconds
        coverage: Math.random() * 20 + 75, // 75-95%
        performance: Math.random() * 30 + 70, // 70-100 score
        bugs: Math.floor(Math.random() * 20) + 5,
        users: Math.floor(Math.random() * 100) + 50,
      };
    });
  };

  const generateMockMetricCards = (): MetricCard[] => {
    return [
      {
        id: 'total_tests',
        title: 'Total Tests Run',
        value: 15420,
        change: 12.5,
        trend: 'up',
        status: 'good',
        icon: <CheckCircleIcon />,
        color: '#4caf50',
      },
      {
        id: 'pass_rate',
        title: 'Pass Rate',
        value: 94.2,
        unit: '%',
        change: -1.8,
        trend: 'down',
        status: 'warning',
        icon: <TrendingDownIcon />,
        color: '#ff9800',
      },
      {
        id: 'avg_duration',
        title: 'Avg Duration',
        value: '4m 32s',
        change: -8.3,
        trend: 'down',
        status: 'good',
        icon: <SpeedIcon />,
        color: '#2196f3',
      },
      {
        id: 'code_coverage',
        title: 'Code Coverage',
        value: 87.6,
        unit: '%',
        change: 3.2,
        trend: 'up',
        status: 'good',
        icon: <DataIcon />,
        color: '#9c27b0',
      },
      {
        id: 'bug_detection',
        title: 'Bugs Detected',
        value: 127,
        change: 15.7,
        trend: 'up',
        status: 'critical',
        icon: <BugReportIcon />,
        color: '#f44336',
      },
      {
        id: 'performance_score',
        title: 'Performance Score',
        value: 82,
        change: 5.1,
        trend: 'up',
        status: 'good',
        icon: <SpeedIcon />,
        color: '#4caf50',
      },
    ];
  };

  const generateMockPredictiveInsights = (): PredictiveInsight[] => {
    return [
      {
        id: 'insight1',
        type: 'trend',
        title: 'Test Execution Time Increasing',
        description: 'Test execution time has increased by 23% over the last week. This trend suggests potential performance degradation in the test suite.',
        confidence: 89,
        impact: 'high',
        actionRequired: true,
      },
      {
        id: 'insight2',
        type: 'anomaly',
        title: 'Unusual Failure Pattern Detected',
        description: 'An unusual spike in failures for mobile browser tests detected on Friday afternoons. This pattern suggests environment-related issues.',
        confidence: 76,
        impact: 'medium',
        actionRequired: true,
      },
      {
        id: 'insight3',
        type: 'forecast',
        title: 'Predicted Resource Requirements',
        description: 'Based on current growth trends, test execution resources will need to increase by 40% in the next quarter.',
        confidence: 82,
        impact: 'medium',
        actionRequired: false,
      },
      {
        id: 'insight4',
        type: 'recommendation',
        title: 'Optimize Test Parallelization',
        description: 'Tests could be optimized to run 35% faster by improving parallelization strategy for integration tests.',
        confidence: 91,
        impact: 'high',
        actionRequired: false,
      },
    ];
  };

  useEffect(() => {
    setAnalyticsData(generateMockAnalyticsData());
    setMetricCards(generateMockMetricCards());
    setPredictiveInsights(generateMockPredictiveInsights());

    if (autoRefresh) {
      const interval = setInterval(() => {
        setAnalyticsData(generateMockAnalyticsData());
        setMetricCards(generateMockMetricCards());
      }, 60000); // Refresh every minute

      return () => clearInterval(interval);
    }
  }, [autoRefresh, timeRange]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend':
        return <TrendingUpIcon />;
      case 'anomaly':
        return <WarningIcon />;
      case 'forecast':
        return <PredictiveIcon />;
      case 'recommendation':
        return <InsightsIcon />;
      default:
        return <AnalyticsIcon />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return '#f44336';
      case 'medium':
        return '#ff9800';
      case 'low':
        return '#4caf50';
      default:
        return '#757575';
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setAnalyticsData(generateMockAnalyticsData());
      setMetricCards(generateMockMetricCards());
      setPredictiveInsights(generateMockPredictiveInsights());
      setLoading(false);
    }, 1000);
  };

  const exportData = () => {
    const data = {
      analytics: analyticsData,
      metrics: metricCards,
      insights: predictiveInsights,
      exported: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Advanced Analytics
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                onChange={(e: SelectChangeEvent) => setTimeRange(e.target.value)}
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAutoRefresh(e.target.checked)}
                />
              }
              label="Auto Refresh"
            />
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setFilterDialogOpen(true)}
            >
              Filters
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={exportData}
            >
              Export
            </Button>
            <Button
              variant="outlined"
              onClick={handleRefresh}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
            >
              Refresh
            </Button>
          </Box>
        </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {metricCards.map((metric) => (
                <Box key={metric.id} sx={{ flex: '1 1 calc(16.67% - 16px)', minWidth: '200px' }}>
              <Card 
                sx={{ 
                  height: '100%',
                  borderLeft: `4px solid ${metric.color}`,
                  '&:hover': { 
                    boxShadow: 3,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out'
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: metric.color, mr: 2, width: 40, height: 40 }}>
                      {metric.icon}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography color="textSecondary" variant="caption" display="block">
                        {metric.title}
                      </Typography>
                      <Typography variant="h6" component="div" fontWeight="bold">
                        {typeof metric.value === 'number' 
                          ? metric.value.toLocaleString() 
                          : metric.value
                        }
                        {metric.unit && (
                          <Typography component="span" variant="body2" color="textSecondary">
                            {' '}{metric.unit}
                          </Typography>
                        )}
                      </Typography>
                    </Box>
                  </Box>
                  {metric.change !== undefined && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography
                        variant="body2"
                        color={metric.trend === 'up' 
                          ? (metric.id === 'bug_detection' ? 'error.main' : 'success.main')
                          : metric.trend === 'down' 
                          ? (metric.id === 'pass_rate' ? 'error.main' : 'success.main')
                          : 'textSecondary'
                        }
                        sx={{ display: 'flex', alignItems: 'center' }}
                      >
                        {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}
                        {' '}{Math.abs(metric.change)}%
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                        vs last period
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
                </Box>
          ))}
        </Box>

        {/* Analytics Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)}>
            <Tab label="Overview" icon={<AnalyticsIcon />} />
            <Tab label="Performance" icon={<SpeedIcon />} />
            <Tab label="Quality Trends" icon={<TrendingUpIcon />} />
            <Tab label="Predictive Insights" icon={<AIIcon />} />
            <Tab label="Comparative Analysis" icon={<CompareIcon />} />
          </Tabs>
        </Box>

        {/* Overview Tab */}
        <TabPanel value={selectedTab} index={0}>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '2 1 600px', minWidth: '300px' }}>
              <Card>
                <CardHeader title="Test Execution Trends" />
                <CardContent>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={analyticsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <RechartsTooltip 
                          labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="testsRun" fill="#2196f3" name="Tests Run" />
                        <Line 
                          yAxisId="right" 
                          type="monotone" 
                          dataKey="passRate" 
                          stroke="#4caf50" 
                          strokeWidth={2}
                          name="Pass Rate (%)"
                        />
                        <Line 
                          yAxisId="right" 
                          type="monotone" 
                          dataKey="coverage" 
                          stroke="#ff9800" 
                          strokeWidth={2}
                          name="Coverage (%)"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 400px', minWidth: '300px' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Card>
                    <CardHeader title="Test Distribution" />
                    <CardContent>
                      <Box sx={{ height: 200 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Unit Tests', value: 45, fill: '#4caf50' },
                                { name: 'Integration', value: 30, fill: '#2196f3' },
                                { name: 'E2E Tests', value: 20, fill: '#ff9800' },
                                { name: 'Performance', value: 5, fill: '#f44336' },
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {[
                                { name: 'Unit Tests', value: 45, fill: '#4caf50' },
                                { name: 'Integration', value: 30, fill: '#2196f3' },
                                { name: 'E2E Tests', value: 20, fill: '#ff9800' },
                                { name: 'Performance', value: 5, fill: '#f44336' },
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
                <Box>
                  <Card>
                    <CardHeader title="Quality Score" />
                    <CardContent>
                      <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                          <CircularProgress
                            variant="determinate"
                            value={87}
                            size={120}
                            thickness={8}
                            sx={{ color: '#4caf50' }}
                          />
                          <Box
                            sx={{
                              top: 0,
                              left: 0,
                              bottom: 0,
                              right: 0,
                              position: 'absolute',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexDirection: 'column',
                            }}
                          >
                            <Typography variant="h4" component="div" color="text.secondary" fontWeight="bold">
                              87
                            </Typography>
                            <Typography variant="caption" component="div" color="text.secondary">
                              Quality Score
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            </Box>
          </Box>
        </TabPanel>

        {/* Performance Tab */}
        <TabPanel value={selectedTab} index={1}>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 50%', minWidth: '300px' }}>
              <Card>
                <CardHeader title="Test Duration Trends" />
                <CardContent>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analyticsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" />
                        <YAxis />
                        <RechartsTooltip />
                        <Area
                          type="monotone"
                          dataKey="avgDuration"
                          stroke="#2196f3"
                          fill="#2196f3"
                          fillOpacity={0.3}
                          name="Avg Duration (s)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 50%', minWidth: '300px' }}>
              <Card>
                <CardHeader title="Performance Score Distribution" />
                <CardContent>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="performance" fill="#4caf50" name="Performance Score" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </TabPanel>

        {/* Quality Trends Tab */}
        <TabPanel value={selectedTab} index={2}>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ width: '100%' }}>
              <Card>
                <CardHeader title="Quality Metrics Over Time" />
                <CardContent>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analyticsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="passRate"
                          stroke="#4caf50"
                          strokeWidth={2}
                          name="Pass Rate (%)"
                        />
                        <Line
                          type="monotone"
                          dataKey="coverage"
                          stroke="#2196f3"
                          strokeWidth={2}
                          name="Code Coverage (%)"
                        />
                        <Line
                          type="monotone"
                          dataKey="bugs"
                          stroke="#f44336"
                          strokeWidth={2}
                          name="Bugs Found"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </TabPanel>

        {/* Predictive Insights Tab */}
        <TabPanel value={selectedTab} index={3}>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {predictiveInsights.map((insight) => (
              <Box key={insight.id} sx={{ flex: '1 1 50%', minWidth: '300px' }}>
                <Card 
                  sx={{ 
                    height: '100%',
                    borderLeft: `4px solid ${getImpactColor(insight.impact)}`,
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: getImpactColor(insight.impact), mr: 2 }}>
                        {getInsightIcon(insight.type)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="div" gutterBottom>
                          {insight.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                          <Chip
                            size="small"
                            label={insight.type.toUpperCase()}
                            variant="outlined"
                          />
                          <Chip
                            size="small"
                            label={`${insight.impact.toUpperCase()} IMPACT`}
                            color={insight.impact === 'high' ? 'error' : insight.impact === 'medium' ? 'warning' : 'success'}
                          />
                          {insight.actionRequired && (
                            <Chip
                              size="small"
                              label="ACTION REQUIRED"
                              color="error"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      {insight.description}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" color="textSecondary">
                          Confidence: {insight.confidence}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={insight.confidence}
                          sx={{ width: 60, ml: 1, height: 6, borderRadius: 3 }}
                          color={insight.confidence >= 80 ? 'success' : insight.confidence >= 60 ? 'warning' : 'error'}
                        />
                      </Box>
                      {insight.actionRequired && (
                        <Button size="small" variant="contained" color="primary">
                          Take Action
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </TabPanel>

        {/* Comparative Analysis Tab */}
        <TabPanel value={selectedTab} index={4}>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ width: '100%' }}>
              <Card>
                <CardHeader title="Environment Comparison" />
                <CardContent>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { environment: 'Development', passRate: 92, coverage: 85, performance: 78 },
                          { environment: 'Staging', passRate: 89, coverage: 88, performance: 82 },
                          { environment: 'Production', passRate: 96, coverage: 79, performance: 91 },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="environment" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="passRate" fill="#4caf50" name="Pass Rate %" />
                        <Bar dataKey="coverage" fill="#2196f3" name="Coverage %" />
                        <Bar dataKey="performance" fill="#ff9800" name="Performance Score" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </TabPanel>

        {/* Filter Dialog */}
        <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Advanced Filters</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mt: 1 }}>
              <Box sx={{ flex: '1 1 50%', minWidth: '300px' }}>
                <Typography variant="h6" gutterBottom>Test Types</Typography>
                <FormControl fullWidth>
                  <InputLabel>Select Test Types</InputLabel>
                  <Select
                    multiple
                    value={customFilters.testTypes}
                    onChange={(e) => setCustomFilters({
                      ...customFilters,
                      testTypes: typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value,
                    })}
                    label="Select Test Types"
                  >
                    <MenuItem value="unit">Unit Tests</MenuItem>
                    <MenuItem value="integration">Integration Tests</MenuItem>
                    <MenuItem value="e2e">E2E Tests</MenuItem>
                    <MenuItem value="performance">Performance Tests</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: '1 1 50%', minWidth: '300px' }}>
                <Typography variant="h6" gutterBottom>Environments</Typography>
                <FormControl fullWidth>
                  <InputLabel>Select Environments</InputLabel>
                  <Select
                    multiple
                    value={customFilters.environments}
                    onChange={(e) => setCustomFilters({
                      ...customFilters,
                      environments: typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value,
                    })}
                    label="Select Environments"
                  >
                    <MenuItem value="development">Development</MenuItem>
                    <MenuItem value="staging">Staging</MenuItem>
                    <MenuItem value="production">Production</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: '1 1 50%', minWidth: '300px' }}>
                <Typography variant="h6" gutterBottom>Browsers</Typography>
                <FormControl fullWidth>
                  <InputLabel>Select Browsers</InputLabel>
                  <Select
                    multiple
                    value={customFilters.browsers}
                    onChange={(e) => setCustomFilters({
                      ...customFilters,
                      browsers: typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value,
                    })}
                    label="Select Browsers"
                  >
                    <MenuItem value="chrome">Chrome</MenuItem>
                    <MenuItem value="firefox">Firefox</MenuItem>
                    <MenuItem value="safari">Safari</MenuItem>
                    <MenuItem value="edge">Edge</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: '1 1 50%', minWidth: '300px' }}>
                <Typography variant="h6" gutterBottom>Teams</Typography>
                <FormControl fullWidth>
                  <InputLabel>Select Teams</InputLabel>
                  <Select
                    multiple
                    value={customFilters.teams}
                    onChange={(e) => setCustomFilters({
                      ...customFilters,
                      teams: typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value,
                    })}
                    label="Select Teams"
                  >
                    <MenuItem value="frontend">Frontend</MenuItem>
                    <MenuItem value="backend">Backend</MenuItem>
                    <MenuItem value="qa">QA</MenuItem>
                    <MenuItem value="devops">DevOps</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFilterDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={() => setFilterDialogOpen(false)}>
              Apply Filters
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default AdvancedAnalytics;
