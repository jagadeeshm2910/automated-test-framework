import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  Divider,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Description as ExtractIcon,
  AutoAwesome as DataGenIcon,
  PlayArrow as TestIcon,
  Analytics as AnalyticsIcon,
  Assessment as ResultsIcon,
  Notifications as NotificationIcon,
  Settings as SettingsIcon,
  Star as ShowcaseIcon,
  AccountTree as PipelineIcon,
  LiveTv as MonitorIcon,
  Psychology as AIIcon,
  Tune as ConfigIcon,
  Storage as DataIcon,
  BarChart as ReportIcon,
  Cloud as EnvironmentIcon,
  CalendarToday as SchedulerIcon,
  DesignServices as VisualDesignerIcon,
  MonitorHeart as HealthIcon,
  Speed as PerformanceIcon,
  Api as ApiIcon,
  TrendingUp as AdvancedAnalyticsIcon,
  Build as BuildIcon,
  Group as CollaborationIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

interface LayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/', section: 'main' },
  { text: 'Extract Forms', icon: <ExtractIcon />, path: '/extract', section: 'main' },
  { text: 'Generate Data', icon: <DataGenIcon />, path: '/data-generation', section: 'main' },
  { text: 'Test Runs', icon: <TestIcon />, path: '/tests', section: 'testing' },
  { text: 'Test Config', icon: <ConfigIcon />, path: '/test-config', section: 'testing' },
  { text: 'Pipeline Builder', icon: <PipelineIcon />, path: '/pipeline-builder', section: 'testing' },
  { text: 'Framework Builder', icon: <BuildIcon />, path: '/framework-builder', section: 'testing' },
  { text: 'Real-time Monitor', icon: <MonitorIcon />, path: '/monitor', section: 'testing' },
  { text: 'Data Manager', icon: <DataIcon />, path: '/data-manager', section: 'testing' },
  { text: 'Environments', icon: <EnvironmentIcon />, path: '/environments', section: 'testing' },
  { text: 'Scheduler', icon: <SchedulerIcon />, path: '/scheduler', section: 'testing' },
  { text: 'Visual Designer', icon: <VisualDesignerIcon />, path: '/visual-designer', section: 'testing' },
  { text: 'System Health', icon: <HealthIcon />, path: '/system-health', section: 'testing' },
  { text: 'Performance Monitor', icon: <PerformanceIcon />, path: '/performance-monitor', section: 'testing' },
  { text: 'API Integration', icon: <ApiIcon />, path: '/api-integration', section: 'testing' },
  { text: 'Collaboration', icon: <CollaborationIcon />, path: '/collaboration', section: 'testing' },
  { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics', section: 'analysis' },
  { text: 'Results', icon: <ResultsIcon />, path: '/results', section: 'analysis' },
  { text: 'Reporting', icon: <ReportIcon />, path: '/reporting', section: 'analysis' },
  { text: 'AI Insights', icon: <AIIcon />, path: '/ai-insights', section: 'analysis' },
  { text: 'Advanced Analytics', icon: <AdvancedAnalyticsIcon />, path: '/advanced-analytics', section: 'analysis' },
  { text: 'Feature Showcase', icon: <ShowcaseIcon />, path: '/showcase', section: 'other' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings', section: 'other' },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useAppContext();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileOpen(false); // Close mobile drawer
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          UI Testing Framework
        </Typography>
      </Toolbar>
      <Divider />
      
      {/* Main Section */}
      <Typography variant="overline" sx={{ px: 2, py: 1, color: 'text.secondary', fontSize: '0.75rem' }}>
        Main
      </Typography>
      <List>
        {navigationItems.filter(item => item.section === 'main').map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main + '20',
                  borderRight: `3px solid ${theme.palette.primary.main}`,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.main + '30',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path 
                    ? theme.palette.primary.main 
                    : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                sx={{
                  color: location.pathname === item.path 
                    ? theme.palette.primary.main 
                    : 'inherit',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Divider />
      
      {/* Testing Section */}
      <Typography variant="overline" sx={{ px: 2, py: 1, color: 'text.secondary', fontSize: '0.75rem' }}>
        Testing
      </Typography>
      <List>
        {navigationItems.filter(item => item.section === 'testing').map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main + '20',
                  borderRight: `3px solid ${theme.palette.primary.main}`,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.main + '30',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path 
                    ? theme.palette.primary.main 
                    : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                sx={{
                  color: location.pathname === item.path 
                    ? theme.palette.primary.main 
                    : 'inherit',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Divider />
      
      {/* Analysis Section */}
      <Typography variant="overline" sx={{ px: 2, py: 1, color: 'text.secondary', fontSize: '0.75rem' }}>
        Analysis
      </Typography>
      <List>
        {navigationItems.filter(item => item.section === 'analysis').map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main + '20',
                  borderRight: `3px solid ${theme.palette.primary.main}`,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.main + '30',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path 
                    ? theme.palette.primary.main 
                    : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                sx={{
                  color: location.pathname === item.path 
                    ? theme.palette.primary.main 
                    : 'inherit',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Divider />
      
      {/* Other Section */}
      <List>
        {navigationItems.filter(item => item.section === 'other').map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main + '20',
                  borderRight: `3px solid ${theme.palette.primary.main}`,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.main + '30',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path 
                    ? theme.palette.primary.main 
                    : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                sx={{
                  color: location.pathname === item.path 
                    ? theme.palette.primary.main 
                    : 'inherit',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {navigationItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
          </Typography>
          
          {/* Connection Status Indicator */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: state.connected ? 'success.main' : 'error.main',
                mr: 1,
              }}
            />
            <Typography variant="body2">
              {state.connected ? 'Connected' : 'Disconnected'}
            </Typography>
          </Box>

          {/* Notifications */}
          <IconButton color="inherit">
            <Badge badgeContent={state.notifications.length} color="secondary">
              <NotificationIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="navigation"
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth 
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth 
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Toolbar />
        {state.loading && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: 4,
              backgroundColor: theme.palette.primary.main,
              zIndex: theme.zIndex.modal + 1,
              animation: 'loading-pulse 1.5s ease-in-out infinite',
              '@keyframes loading-pulse': {
                '0%': { opacity: 0.6 },
                '50%': { opacity: 1 },
                '100%': { opacity: 0.6 },
              },
            }}
          />
        )}
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
