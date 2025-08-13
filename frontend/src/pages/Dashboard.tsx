import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Paper,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  CheckCircle,
  Error,
  Schedule,
  Web,
  GitHub,
  PlayArrow,
  Assessment,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon,
  color = 'primary',
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
            <Chip
              size="small"
              label={change}
              color={change.startsWith('+') ? 'success' : 'error'}
              sx={{ mt: 1 }}
            />
          )}
        </Box>
        <Box
          sx={{
            color: `${color}.main`,
            backgroundColor: `${color}.light`,
            borderRadius: '50%',
            p: 1,
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

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

const QuickAction: React.FC<QuickActionProps> = ({
  title,
  description,
  icon,
  onClick,
  disabled = false,
}) => (
  <Card sx={{ height: '100%', cursor: disabled ? 'default' : 'pointer' }}>
    <CardContent>
      <Button
        fullWidth
        variant="outlined"
        startIcon={icon}
        onClick={onClick}
        disabled={disabled}
        sx={{
          height: 80,
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Typography variant="h6">{title}</Typography>
        <Typography variant="body2" color="textSecondary">
          {description}
        </Typography>
      </Button>
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // Fetch dashboard data
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: apiService.getDashboardData,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch recent results
  const { data: recentResults } = useQuery({
    queryKey: ['recent-results'],
    queryFn: () => apiService.getResults({ limit: 5 }),
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Failed to load dashboard data. Please check your connection to the backend.
      </Alert>
    );
  }

  const quickActions = [
    {
      title: 'Extract from URL',
      description: 'Extract forms from web pages',
      icon: <Web />,
      onClick: () => navigate('/extract?type=url'),
    },
    {
      title: 'Extract from GitHub',
      description: 'Extract forms from repositories',
      icon: <GitHub />,
      onClick: () => navigate('/extract?type=github'),
    },
    {
      title: 'Run Tests',
      description: 'Execute UI tests',
      icon: <PlayArrow />,
      onClick: () => navigate('/tests'),
    },
    {
      title: 'View Analytics',
      description: 'System performance metrics',
      icon: <Assessment />,
      onClick: () => navigate('/analytics'),
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Overview of your UI testing framework activity
      </Typography>

      {/* Metrics Cards */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 4 }}>
        <Box sx={{ flex: '1 1 25%', minWidth: '250px' }}>
          <MetricCard
            title="Total Tests"
            value={dashboardData?.totalTests || 0}
            change={dashboardData?.testsChange || '+0%'}
            icon={<Assessment />}
            color="primary"
          />
        </Box>
        <Box sx={{ flex: '1 1 25%', minWidth: '250px' }}>
          <MetricCard
            title="Success Rate"
            value={`${dashboardData?.successRate || 0}%`}
            change={dashboardData?.successRateChange || '+0%'}
            icon={<CheckCircle />}
            color="success"
          />
        </Box>
        <Box sx={{ flex: '1 1 25%', minWidth: '250px' }}>
          <MetricCard
            title="Active Tests"
            value={dashboardData?.activeTests || 0}
            icon={<Schedule />}
            color="warning"
          />
        </Box>
        <Box sx={{ flex: '1 1 25%', minWidth: '250px' }}>
          <MetricCard
            title="Forms Extracted"
            value={dashboardData?.formsExtracted || 0}
            change={dashboardData?.formsChange || '+0%'}
            icon={<TrendingUp />}
            color="secondary"
          />
        </Box>
      </Box>

      {/* Quick Actions */}
      <Typography variant="h5" gutterBottom>
        Quick Actions
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
        {quickActions.map((action, index) => (
          <Box key={index} sx={{ flex: '1 1 25%', minWidth: '250px' }}>
            <QuickAction {...action} />
          </Box>
        ))}
      </Box>

      {/* Recent Activity */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '2 1 65%', minWidth: '500px' }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Test Results
            </Typography>
            {recentResults?.results?.length ? (
              <Box>
                {recentResults.results.slice(0, 5).map((result: any) => (
                  <Box
                    key={result.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      py: 2,
                      borderBottom: '1px solid #eee',
                      '&:last-child': { borderBottom: 'none' },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {result.status === 'success' ? (
                        <CheckCircle color="success" />
                      ) : (
                        <Error color="error" />
                      )}
                      <Box>
                        <Typography variant="body1">
                          Test ID: {result.test_id}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {new Date(result.created_at).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={result.status}
                      color={result.status === 'success' ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                ))}
                <Button
                  onClick={() => navigate('/results')}
                  sx={{ mt: 2 }}
                  variant="outlined"
                  fullWidth
                >
                  View All Results
                </Button>
              </Box>
            ) : (
              <Typography color="textSecondary">
                No test results available
              </Typography>
            )}
          </Paper>
        </Box>

        <Box sx={{ flex: '1 1 35%', minWidth: '300px' }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Status
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Backend Connection
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: 'success.main',
                  }}
                />
                <Typography variant="body2">Connected</Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Test Queue
              </Typography>
              <LinearProgress
                variant="determinate"
                value={75}
                sx={{ mb: 1 }}
              />
              <Typography variant="caption" color="textSecondary">
                3 tests in queue
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" gutterBottom>
                Storage Usage
              </Typography>
              <LinearProgress
                variant="determinate"
                value={45}
                color="secondary"
                sx={{ mb: 1 }}
              />
              <Typography variant="caption" color="textSecondary">
                45% of allocated storage
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
