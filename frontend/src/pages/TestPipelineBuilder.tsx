import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Grid,
  Alert,
  Fab,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  DragIndicator as DragIcon,
  Timer as DelayIcon,
  VisibilityOff as WaitIcon,
  Input as FormFillIcon,
  TouchApp as ClickIcon,
  Search as ValidateIcon,
  Screenshot as ScreenshotIcon,
  Code as CustomIcon,
  AccountTree as FlowIcon,
  Launch as ExecuteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface PipelineStep {
  id: string;
  type: 'form_fill' | 'click' | 'wait' | 'delay' | 'validate' | 'screenshot' | 'custom';
  title: string;
  config: Record<string, any>;
  position: { x: number; y: number };
}

interface Pipeline {
  id: string;
  name: string;
  description: string;
  steps: PipelineStep[];
  metadata_id?: number;
  schedule?: string;
  enabled: boolean;
}

const stepTypes = [
  { type: 'form_fill', label: 'Fill Form', icon: <FormFillIcon />, color: '#2196F3' },
  { type: 'click', label: 'Click Element', icon: <ClickIcon />, color: '#4CAF50' },
  { type: 'wait', label: 'Wait for Element', icon: <WaitIcon />, color: '#FF9800' },
  { type: 'delay', label: 'Add Delay', icon: <DelayIcon />, color: '#9C27B0' },
  { type: 'validate', label: 'Validate Data', icon: <ValidateIcon />, color: '#F44336' },
  { type: 'screenshot', label: 'Take Screenshot', icon: <ScreenshotIcon />, color: '#607D8B' },
  { type: 'custom', label: 'Custom Code', icon: <CustomIcon />, color: '#795548' },
];

