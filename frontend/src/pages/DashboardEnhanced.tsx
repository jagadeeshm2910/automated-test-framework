import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  Stack,
  Alert,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Paper,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Assessment,
  CheckCircle,
  Error,
  Refresh,
  MoreVert,
  Speed,
  Timeline,
  Web,
  PlayArrow,
  Visibility,
  Settings,
  Psychology,
  AutoAwesome,
  DataObject,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAppContext } from '../contexts/AppContext';

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  action?: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  trend,
  trendValue,
  icon,
  color,
  action,
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp sx={{ color: 'success.main', fontSize: 16 }} />;
      case 'down':
        return <TrendingDown sx={{ color: 'error.main', fontSize: 16 }} />;
      default:
        return null;
    }
  };

  return (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Avatar sx={{ bgcolor: `${color}.main`, width: 48, height: 48 }}>
            {icon}
          </Avatar>
          {action}
        </Box>
        
        <Typography variant="h4" component="div" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
          {value}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        
        {trend && trendValue && (
          <Box display="flex" alignItems="center" gap={0.5}>
            {getTrendIcon()}
            <Typography variant="caption" color={trend === 'up' ? 'success.main' : 'error.main'}>
              {trendValue}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
}

const QuickActionCard: React.FC<QuickActionProps> = ({
  title,
  description,
  icon,
  onClick,
  disabled = false,
  color = 'primary',
}) => (
  <Card 
    sx={{ 
      cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0.6 : 1,
      transition: 'all 0.2s',
      '&:hover': disabled ? {} : {
        transform: 'translateY(-2px)',
        boxShadow: 4,
      }
    }}
    onClick={disabled ? undefined : onClick}
  >
    <CardContent>
      <Box display="flex" alignItems="flex-start" gap={2}>
        <Avatar sx={{ bgcolor: `${color}.main` }}>
          {icon}
        </Avatar>
        <Box flex={1}>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const DashboardEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const { state, setConnected } = useAppContext();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [healthStatus, setHealthStatus] = useState<'checking' | 'connected' | 'disconnected' | 'error'>('checking');
  const [lastHealthCheck, setLastHealthCheck] = useState<string>('');

  // Health check function
  const checkBackendHealth = async () => {
    setHealthStatus('checking');
    setLastHealthCheck('Checking...');
    
    try {
      console.log('DashboardEnhanced: Testing backend connection...');
      
      const response = await fetch('http://localhost:8000/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('DashboardEnhanced: Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('DashboardEnhanced: Backend health check passed:', data);
      setConnected(true);
      setHealthStatus('connected');
      setLastHealthCheck(`✅ Connected at ${new Date().toLocaleTimeString()}`);
    } catch (error) {
      console.error('DashboardEnhanced: Backend health check failed:', error);
      setConnected(false);
      setHealthStatus('error');
      setLastHealthCheck(`❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'} at ${new Date().toLocaleTimeString()}`);
    }
  };

  // Check backend health on mount and periodically
  useEffect(() => {
    checkBackendHealth();
    
    // Set up periodic health checks every 30 seconds
    const healthCheckInterval = setInterval(checkBackendHealth, 30000);
    
    return () => clearInterval(healthCheckInterval);
  }, []);

  // Fetch dashboard data
  const { isLoading: dashboardLoading, refetch } = useQuery({
    queryKey: ['dashboard-data'],
    queryFn: () => apiService.getDashboardData(),
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: 1,
  });

  // Fetch global analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['global-analytics'],
    queryFn: () => apiService.getGlobalAnalytics(),
    refetchInterval: 60000, // Refresh every minute
    retry: 1,
  });

  // Recent test runs for activity feed
  const { data: recentTests } = useQuery({
    queryKey: ['recent-tests'],
    queryFn: () => apiService.getTestRuns({ size: 5 }),
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const quickActions = [
    {
      title: 'Extract Metadata',
      description: 'Extract form metadata from web pages or GitHub repositories',
      icon: <Web />,
      onClick: () => navigate('/extract'),
      color: 'primary' as const,
    },
    {
      title: 'Generate Test Data',
      description: 'Create AI-powered test data for extracted forms',
      icon: <Psychology />,
      onClick: () => navigate('/data-generation'),
      color: 'secondary' as const,
    },
    {
      title: 'Run Tests',
      description: 'Execute automated UI tests with generated data',
      icon: <PlayArrow />,
      onClick: () => navigate('/tests'),
      color: 'success' as const,
    },
    {
      title: 'View Analytics',
      description: 'Analyze test performance and success metrics',
      icon: <Assessment />,
      onClick: () => navigate('/analytics'),
      color: 'info' as const,
    },
  ];

  // Calculate metrics from data
  const totalTests = analytics?.totals?.test_runs || 0;
  const successRate = analytics?.test_run_status?.success_rate_percent || 0;
  const activeTests = analytics?.test_run_status?.running || 0;
  const totalMetadata = analytics?.totals?.metadata_records || 0;

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Overview of your UI testing framework
          </Typography>
        </Box>
        
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => refetch()}
            disabled={dashboardLoading}
          >
            Refresh
          </Button>
          
          <IconButton onClick={handleMenuOpen}>
            <MoreVert />
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >

      {/* Debug Connection Status */}
      <Alert 
        severity={healthStatus === 'connected' ? 'success' : healthStatus === 'error' ? 'error' : 'info'}
        sx={{ mb: 2 }}
        action={
          <Button size="small" onClick={checkBackendHealth}>
            Test Connection
          </Button>
        }
      >
        <Typography variant="body2">
          <strong>Backend Status:</strong> {lastHealthCheck || 'Not tested yet'}
        </Typography>
        <Typography variant="body2">
          <strong>Global State:</strong> {state.connected ? 'Connected' : 'Disconnected'}
        </Typography>
      </Alert>
            <MenuItem onClick={() => { navigate('/settings'); handleMenuClose(); }}>
              <ListItemIcon><Settings /></ListItemIcon>
              <ListItemText>Settings</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { navigate('/showcase'); handleMenuClose(); }}>
              <ListItemIcon><AutoAwesome /></ListItemIcon>
              <ListItemText>Feature Showcase</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Connection Status */}
      {!state.connected && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Backend API connection issue. Some features may be limited.
        </Alert>
      )}

      {/* Metrics Grid */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 4 }}>
        <Box sx={{ flex: '1 1 25%', minWidth: '250px' }}>
          <MetricCard
            title="Total Tests"
            value={totalTests}
            trend="up"
            trendValue="+12% this week"
            icon={<Assessment />}
            color="primary"
          />
        </Box>
        
        <Box sx={{ flex: '1 1 25%', minWidth: '250px' }}>
          <MetricCard
            title="Success Rate"
            value={`${successRate.toFixed(1)}%`}
            trend={successRate > 90 ? 'up' : 'down'}
            trendValue={successRate > 90 ? '+2.1%' : '-1.5%'}
            icon={<CheckCircle />}
            color="success"
          />
        </Box>
        
        <Box sx={{ flex: '1 1 25%', minWidth: '250px' }}>
          <MetricCard
            title="Active Tests"
            value={activeTests}
            icon={<Speed />}
            color="warning"
            action={
              activeTests > 0 ? (
                <Chip
                  label="Running"
                  color="warning"
                  size="small"
                  icon={<Timeline />}
                />
              ) : undefined
            }
          />
        </Box>
        
        <Box sx={{ flex: '1 1 25%', minWidth: '250px' }}>
          <MetricCard
            title="Metadata Records"
            value={totalMetadata}
            trend="up"
            trendValue="+5 this week"
            icon={<DataObject />}
            color="info"
          />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* Quick Actions */}
        <Box sx={{ flex: '1 1 66%', minWidth: '600px' }}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {quickActions.map((action, index) => (
              <Box sx={{ flex: '1 1 50%', minWidth: '250px' }} key={index}>
                <QuickActionCard {...action} />
              </Box>
            ))}
          </Box>
        </Box>

        {/* Recent Activity */}
        <Box sx={{ flex: '1 1 33%', minWidth: '300px' }}>
          <Typography variant="h6" gutterBottom>
            Recent Test Activity
          </Typography>
          <Paper sx={{ p: 2 }}>
            {recentTests?.items && recentTests.items.length > 0 ? (
              <Stack spacing={2}>
                {recentTests.items.slice(0, 5).map((test: any, index: number) => (
                  <Box key={test.id || index} display="flex" alignItems="center" gap={2}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: test.status === 'completed' ? 'success.main' : 
                                test.status === 'failed' ? 'error.main' : 'warning.main'
                      }}
                    >
                      {test.status === 'completed' ? <CheckCircle /> : 
                       test.status === 'failed' ? <Error /> : <Speed />}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="body2">
                        Test #{test.id} - {test.status}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(test.created_at).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                ))}
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate('/results')}
                  startIcon={<Visibility />}
                >
                  View All Results
                </Button>
              </Stack>
            ) : (
              <Box textAlign="center" py={4}>
                <Typography variant="body2" color="text.secondary">
                  No recent test activity
                </Typography>
                <Button
                  sx={{ mt: 1 }}
                  variant="contained"
                  onClick={() => navigate('/tests')}
                  startIcon={<PlayArrow />}
                >
                  Start First Test
                </Button>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Loading overlay */}
      {(dashboardLoading || analyticsLoading) && (
        <LinearProgress sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1301 }} />
      )}
    </Box>
  );
};

export default DashboardEnhanced;