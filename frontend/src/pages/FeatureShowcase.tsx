import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Stack,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import {
  Web,
  Psychology,
  PlayArrow,
  Assessment,
  CheckCircle,
  AutoAwesome,
  Speed,
  Security,
  Code,
  GitHub,
  SmartToy,
  Settings,
  Launch,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'completed' | 'in-progress' | 'planned';
  features: string[];
  demoAction?: () => void;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'info';
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  status,
  features,
  demoAction,
  color = 'primary'
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'warning';
      case 'planned': return 'info';
      default: return 'default';
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Avatar sx={{ bgcolor: `${color}.main` }}>
            {icon}
          </Avatar>
          <Chip
            label={status.replace('-', ' ')}
            color={getStatusColor(status) as any}
            size="small"
          />
        </Box>
        
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          {description}
        </Typography>
        
        <List dense>
          {features.map((feature, index) => (
            <ListItem key={index} sx={{ px: 0 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckCircle color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={feature}
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
      
      {demoAction && (
        <Box p={2} pt={0}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Launch />}
            onClick={demoAction}
          >
            Try Demo
          </Button>
        </Box>
      )}
    </Card>
  );
};

interface WorkflowStepProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  completed?: boolean;
}

const WorkflowStep: React.FC<WorkflowStepProps> = ({ title, description, icon, completed = false }) => (
  <TimelineItem>
    <TimelineSeparator>
      <TimelineDot color={completed ? 'success' : 'grey'}>
        {icon}
      </TimelineDot>
      <TimelineConnector />
    </TimelineSeparator>
    <TimelineContent>
      <Typography variant="h6">{title}</Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </TimelineContent>
  </TimelineItem>
);

const FeatureShowcase: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Form Metadata Extraction',
      description: 'Automatically extract form fields and validation rules from web pages and GitHub repositories using advanced parsing techniques.',
      icon: <Web />,
      status: 'completed' as const,
      color: 'primary' as const,
      features: [
        'Web page form detection',
        'GitHub repository scanning',
        'Field type identification',
        'Validation pattern extraction',
        'CSS selector generation'
      ],
      demoAction: () => navigate('/extract')
    },
    {
      title: 'AI-Powered Data Generation',
      description: 'Generate realistic test data using Llama AI model with customizable scenarios and constraints for comprehensive testing.',
      icon: <Psychology />,
      status: 'completed' as const,
      color: 'secondary' as const,
      features: [
        'Multiple AI scenarios',
        'Custom constraint support',
        'Realistic data patterns',
        'Bulk generation',
        'Field-specific rules'
      ],
      demoAction: () => navigate('/data-generation')
    },
    {
      title: 'Automated Test Execution',
      description: 'Execute comprehensive UI tests with configurable scenarios, real-time monitoring, and detailed result reporting.',
      icon: <PlayArrow />,
      status: 'completed' as const,
      color: 'success' as const,
      features: [
        'Multi-browser support',
        'Parallel execution',
        'Screenshot capture',
        'Real-time monitoring',
        'Error reporting'
      ],
      demoAction: () => navigate('/tests')
    },
    {
      title: 'Advanced Analytics',
      description: 'Comprehensive analytics dashboard with performance metrics, success rate tracking, and failure analysis.',
      icon: <Assessment />,
      status: 'completed' as const,
      color: 'info' as const,
      features: [
        'Interactive charts',
        'Performance trends',
        'Browser distribution',
        'Failure analysis',
        'Export capabilities'
      ],
      demoAction: () => navigate('/analytics')
    },
    {
      title: 'Security Testing',
      description: 'Built-in security testing capabilities to identify vulnerabilities and ensure robust form validation.',
      icon: <Security />,
      status: 'in-progress' as const,
      color: 'warning' as const,
      features: [
        'XSS detection',
        'SQL injection tests',
        'CSRF protection',
        'Input sanitization',
        'Security reporting'
      ]
    },
    {
      title: 'Performance Optimization',
      description: 'Advanced performance testing and optimization features for large-scale testing scenarios.',
      icon: <Speed />,
      status: 'planned' as const,
      color: 'info' as const,
      features: [
        'Load testing',
        'Performance profiling',
        'Resource optimization',
        'Caching strategies',
        'Scalability testing'
      ]
    }
  ];

  const workflowSteps = [
    {
      title: 'Extract Metadata',
      description: 'Scan web pages or GitHub repositories to identify forms and extract field metadata',
      icon: <Web />,
      completed: true
    },
    {
      title: 'Generate Test Data',
      description: 'Use AI to create realistic test data based on extracted field types and constraints',
      icon: <SmartToy />,
      completed: true
    },
    {
      title: 'Execute Tests',
      description: 'Run automated UI tests with generated data across multiple browsers and scenarios',
      icon: <PlayArrow />,
      completed: true
    },
    {
      title: 'Analyze Results',
      description: 'Review test results, screenshots, and performance metrics in detailed analytics',
      icon: <Assessment />,
      completed: true
    }
  ];

  const technicalSpecs = [
    { label: 'Frontend Framework', value: 'React 18 + TypeScript' },
    { label: 'UI Components', value: 'Material-UI v5' },
    { label: 'Backend API', value: 'FastAPI + Python' },
    { label: 'AI Integration', value: 'Llama 2 Model' },
    { label: 'Test Engine', value: 'Playwright + Selenium' },
    { label: 'Database', value: 'SQLite + PostgreSQL' },
    { label: 'Real-time Updates', value: 'WebSocket Support' },
    { label: 'Data Visualization', value: 'Recharts + D3.js' }
  ];

  return (
    <Box>
      {/* Header */}
      <Box textAlign="center" mb={6}>
        <Typography variant="h3" gutterBottom>
          Feature Showcase
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Explore the comprehensive capabilities of our UI Testing Framework
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Chip
            icon={<AutoAwesome />}
            label="AI-Powered"
            color="primary"
            variant="outlined"
          />
          <Chip
            icon={<Speed />}
            label="High Performance"
            color="success"
            variant="outlined"
          />
          <Chip
            icon={<Security />}
            label="Enterprise Ready"
            color="warning"
            variant="outlined"
          />
        </Stack>
      </Box>

      {/* Workflow Overview */}
      <Card sx={{ mb: 6 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom textAlign="center">
            Testing Workflow
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center" paragraph>
            Our streamlined process takes you from form discovery to comprehensive test analysis
          </Typography>
          
          <Timeline position="alternate">
            {workflowSteps.map((step, index) => (
              <WorkflowStep key={index} {...step} />
            ))}
          </Timeline>
        </CardContent>
      </Card>

      {/* Feature Grid */}
      <Typography variant="h5" gutterBottom textAlign="center" mb={3}>
        Core Features
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 3, mb: 6, flexWrap: 'wrap' }}>
        {features.map((feature, index) => (
          <Box key={index} sx={{ flex: '1 1 30%', minWidth: '300px' }}>
            <FeatureCard {...feature} />
          </Box>
        ))}
      </Box>

      {/* Technical Specifications */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 45%', minWidth: '400px' }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Technical Architecture
              </Typography>
              
              <List>
                {technicalSpecs.map((spec, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText
                        primary={spec.label}
                        secondary={spec.value}
                      />
                    </ListItem>
                    {index < technicalSpecs.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ flex: '1 1 45%', minWidth: '400px' }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Getting Started
              </Typography>
              
              <Stepper orientation="vertical">
                <Step active>
                  <StepLabel>
                    <Typography variant="body1">Setup Backend Server</Typography>
                  </StepLabel>
                  <StepContent>
                    <Typography variant="body2" color="text.secondary">
                      Start the FastAPI backend server on port 8000
                    </Typography>
                    <Button size="small" startIcon={<Code />}>
                      View Setup Guide
                    </Button>
                  </StepContent>
                </Step>
                
                <Step active>
                  <StepLabel>
                    <Typography variant="body1">Extract Form Metadata</Typography>
                  </StepLabel>
                  <StepContent>
                    <Typography variant="body2" color="text.secondary">
                      Input a URL or GitHub repository to scan for forms
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<Web />}
                      onClick={() => navigate('/extract')}
                    >
                      Try Extraction
                    </Button>
                  </StepContent>
                </Step>
                
                <Step active>
                  <StepLabel>
                    <Typography variant="body1">Generate Test Data</Typography>
                  </StepLabel>
                  <StepContent>
                    <Typography variant="body2" color="text.secondary">
                      Use AI to create realistic test data for your forms
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<Psychology />}
                      onClick={() => navigate('/data-generation')}
                    >
                      Generate Data
                    </Button>
                  </StepContent>
                </Step>
                
                <Step active>
                  <StepLabel>
                    <Typography variant="body1">Run Tests</Typography>
                  </StepLabel>
                  <StepContent>
                    <Typography variant="body2" color="text.secondary">
                      Execute automated UI tests and view results
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<PlayArrow />}
                      onClick={() => navigate('/tests')}
                    >
                      Start Testing
                    </Button>
                  </StepContent>
                </Step>
              </Stepper>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Call to Action */}
      <Box textAlign="center" mt={6} p={4} bgcolor="grey.50" borderRadius={2}>
        <Typography variant="h5" gutterBottom>
          Ready to Get Started?
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Begin your automated testing journey with our comprehensive framework
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="contained"
            size="large"
            startIcon={<PlayArrow />}
            onClick={() => navigate('/extract')}
          >
            Start Testing
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<GitHub />}
          >
            View Source
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<Settings />}
            onClick={() => navigate('/settings')}
          >
            Configure
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default FeatureShowcase;