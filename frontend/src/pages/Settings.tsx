import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Stack,
  Divider,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Paper,
  Slider,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  BugReport,
  Save,
  Delete,
  Edit,
  Add,
  Visibility,
  VisibilityOff,
  Psychology,
  Code,
  Cloud,
  Speed,
  RestartAlt,
  Science,
} from '@mui/icons-material';

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
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const Settings: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [settings, setSettings] = useState({
    // General Settings
    autoRefresh: true,
    refreshInterval: 30,
    darkMode: false,
    notifications: true,
    
    // Test Settings
    defaultTimeout: 30000,
    maxRetries: 3,
    takeScreenshots: true,
    parallelTests: false,
    defaultBrowser: 'chrome',
    
    // AI Settings
    useAI: true,
    aiModel: 'llama',
    dataGenCount: 5,
    
    // Performance Settings
    maxConcurrentTests: 5,
    cacheEnabled: true,
    compressionEnabled: true,
    
    // API Settings
    apiBaseUrl: 'http://localhost:8000',
    apiTimeout: 30000,
    retryFailedRequests: true,
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    // Save settings to local storage or API
    localStorage.setItem('framework-settings', JSON.stringify(settings));
    // Show success notification
  };

  const handleResetToDefaults = () => {
    // Reset to default settings
    setSettings({
      autoRefresh: true,
      refreshInterval: 30,
      darkMode: false,
      notifications: true,
      defaultTimeout: 30000,
      maxRetries: 3,
      takeScreenshots: true,
      parallelTests: false,
      defaultBrowser: 'chrome',
      useAI: true,
      aiModel: 'llama',
      dataGenCount: 5,
      maxConcurrentTests: 5,
      cacheEnabled: true,
      compressionEnabled: true,
      apiBaseUrl: 'http://localhost:8000',
      apiTimeout: 30000,
      retryFailedRequests: true,
    });
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Configure your UI testing framework preferences
          </Typography>
        </Box>
        
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RestartAlt />}
            onClick={handleResetToDefaults}
          >
            Reset Defaults
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSaveSettings}
          >
            Save Changes
          </Button>
        </Box>
      </Box>

      {/* Settings Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab icon={<SettingsIcon />} label="General" />
          <Tab icon={<Science />} label="Testing" />
          <Tab icon={<Psychology />} label="AI & Data" />
          <Tab icon={<Speed />} label="Performance" />
          <Tab icon={<Cloud />} label="API" />
        </Tabs>
      </Box>

      {/* General Settings */}
      <TabPanel value={currentTab} index={0}>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 50%', minWidth: '300px' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Interface Settings
                </Typography>
                
                <Stack spacing={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.autoRefresh}
                        onChange={(e) => handleSettingChange('autoRefresh', e.target.checked)}
                      />
                    }
                    label="Auto-refresh dashboard"
                  />
                  
                  <Box>
                    <Typography gutterBottom>
                      Refresh Interval (seconds)
                    </Typography>
                    <Slider
                      value={settings.refreshInterval}
                      onChange={(_e, value) => handleSettingChange('refreshInterval', value)}
                      min={5}
                      max={300}
                      marks={[
                        { value: 5, label: '5s' },
                        { value: 30, label: '30s' },
                        { value: 60, label: '1m' },
                        { value: 300, label: '5m' },
                      ]}
                      valueLabelDisplay="auto"
                    />
                  </Box>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.darkMode}
                        onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                      />
                    }
                    label="Dark mode"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications}
                        onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                      />
                    }
                    label="Enable notifications"
                  />
                </Stack>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: '1 1 50%', minWidth: '300px' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Data Management
                </Typography>
                
                <Stack spacing={2}>
                  <Alert severity="info">
                    All test data is stored locally and can be exported at any time.
                  </Alert>
                  
                  <Button variant="outlined" startIcon={<BugReport />}>
                    Export Test Results
                  </Button>
                  
                  <Button variant="outlined" startIcon={<Code />}>
                    Export Configuration
                  </Button>
                  
                  <Divider />
                  
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    Clear All Data
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </TabPanel>

      {/* Testing Settings */}
      <TabPanel value={currentTab} index={1}>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 50%', minWidth: '300px' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Test Execution
                </Typography>
                
                <Stack spacing={3}>
                  <TextField
                    label="Default Timeout (ms)"
                    type="number"
                    value={settings.defaultTimeout}
                    onChange={(e) => handleSettingChange('defaultTimeout', parseInt(e.target.value))}
                    fullWidth
                  />
                  
                  <TextField
                    label="Max Retries"
                    type="number"
                    value={settings.maxRetries}
                    onChange={(e) => handleSettingChange('maxRetries', parseInt(e.target.value))}
                    fullWidth
                  />
                  
                  <FormControl fullWidth>
                    <InputLabel>Default Browser</InputLabel>
                    <Select
                      value={settings.defaultBrowser}
                      onChange={(e) => handleSettingChange('defaultBrowser', e.target.value)}
                      label="Default Browser"
                    >
                      <MenuItem value="chrome">Chrome</MenuItem>
                      <MenuItem value="firefox">Firefox</MenuItem>
                      <MenuItem value="safari">Safari</MenuItem>
                      <MenuItem value="edge">Edge</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.takeScreenshots}
                        onChange={(e) => handleSettingChange('takeScreenshots', e.target.checked)}
                      />
                    }
                    label="Take screenshots during tests"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.parallelTests}
                        onChange={(e) => handleSettingChange('parallelTests', e.target.checked)}
                      />
                    }
                    label="Enable parallel test execution"
                  />
                </Stack>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: '1 1 50%', minWidth: '300px' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Test Scenarios
                </Typography>
                
                <Stack spacing={2}>
                  <Typography variant="body2" color="text.secondary">
                    Configure default test scenarios and their priorities
                  </Typography>
                  
                  <List>
                    {['Valid Data', 'Invalid Data', 'Edge Cases', 'Boundary Tests', 'Security Tests'].map((scenario, index) => (
                      <ListItem key={scenario}>
                        <ListItemText
                          primary={scenario}
                          secondary={`Priority: ${5 - index}`}
                        />
                        <ListItemSecondaryAction>
                          <Chip label="Enabled" color="success" size="small" />
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                  
                  <Button variant="outlined" startIcon={<Add />}>
                    Add Custom Scenario
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </TabPanel>

      {/* AI & Data Settings */}
      <TabPanel value={currentTab} index={2}>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 50%', minWidth: '300px' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  AI Configuration
                </Typography>
                
                <Stack spacing={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.useAI}
                        onChange={(e) => handleSettingChange('useAI', e.target.checked)}
                      />
                    }
                    label="Enable AI-powered data generation"
                  />
                  
                  <FormControl fullWidth disabled={!settings.useAI}>
                    <InputLabel>AI Model</InputLabel>
                    <Select
                      value={settings.aiModel}
                      onChange={(e) => handleSettingChange('aiModel', e.target.value)}
                      label="AI Model"
                    >
                      <MenuItem value="llama">Llama 2</MenuItem>
                      <MenuItem value="gpt">GPT-3.5</MenuItem>
                      <MenuItem value="claude">Claude</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <TextField
                    label="Data Generation Count"
                    type="number"
                    value={settings.dataGenCount}
                    onChange={(e) => handleSettingChange('dataGenCount', parseInt(e.target.value))}
                    fullWidth
                    disabled={!settings.useAI}
                  />
                  
                  <Alert severity="info">
                    AI features require a connection to the configured AI service.
                  </Alert>
                </Stack>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: '1 1 50%', minWidth: '300px' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Data Generation Rules
                </Typography>
                
                <Stack spacing={2}>
                  <Typography variant="body2" color="text.secondary">
                    Configure rules for generating realistic test data
                  </Typography>
                  
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="body2" fontFamily="monospace">
                      {JSON.stringify({
                        email: "realistic@domain.com",
                        phone: "+1-555-0123",
                        date: "YYYY-MM-DD",
                        number: "1-9999"
                      }, null, 2)}
                    </Typography>
                  </Paper>
                  
                  <Button variant="outlined" startIcon={<Edit />}>
                    Edit Generation Rules
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </TabPanel>

      {/* Performance Settings */}
      <TabPanel value={currentTab} index={3}>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 50%', minWidth: '300px' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Performance Optimization
                </Typography>
                
                <Stack spacing={3}>
                  <TextField
                    label="Max Concurrent Tests"
                    type="number"
                    value={settings.maxConcurrentTests}
                    onChange={(e) => handleSettingChange('maxConcurrentTests', parseInt(e.target.value))}
                    fullWidth
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.cacheEnabled}
                        onChange={(e) => handleSettingChange('cacheEnabled', e.target.checked)}
                      />
                    }
                    label="Enable result caching"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.compressionEnabled}
                        onChange={(e) => handleSettingChange('compressionEnabled', e.target.checked)}
                      />
                    }
                    label="Enable data compression"
                  />
                </Stack>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: '1 1 50%', minWidth: '300px' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Resource Usage
                </Typography>
                
                <Stack spacing={2}>
                  <Typography variant="body2" color="text.secondary">
                    Current system resource utilization
                  </Typography>
                  
                  <Box>
                    <Typography variant="body2">CPU Usage</Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box flex={1} bgcolor="grey.200" borderRadius={1} height={8}>
                        <Box
                          bgcolor="primary.main"
                          height="100%"
                          borderRadius={1}
                          width="45%"
                        />
                      </Box>
                      <Typography variant="caption">45%</Typography>
                    </Box>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2">Memory Usage</Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box flex={1} bgcolor="grey.200" borderRadius={1} height={8}>
                        <Box
                          bgcolor="warning.main"
                          height="100%"
                          borderRadius={1}
                          width="67%"
                        />
                      </Box>
                      <Typography variant="caption">67%</Typography>
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </TabPanel>

      {/* API Settings */}
      <TabPanel value={currentTab} index={4}>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 50%', minWidth: '300px' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  API Configuration
                </Typography>
                
                <Stack spacing={3}>
                  <TextField
                    label="API Base URL"
                    value={settings.apiBaseUrl}
                    onChange={(e) => handleSettingChange('apiBaseUrl', e.target.value)}
                    fullWidth
                  />
                  
                  <TextField
                    label="API Timeout (ms)"
                    type="number"
                    value={settings.apiTimeout}
                    onChange={(e) => handleSettingChange('apiTimeout', parseInt(e.target.value))}
                    fullWidth
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.retryFailedRequests}
                        onChange={(e) => handleSettingChange('retryFailedRequests', e.target.checked)}
                      />
                    }
                    label="Retry failed API requests"
                  />
                  
                  <Box>
                    <TextField
                      label="API Key"
                      type={showApiKey ? 'text' : 'password'}
                      fullWidth
                      InputProps={{
                        endAdornment: (
                          <IconButton
                            onClick={() => setShowApiKey(!showApiKey)}
                            edge="end"
                          >
                            {showApiKey ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        ),
                      }}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: '1 1 50%', minWidth: '300px' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Connection Status
                </Typography>
                
                <Stack spacing={2}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      width={12}
                      height={12}
                      borderRadius="50%"
                      bgcolor="success.main"
                    />
                    <Typography variant="body2">
                      Backend API Connected
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      width={12}
                      height={12}
                      borderRadius="50%"
                      bgcolor="warning.main"
                    />
                    <Typography variant="body2">
                      AI Service Connected
                    </Typography>
                  </Box>
                  
                  <Button variant="outlined">
                    Test Connection
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </TabPanel>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Clear All Data</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to clear all test data? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button color="error" variant="contained">
            Clear Data
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;