const TestPipelineBuilder: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [pipeline, setPipeline] = useState<Pipeline>({
    id: `pipeline_${Date.now()}`,
    name: 'New Test Pipeline',
    description: '',
    steps: [],
    enabled: true,
  });
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [selectedStep, setSelectedStep] = useState<PipelineStep | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [draggedStep, setDraggedStep] = useState<string | null>(null);
  const [executionStatus, setExecutionStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');

  const addStep = useCallback((type: string, position: { x: number; y: number }) => {
    const stepType = stepTypes.find(st => st.type === type);
    if (!stepType) return;

    const newStep: PipelineStep = {
      id: `step_${Date.now()}`,
      type: type as PipelineStep['type'],
      title: stepType.label,
      config: getDefaultConfig(type),
      position,
    };

    setPipeline(prev => ({
      ...prev,
      steps: [...prev.steps, newStep],
    }));
  }, []);

  const getDefaultConfig = (type: string): Record<string, any> => {
    switch (type) {
      case 'form_fill':
        return { selector: '', data: {}, waitTime: 1000 };
      case 'click':
        return { selector: '', waitAfter: 500 };
      case 'wait':
        return { selector: '', timeout: 5000 };
      case 'delay':
        return { duration: 1000 };
      case 'validate':
        return { selector: '', expectedValue: '', validationType: 'text' };
      case 'screenshot':
        return { name: '', fullPage: false };
      case 'custom':
        return { code: '// Custom JavaScript code', timeout: 5000 };
      default:
        return {};
    }
  };

  const handleStepClick = (step: PipelineStep) => {
    setSelectedStep(step);
    setConfigDialogOpen(true);
  };

  const updateStepConfig = (config: Record<string, any>) => {
    if (!selectedStep) return;

    setPipeline(prev => ({
      ...prev,
      steps: prev.steps.map(step =>
        step.id === selectedStep.id
          ? { ...step, config }
          : step
      ),
    }));
  };

  const deleteStep = (stepId: string) => {
    setPipeline(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId),
    }));
  };

  const handleDragStart = (stepId: string) => {
    setDraggedStep(stepId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedStep || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const position = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    // If it's a new step type, add it
    const stepType = stepTypes.find(st => st.type === draggedStep);
    if (stepType) {
      addStep(draggedStep, position);
    } else {
      // Move existing step
      setPipeline(prev => ({
        ...prev,
        steps: prev.steps.map(step =>
          step.id === draggedStep
            ? { ...step, position }
            : step
        ),
      }));
    }

    setDraggedStep(null);
  };

  const executePipeline = async () => {
    setExecutionStatus('running');
    
    try {
      // Simulate pipeline execution
      await new Promise(resolve => setTimeout(resolve, 3000));
      setExecutionStatus('completed');
      
      setTimeout(() => {
        setExecutionStatus('idle');
      }, 2000);
    } catch (error) {
      setExecutionStatus('error');
      setTimeout(() => {
        setExecutionStatus('idle');
      }, 2000);
    }
  };

  const savePipeline = () => {
    // Save pipeline logic here
    console.log('Saving pipeline:', pipeline);
  };

  const StepConfigDialog = () => {
    if (!selectedStep) return null;

    const config = selectedStep.config;

    return (
      <Dialog open={configDialogOpen} onClose={() => setConfigDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Configure {selectedStep.title}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {selectedStep.type === 'form_fill' && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="CSS Selector"
                    value={config.selector || ''}
                    onChange={(e) => updateStepConfig({ ...config, selector: e.target.value })}
                    helperText="CSS selector for the form element"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Form Data (JSON)"
                    value={JSON.stringify(config.data || {}, null, 2)}
                    onChange={(e) => {
                      try {
                        const data = JSON.parse(e.target.value);
                        updateStepConfig({ ...config, data });
                      } catch {}
                    }}
                    helperText="JSON object with field names and values"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Wait Time (ms)"
                    value={config.waitTime || 1000}
                    onChange={(e) => updateStepConfig({ ...config, waitTime: parseInt(e.target.value) })}
                  />
                </Grid>
              </Grid>
            )}

            {selectedStep.type === 'click' && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="CSS Selector"
                    value={config.selector || ''}
                    onChange={(e) => updateStepConfig({ ...config, selector: e.target.value })}
                    helperText="CSS selector for the element to click"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Wait After Click (ms)"
                    value={config.waitAfter || 500}
                    onChange={(e) => updateStepConfig({ ...config, waitAfter: parseInt(e.target.value) })}
                  />
                </Grid>
              </Grid>
            )}

            {selectedStep.type === 'wait' && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="CSS Selector"
                    value={config.selector || ''}
                    onChange={(e) => updateStepConfig({ ...config, selector: e.target.value })}
                    helperText="CSS selector for the element to wait for"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Timeout (ms)"
                    value={config.timeout || 5000}
                    onChange={(e) => updateStepConfig({ ...config, timeout: parseInt(e.target.value) })}
                  />
                </Grid>
              </Grid>
            )}

            {selectedStep.type === 'delay' && (
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Delay Duration (ms)"
                    value={config.duration || 1000}
                    onChange={(e) => updateStepConfig({ ...config, duration: parseInt(e.target.value) })}
                  />
                </Grid>
              </Grid>
            )}

            {selectedStep.type === 'validate' && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="CSS Selector"
                    value={config.selector || ''}
                    onChange={(e) => updateStepConfig({ ...config, selector: e.target.value })}
                    helperText="CSS selector for the element to validate"
                  />
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    label="Expected Value"
                    value={config.expectedValue || ''}
                    onChange={(e) => updateStepConfig({ ...config, expectedValue: e.target.value })}
                  />
                </Grid>
                <Grid item xs={4}>
                  <FormControl fullWidth>
                    <InputLabel>Validation Type</InputLabel>
                    <Select
                      value={config.validationType || 'text'}
                      onChange={(e) => updateStepConfig({ ...config, validationType: e.target.value })}
                    >
                      <MenuItem value="text">Text Content</MenuItem>
                      <MenuItem value="value">Input Value</MenuItem>
                      <MenuItem value="attribute">Attribute</MenuItem>
                      <MenuItem value="visible">Visibility</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            )}

            {selectedStep.type === 'screenshot' && (
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    label="Screenshot Name"
                    value={config.name || ''}
                    onChange={(e) => updateStepConfig({ ...config, name: e.target.value })}
                    helperText="Name for the screenshot file"
                  />
                </Grid>
                <Grid item xs={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.fullPage || false}
                        onChange={(e) => updateStepConfig({ ...config, fullPage: e.target.checked })}
                      />
                    }
                    label="Full Page"
                  />
                </Grid>
              </Grid>
            )}

            {selectedStep.type === 'custom' && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={8}
                    label="JavaScript Code"
                    value={config.code || ''}
                    onChange={(e) => updateStepConfig({ ...config, code: e.target.value })}
                    helperText="Custom JavaScript code to execute"
                    sx={{ fontFamily: 'monospace' }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Timeout (ms)"
                    value={config.timeout || 5000}
                    onChange={(e) => updateStepConfig({ ...config, timeout: parseInt(e.target.value) })}
                  />
                </Grid>
              </Grid>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => setConfigDialogOpen(false)} variant="contained">
            Save Configuration
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
      {/* Step Library Drawer */}
      <Drawer
        variant="persistent"
        open={drawerOpen}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            position: 'relative',
            height: '100%',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Pipeline Steps
          </Typography>
          
          <List>
            {stepTypes.map((stepType) => (
              <ListItem
                key={stepType.type}
                draggable
                onDragStart={() => handleDragStart(stepType.type)}
                sx={{
                  cursor: 'grab',
                  mb: 1,
                  borderRadius: 1,
                  border: 1,
                  borderColor: 'divider',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  '&:active': {
                    cursor: 'grabbing',
                  },
                }}
              >
                <ListItemIcon sx={{ color: stepType.color }}>
                  {stepType.icon}
                </ListItemIcon>
                <ListItemText primary={stepType.label} />
                <DragIcon sx={{ color: 'action.disabled' }} />
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom>
            Pipeline Settings
          </Typography>
          
          <TextField
            fullWidth
            size="small"
            label="Pipeline Name"
            value={pipeline.name}
            onChange={(e) => setPipeline(prev => ({ ...prev, name: e.target.value }))}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            size="small"
            multiline
            rows={2}
            label="Description"
            value={pipeline.description}
            onChange={(e) => setPipeline(prev => ({ ...prev, description: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={pipeline.enabled}
                onChange={(e) => setPipeline(prev => ({ ...prev, enabled: e.target.checked }))}
              />
            }
            label="Pipeline Enabled"
          />
        </Box>
      </Drawer>

      {/* Main Canvas Area */}
      <Box sx={{ flexGrow: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Toolbar */}
        <Paper
          elevation={1}
          sx={{
            p: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            borderRadius: 0,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <IconButton
            onClick={() => setDrawerOpen(!drawerOpen)}
            size="small"
            color="primary"
          >
            <FlowIcon />
          </IconButton>
          
          <Divider orientation="vertical" flexItem />
          
          <Button
            startIcon={<SaveIcon />}
            onClick={savePipeline}
            size="small"
          >
            Save
          </Button>
          
          <Button
            startIcon={<PlayIcon />}
            onClick={executePipeline}
            disabled={executionStatus === 'running' || pipeline.steps.length === 0}
            variant="contained"
            size="small"
            color={executionStatus === 'completed' ? 'success' : executionStatus === 'error' ? 'error' : 'primary'}
          >
            {executionStatus === 'running' ? 'Running...' : 
             executionStatus === 'completed' ? 'Completed' :
             executionStatus === 'error' ? 'Error' : 'Execute'}
          </Button>

          <Box sx={{ flexGrow: 1 }} />

          <Chip
            label={`${pipeline.steps.length} Steps`}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Paper>

        {/* Canvas */}
        <Box
          ref={canvasRef}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          sx={{
            width: '100%',
            height: 'calc(100% - 64px)',
            position: 'relative',
            backgroundImage: 'radial-gradient(circle, #e0e0e0 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            overflow: 'auto',
          }}
        >
          {pipeline.steps.length === 0 && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                color: 'text.secondary',
              }}
            >
              <FlowIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
              <Typography variant="h6" gutterBottom>
                Start Building Your Test Pipeline
              </Typography>
              <Typography variant="body2">
                Drag steps from the sidebar to create your automated test workflow
              </Typography>
            </Box>
          )}

          {/* Render Steps */}
          {pipeline.steps.map((step, index) => {
            const stepType = stepTypes.find(st => st.type === step.type);
            return (
              <Card
                key={step.id}
                draggable
                onDragStart={() => handleDragStart(step.id)}
                sx={{
                  position: 'absolute',
                  left: step.position.x,
                  top: step.position.y,
                  width: 200,
                  cursor: 'grab',
                  border: 2,
                  borderColor: stepType?.color || 'divider',
                  '&:hover': {
                    boxShadow: 3,
                  },
                  '&:active': {
                    cursor: 'grabbing',
                  },
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ color: stepType?.color, mr: 1 }}>
                      {stepType?.icon}
                    </Box>
                    <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                      {step.title}
                    </Typography>
                    <Chip label={index + 1} size="small" />
                  </Box>
                  
                  {Object.keys(step.config).length > 0 && (
                    <Typography variant="caption" color="text.secondary">
                      {Object.entries(step.config).slice(0, 2).map(([key, value]) => (
                        <div key={key}>
                          {key}: {String(value).substring(0, 20)}
                          {String(value).length > 20 ? '...' : ''}
                        </div>
                      ))}
                    </Typography>
                  )}
                </CardContent>
                
                <CardActions sx={{ p: 1, pt: 0 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleStepClick(step)}
                    color="primary"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => deleteStep(step.id)}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </CardActions>
              </Card>
            );
          })}
        </Box>

        {/* Status Alert */}
        {executionStatus !== 'idle' && (
          <Alert
            severity={
              executionStatus === 'running' ? 'info' :
              executionStatus === 'completed' ? 'success' : 'error'
            }
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              minWidth: 250,
            }}
          >
            {executionStatus === 'running' && 'Pipeline is executing...'}
            {executionStatus === 'completed' && 'Pipeline executed successfully!'}
            {executionStatus === 'error' && 'Pipeline execution failed!'}
          </Alert>
        )}

        {/* Floating Action Button */}
        <Fab
          color="primary"
          sx={{
            position: 'absolute',
            bottom: 16,
            left: 16,
          }}
          onClick={() => navigate('/tests')}
        >
          <ExecuteIcon />
        </Fab>
      </Box>

      <StepConfigDialog />
    </Box>
  );
};

export default TestPipelineBuilder;
