import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';

// Components
import Layout from './components/Layout/Layout';
import NotificationManager from './components/NotificationManager';
import Dashboard from './pages/DashboardEnhanced';
import ExtractForm from './pages/ExtractFormSimple';
import TestRuns from './pages/TestRunsSimple';
import Analytics from './pages/AnalyticsEnhanced';
import Results from './pages/ResultsSimple';
import DataGeneration from './pages/DataGeneration';
import Settings from './pages/Settings';
import FeatureShowcase from './pages/FeatureShowcase';
import TestPipelineBuilder from './pages/TestPipelineBuilder';
import RealTimeMonitor from './pages/RealTimeMonitor';
import AIDataInsights from './pages/AIDataInsights';
import TestConfigurationManager from './pages/TestConfigurationManager';
import TestDataManager from './pages/TestDataManager';
import TestReporting from './pages/TestReporting';
import EnvironmentManager from './pages/EnvironmentManager';
import TestScheduler from './pages/TestScheduler';
import VisualTestDesigner from './pages/VisualTestDesigner';
import SystemHealthMonitor from './pages/SystemHealthMonitor';
import PerformanceMonitor from './pages/PerformanceMonitor';
import APIIntegrationManager from './pages/APIIntegrationManager';
import AdvancedAnalytics from './pages/AdvancedAnalytics';
import TestFrameworkBuilder from './pages/TestFrameworkBuilder';
import TestCollaborationHub from './pages/TestCollaborationHub';
import { AppProvider } from './contexts/AppContext';

// Create a client with enhanced configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Create theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppProvider>
          <Router>
            <Box sx={{ display: 'flex', minHeight: '100vh' }}>
              <Layout>
                <NotificationManager />
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/extract" element={<ExtractForm />} />
                  <Route path="/data-generation" element={<DataGeneration />} />
                  <Route path="/tests" element={<TestRuns />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/results" element={<Results />} />
                  <Route path="/results/:testRunId" element={<Results />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/showcase" element={<FeatureShowcase />} />
                  <Route path="/pipeline-builder" element={<TestPipelineBuilder />} />
                  <Route path="/monitor" element={<RealTimeMonitor />} />
                  <Route path="/ai-insights" element={<AIDataInsights />} />
                  <Route path="/test-config" element={<TestConfigurationManager />} />
                  <Route path="/data-manager" element={<TestDataManager />} />
                  <Route path="/reporting" element={<TestReporting />} />
                  <Route path="/environments" element={<EnvironmentManager />} />
                  <Route path="/scheduler" element={<TestScheduler />} />
                  <Route path="/visual-designer" element={<VisualTestDesigner />} />
                  <Route path="/system-health" element={<SystemHealthMonitor />} />
                  <Route path="/performance-monitor" element={<PerformanceMonitor />} />
                  <Route path="/api-integration" element={<APIIntegrationManager />} />
                  <Route path="/advanced-analytics" element={<AdvancedAnalytics />} />
                  <Route path="/framework-builder" element={<TestFrameworkBuilder />} />
                  <Route path="/collaboration" element={<TestCollaborationHub />} />
                </Routes>
              </Layout>
            </Box>
          </Router>
        </AppProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App
