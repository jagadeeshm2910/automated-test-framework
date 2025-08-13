import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Chip,
  Paper,
  Stack,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp,
  CheckCircle,
  Error,
  Schedule,
  Web,
  PlayArrow,
  Assessment,
  Psychology,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';

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
  <Card sx={{ height: '100%', minWidth: 200 }}>
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
  <Card sx={{ height: '100%', cursor: disabled ? 'default' : 'pointer', minWidth: 200 }}>
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
  const { setConnected } = useAppContext();
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  const checkBackend = async () => {
    setBackendStatus('checking');
    try {
      console.log('Checking backend health with fetch...');
      
      const response = await fetch('http://localhost:8000/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new globalThis.Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Backend health response:', data);
      setBackendStatus('connected');
      setConnected(true); // Update global app state
    } catch (error) {
      console.error('Backend health check failed:', error);
      setBackendStatus('disconnected');
      setConnected(false); // Update global app state
    }
  };

  useEffect(() => {
    // Check backend connectivity on component mount
    checkBackend();
  }, []);

  // Mock data for now since backend might not be available
  const dashboardData = {
    totalTests: 1248,
    testsChange: '+12%',
    successRate: 87,
    successRateChange: '+2.3%',
    activeTests: 7,
    formsExtracted: 342,
    formsChange: '+8%',
  };

  const recentResults = {
    results: [
      {
        id: '1',
        test_id: 'test-001',
        status: 'success' as const,
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        test_id: 'test-002',
        status: 'failed' as const,
        created_at: new Date().toISOString(),
      },
    ],
  };

  const quickActions = [
    {
      title: 'Extract Forms',
      description: 'Extract from web pages/GitHub',
      icon: <Web />,
      onClick: () => navigate('/extract'),
    },
    {
      title: 'Generate Test Data',
      description: 'AI-powered data generation',
      icon: <Psychology />,
      onClick: () => navigate('/data-generation'),
    },
    {
      title: 'Run Tests',
      description: 'Execute automated UI tests',
      icon: <PlayArrow />,
      onClick: () => navigate('/tests'),
    },
    {
      title: 'View Results',
      description: 'Test results & screenshots',
      icon: <Assessment />,
      onClick: () => navigate('/results'),
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

      {/* Backend Status */}
      <Alert 
        severity={backendStatus === 'connected' ? 'success' : backendStatus === 'disconnected' ? 'error' : 'info'}
        sx={{ mb: 3 }}
        icon={backendStatus === 'checking' ? <CircularProgress size={20} /> : undefined}
      >
        {backendStatus === 'checking' && 'Checking backend connection...'}
        {backendStatus === 'connected' && 'Backend API is connected and ready'}
        {backendStatus === 'disconnected' && 'Backend API is not available. Please start the backend server.'}
      </Alert>

      {/* Metrics Cards */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Key Metrics
        </Typography>
        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
          <MetricCard
            title="Total Tests"
            value={dashboardData.totalTests}
            change={dashboardData.testsChange}
            icon={<Assessment />}
            color="primary"
          />
          <MetricCard
            title="Success Rate"
            value={`${dashboardData.successRate}%`}
            change={dashboardData.successRateChange}
            icon={<CheckCircle />}
            color="success"
          />
          <MetricCard
            title="Active Tests"
            value={dashboardData.activeTests}
            icon={<Schedule />}
            color="warning"
          />
          <MetricCard
            title="Forms Extracted"
            value={dashboardData.formsExtracted}
            change={dashboardData.formsChange}
            icon={<TrendingUp />}
            color="secondary"
          />
        </Stack>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
          {quickActions.map((action, index) => (
            <QuickAction key={index} {...action} />
          ))}
        </Stack>
      </Box>

      {/* Recent Activity */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <Paper sx={{ p: 3, flex: 1, minWidth: 300 }}>
          <Typography variant="h6" gutterBottom>
            Recent Test Results
          </Typography>
          {recentResults.results.length ? (
            <Box>
              {recentResults.results.map((result) => (
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

        <Paper sx={{ p: 3, minWidth: 250 }}>
          <Typography variant="h6" gutterBottom>
            System Status
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              Backend Connection
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {backendStatus === 'checking' ? (
                <CircularProgress size={12} />
              ) : (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: backendStatus === 'connected' ? 'success.main' : 'error.main',
                  }}
                />
              )}
              <Typography variant="body2">
                {backendStatus === 'checking' && 'Checking...'}
                {backendStatus === 'connected' && 'Connected'}
                {backendStatus === 'disconnected' && 'Disconnected'}
              </Typography>
            </Box>
          </Box>

          {backendStatus === 'disconnected' && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Start the backend API server on localhost:8000 to enable full functionality.
              <Button 
                size="small" 
                onClick={checkBackend} 
                sx={{ ml: 1 }}
                variant="outlined"
              >
                Retry
              </Button>
            </Alert>
          )}
          
          {backendStatus === 'connected' && (
            <Alert severity="success" sx={{ mt: 2 }}>
              All systems operational. Ready to extract metadata and run tests.
            </Alert>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;
