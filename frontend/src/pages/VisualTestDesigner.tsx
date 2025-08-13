import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Fab,
  Toolbar,
  AppBar,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Tooltip,
  Badge,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Slider,
  Switch,
  FormControlLabel,
  Autocomplete,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Menu,
  MenuList,
  Tab,
  Tabs
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Save,
  PlayArrow,
  Stop,
  Refresh,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  FitScreen,
  Layers,
  Visibility,
  VisibilityOff,
  Mouse,
  TouchApp,
  Keyboard,
  Screenshot,
  Timer,
  CheckCircle,
  RadioButtonUnchecked,
  CropFree,
  FormatColorFill,
  FormatColorText,
  Settings,
  Code,
  Preview,
  Download,
  Upload,
  Share,
  Palette,
  GridOn,
  GridOff,
  AspectRatio,
  SelectAll
} from '@mui/icons-material';

interface VisualElement {
  id: string;
  type: 'click' | 'input' | 'select' | 'wait' | 'assert' | 'screenshot' | 'scroll' | 'hover';
  position: { x: number; y: number };
  size: { width: number; height: number };
  properties: {
    selector?: string;
    value?: string;
    text?: string;
    timeout?: number;
    condition?: string;
    color?: string;
    label?: string;
  };
  connections: string[]; // IDs of connected elements
  layer: number;
  visible: boolean;
  selected: boolean;
}

interface TestFlow {
  id: string;
  name: string;
  description: string;
  elements: VisualElement[];
  canvas: {
    zoom: number;
    pan: { x: number; y: number };
    grid: boolean;
    snap: boolean;
  };
  properties: {
    baseUrl?: string;
    viewport?: { width: number; height: number };
    device?: string;
    browser?: string;
  };
  created: Date;
  modified: Date;
}

const VisualTestDesigner: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [currentFlow, setCurrentFlow] = useState<TestFlow | null>(null);
  const [selectedTool, setSelectedTool] = useState<string>('select');
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [showProperties, setShowProperties] = useState(true);
  const [showLayers, setShowLayers] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [gridVisible, setGridVisible] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [openElementDialog, setOpenElementDialog] = useState(false);
  const [editingElement, setEditingElement] = useState<VisualElement | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // Initialize with a sample flow
  useEffect(() => {
    const sampleFlow: TestFlow = {
      id: 'flow1',
      name: 'User Registration Flow',
      description: 'Visual test for user registration process',
      elements: [
        {
          id: 'elem1',
          type: 'click',
          position: { x: 100, y: 100 },
          size: { width: 120, height: 40 },
          properties: {
            selector: '#register-btn',
            label: 'Click Register',
            color: '#4caf50'
          },
          connections: ['elem2'],
          layer: 1,
          visible: true,
          selected: false
        },
        {
          id: 'elem2',
          type: 'input',
          position: { x: 300, y: 100 },
          size: { width: 150, height: 40 },
          properties: {
            selector: '#email',
            value: 'test@example.com',
            label: 'Enter Email',
            color: '#2196f3'
          },
          connections: ['elem3'],
          layer: 1,
          visible: true,
          selected: false
        },
        {
          id: 'elem3',
          type: 'input',
          position: { x: 500, y: 100 },
          size: { width: 150, height: 40 },
          properties: {
            selector: '#password',
            value: 'password123',
            label: 'Enter Password',
            color: '#2196f3'
          },
          connections: ['elem4'],
          layer: 1,
          visible: true,
          selected: false
        },
        {
          id: 'elem4',
          type: 'click',
          position: { x: 700, y: 100 },
          size: { width: 120, height: 40 },
          properties: {
            selector: '#submit-btn',
            label: 'Submit Form',
            color: '#4caf50'
          },
          connections: ['elem5'],
          layer: 1,
          visible: true,
          selected: false
        },
        {
          id: 'elem5',
          type: 'assert',
          position: { x: 400, y: 200 },
          size: { width: 160, height: 40 },
          properties: {
            condition: 'url.contains("/welcome")',
            label: 'Assert Success',
            color: '#ff9800'
          },
          connections: [],
          layer: 1,
          visible: true,
          selected: false
        }
      ],
      canvas: {
        zoom: 1,
        pan: { x: 0, y: 0 },
        grid: true,
        snap: true
      },
      properties: {
        baseUrl: 'https://example.com',
        viewport: { width: 1920, height: 1080 },
        device: 'desktop',
        browser: 'chrome'
      },
      created: new Date(),
      modified: new Date()
    };

    setCurrentFlow(sampleFlow);
  }, []);

  const tools = [
    { id: 'select', icon: <Mouse />, label: 'Select', shortcut: 'V' },
    { id: 'click', icon: <TouchApp />, label: 'Click', shortcut: 'C' },
    { id: 'input', icon: <Keyboard />, label: 'Input', shortcut: 'I' },
    { id: 'select_element', icon: <RadioButtonUnchecked />, label: 'Select Element', shortcut: 'S' },
    { id: 'wait', icon: <Timer />, label: 'Wait', shortcut: 'W' },
    { id: 'assert', icon: <CheckCircle />, label: 'Assert', shortcut: 'A' },
    { id: 'screenshot', icon: <Screenshot />, label: 'Screenshot', shortcut: 'P' }
  ];

  const handleToolChange = (tool: string) => {
    setSelectedTool(tool);
  };

  const handleCanvasClick = (event: React.MouseEvent) => {
    if (!currentFlow || selectedTool === 'select') return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const newElement: VisualElement = {
      id: `elem_${Date.now()}`,
      type: selectedTool as any,
      position: { x: snapToGrid ? Math.round(x / 20) * 20 : x, y: snapToGrid ? Math.round(y / 20) * 20 : y },
      size: { width: 120, height: 40 },
      properties: {
        label: `${selectedTool} element`,
        color: getToolColor(selectedTool)
      },
      connections: [],
      layer: 1,
      visible: true,
      selected: false
    };

    setCurrentFlow(prev => prev ? {
      ...prev,
      elements: [...prev.elements, newElement],
      modified: new Date()
    } : null);

    setEditingElement(newElement);
    setOpenElementDialog(true);
  };

  const getToolColor = (tool: string) => {
    const colors: Record<string, string> = {
      click: '#4caf50',
      input: '#2196f3',
      select_element: '#9c27b0',
      wait: '#ff9800',
      assert: '#f44336',
      screenshot: '#607d8b'
    };
    return colors[tool] || '#757575';
  };

  const getToolIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      click: <TouchApp />,
      input: <Keyboard />,
      select: <RadioButtonUnchecked />,
      wait: <Timer />,
      assert: <CheckCircle />,
      screenshot: <Screenshot />,
      scroll: <Mouse />,
      hover: <Mouse />
    };
    return icons[type] || <Mouse />;
  };

  const handleElementSelect = (elementId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (event.ctrlKey || event.metaKey) {
      // Multi-select
      setSelectedElements(prev => 
        prev.includes(elementId) 
          ? prev.filter(id => id !== elementId)
          : [...prev, elementId]
      );
    } else {
      setSelectedElements([elementId]);
    }
  };

  const handleElementEdit = (element: VisualElement) => {
    setEditingElement(element);
    setOpenElementDialog(true);
  };

  const handleElementDelete = (elementId: string) => {
    if (!currentFlow) return;

    setCurrentFlow(prev => prev ? {
      ...prev,
      elements: prev.elements.filter(el => el.id !== elementId),
      modified: new Date()
    } : null);

    setSelectedElements(prev => prev.filter(id => id !== elementId));
  };

  const handleZoomChange = (newZoom: number) => {
    setZoom(Math.max(25, Math.min(400, newZoom)));
  };

  const generateCode = () => {
    if (!currentFlow) return '';

    const elements = currentFlow.elements.sort((a, b) => {
      // Sort by connections to create logical flow
      return a.position.x - b.position.x;
    });

    let code = `// Generated test code for: ${currentFlow.name}\n`;
    code += `// Description: ${currentFlow.description}\n\n`;
    code += `describe('${currentFlow.name}', () => {\n`;
    code += `  beforeEach(() => {\n`;
    code += `    cy.visit('${currentFlow.properties.baseUrl || 'https://example.com'}');\n`;
    if (currentFlow.properties.viewport) {
      code += `    cy.viewport(${currentFlow.properties.viewport.width}, ${currentFlow.properties.viewport.height});\n`;
    }
    code += `  });\n\n`;
    code += `  it('should complete the user flow', () => {\n`;

    elements.forEach((element, index) => {
      const indent = '    ';
      switch (element.type) {
        case 'click':
          code += `${indent}cy.get('${element.properties.selector || 'button'}').click();\n`;
          break;
        case 'input':
          code += `${indent}cy.get('${element.properties.selector || 'input'}').type('${element.properties.value || 'test'}');\n`;
          break;
        case 'select':
          code += `${indent}cy.get('${element.properties.selector || 'select'}').select('${element.properties.value || 'option'}');\n`;
          break;
        case 'wait':
          code += `${indent}cy.wait(${element.properties.timeout || 1000});\n`;
          break;
        case 'assert':
          code += `${indent}cy.${element.properties.condition || 'url().should("contain", "/success")'};\n`;
          break;
        case 'screenshot':
          code += `${indent}cy.screenshot('${element.properties.label || `step-${index + 1}`}');\n`;
          break;
      }
    });

    code += `  });\n`;
    code += `});\n`;

    return code;
  };

  const ToolPanel = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Tools
      </Typography>
      <ToggleButtonGroup
        value={selectedTool}
        exclusive
        onChange={(e, value) => value && handleToolChange(value)}
        orientation="vertical"
        fullWidth
      >
        {tools.map((tool) => (
          <ToggleButton key={tool.id} value={tool.id}>
            <Tooltip title={`${tool.label} (${tool.shortcut})`} placement="right">
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                {tool.icon}
                <Typography sx={{ ml: 1 }}>{tool.label}</Typography>
              </Box>
            </Tooltip>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Paper>
  );

  const PropertiesPanel = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Properties
      </Typography>
      {selectedElements.length === 1 && currentFlow ? (
        <Box>
          {(() => {
            const element = currentFlow.elements.find(el => el.id === selectedElements[0]);
            if (!element) return null;

            return (
              <Stack spacing={2}>
                <TextField
                  label="Label"
                  value={element.properties.label || ''}
                  onChange={(e) => {
                    setCurrentFlow(prev => prev ? {
                      ...prev,
                      elements: prev.elements.map(el =>
                        el.id === element.id
                          ? { ...el, properties: { ...el.properties, label: e.target.value } }
                          : el
                      )
                    } : null);
                  }}
                  size="small"
                  fullWidth
                />
                
                <TextField
                  label="Selector"
                  value={element.properties.selector || ''}
                  onChange={(e) => {
                    setCurrentFlow(prev => prev ? {
                      ...prev,
                      elements: prev.elements.map(el =>
                        el.id === element.id
                          ? { ...el, properties: { ...el.properties, selector: e.target.value } }
                          : el
                      )
                    } : null);
                  }}
                  size="small"
                  fullWidth
                />

                {(element.type === 'input' || element.type === 'select') && (
                  <TextField
                    label="Value"
                    value={element.properties.value || ''}
                    onChange={(e) => {
                      setCurrentFlow(prev => prev ? {
                        ...prev,
                        elements: prev.elements.map(el =>
                          el.id === element.id
                            ? { ...el, properties: { ...el.properties, value: e.target.value } }
                            : el
                        )
                      } : null);
                    }}
                    size="small"
                    fullWidth
                  />
                )}

                {element.type === 'wait' && (
                  <TextField
                    label="Timeout (ms)"
                    type="number"
                    value={element.properties.timeout || 1000}
                    onChange={(e) => {
                      setCurrentFlow(prev => prev ? {
                        ...prev,
                        elements: prev.elements.map(el =>
                          el.id === element.id
                            ? { ...el, properties: { ...el.properties, timeout: parseInt(e.target.value) } }
                            : el
                        )
                      } : null);
                    }}
                    size="small"
                    fullWidth
                  />
                )}

                {element.type === 'assert' && (
                  <TextField
                    label="Condition"
                    value={element.properties.condition || ''}
                    onChange={(e) => {
                      setCurrentFlow(prev => prev ? {
                        ...prev,
                        elements: prev.elements.map(el =>
                          el.id === element.id
                            ? { ...el, properties: { ...el.properties, condition: e.target.value } }
                            : el
                        )
                      } : null);
                    }}
                    size="small"
                    fullWidth
                    multiline
                    rows={2}
                  />
                )}

                <Button
                  onClick={() => handleElementDelete(element.id)}
                  color="error"
                  size="small"
                  startIcon={<Delete />}
                >
                  Delete Element
                </Button>
              </Stack>
            );
          })()}
        </Box>
      ) : selectedElements.length > 1 ? (
        <Typography variant="body2" color="text.secondary">
          Multiple elements selected
        </Typography>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No element selected
        </Typography>
      )}
    </Paper>
  );

  const LayersPanel = () => (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Layers
      </Typography>
      {currentFlow && (
        <List dense>
          {currentFlow.elements.map((element) => (
            <ListItem
              key={element.id}
              selected={selectedElements.includes(element.id)}
              onClick={() => setSelectedElements([element.id])}
              sx={{ cursor: 'pointer' }}
            >
              <ListItemIcon>
                {getToolIcon(element.type)}
              </ListItemIcon>
              <ListItemText
                primary={element.properties.label || `${element.type} ${element.id.slice(-4)}`}
                secondary={`${element.type} • ${element.position.x}, ${element.position.y}`}
              />
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentFlow(prev => prev ? {
                    ...prev,
                    elements: prev.elements.map(el =>
                      el.id === element.id ? { ...el, visible: !el.visible } : el
                    )
                  } : null);
                }}
              >
                {element.visible ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Toolbar */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar variant="dense">
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Visual Test Designer - {currentFlow?.name || 'Untitled'}
          </Typography>
          
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Zoom Out">
              <IconButton
                size="small"
                onClick={() => handleZoomChange(zoom - 25)}
                disabled={zoom <= 25}
              >
                <ZoomOut />
              </IconButton>
            </Tooltip>
            
            <Typography variant="body2" sx={{ minWidth: 50, textAlign: 'center' }}>
              {zoom}%
            </Typography>
            
            <Tooltip title="Zoom In">
              <IconButton
                size="small"
                onClick={() => handleZoomChange(zoom + 25)}
                disabled={zoom >= 400}
              >
                <ZoomIn />
              </IconButton>
            </Tooltip>

            <Tooltip title="Fit to Screen">
              <IconButton size="small" onClick={() => setZoom(100)}>
                <FitScreen />
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem />

            <Tooltip title="Toggle Grid">
              <IconButton
                size="small"
                onClick={() => setGridVisible(!gridVisible)}
                color={gridVisible ? 'primary' : 'default'}
              >
                {gridVisible ? <GridOn /> : <GridOff />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Snap to Grid">
              <IconButton
                size="small"
                onClick={() => setSnapToGrid(!snapToGrid)}
                color={snapToGrid ? 'primary' : 'default'}
              >
                <AspectRatio />
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem />

            <Tooltip title="Run Test">
              <IconButton size="small" color="primary">
                <PlayArrow />
              </IconButton>
            </Tooltip>

            <Tooltip title="Save Flow">
              <IconButton size="small">
                <Save />
              </IconButton>
            </Tooltip>

            <Tooltip title="Export Code">
              <IconButton size="small">
                <Code />
              </IconButton>
            </Tooltip>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {/* Left Sidebar */}
        <Box sx={{ width: 280, borderRight: 1, borderColor: 'divider', overflow: 'auto' }}>
          <Box sx={{ p: 2 }}>
            <ToolPanel />
            {showProperties && <PropertiesPanel />}
            {showLayers && <LayersPanel />}
          </Box>
        </Box>

        {/* Canvas Area */}
        <Box sx={{ flexGrow: 1, position: 'relative', overflow: 'hidden' }}>
          <Box
            ref={canvasRef}
            onClick={handleCanvasClick}
            sx={{
              width: '100%',
              height: '100%',
              position: 'relative',
              cursor: selectedTool === 'select' ? 'default' : 'crosshair',
              backgroundImage: gridVisible 
                ? 'radial-gradient(circle, #ccc 1px, transparent 1px)'
                : 'none',
              backgroundSize: gridVisible ? '20px 20px' : 'auto',
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top left',
              overflow: 'visible'
            }}
          >
            {/* Render elements */}
            {currentFlow?.elements.map((element) => (
              <Box
                key={element.id}
                onClick={(e) => handleElementSelect(element.id, e)}
                onDoubleClick={() => handleElementEdit(element)}
                sx={{
                  position: 'absolute',
                  left: element.position.x,
                  top: element.position.y,
                  width: element.size.width,
                  height: element.size.height,
                  backgroundColor: element.properties.color || '#757575',
                  border: selectedElements.includes(element.id) ? '2px solid #1976d2' : '1px solid #ccc',
                  borderRadius: 1,
                  display: element.visible ? 'flex' : 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  userSelect: 'none',
                  opacity: 0.9,
                  '&:hover': {
                    opacity: 1,
                    boxShadow: 2
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {getToolIcon(element.type)}
                  <Typography variant="caption" sx={{ color: 'white' }}>
                    {element.properties.label || element.type}
                  </Typography>
                </Box>
              </Box>
            ))}

            {/* Render connections */}
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0
              }}
            >
              {currentFlow?.elements.map((element) =>
                element.connections.map((connectionId) => {
                  const targetElement = currentFlow.elements.find(el => el.id === connectionId);
                  if (!targetElement) return null;

                  const startX = element.position.x + element.size.width / 2;
                  const startY = element.position.y + element.size.height / 2;
                  const endX = targetElement.position.x + targetElement.size.width / 2;
                  const endY = targetElement.position.y + targetElement.size.height / 2;

                  return (
                    <line
                      key={`${element.id}-${connectionId}`}
                      x1={startX}
                      y1={startY}
                      x2={endX}
                      y2={endY}
                      stroke="#666"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                    />
                  );
                })
              )}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
                </marker>
              </defs>
            </svg>
          </Box>
        </Box>

        {/* Right Sidebar - Code Preview */}
        <Box sx={{ width: 400, borderLeft: 1, borderColor: 'divider', overflow: 'hidden' }}>
          <Paper sx={{ height: '100%' }}>
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
              <Tab label="Code" />
              <Tab label="Preview" />
            </Tabs>
            
            {tabValue === 0 && (
              <Box sx={{ p: 2, height: 'calc(100% - 48px)', overflow: 'auto' }}>
                <Typography variant="h6" gutterBottom>
                  Generated Code
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.100', fontFamily: 'monospace', fontSize: '12px' }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {generateCode()}
                  </pre>
                </Paper>
              </Box>
            )}
            
            {tabValue === 1 && (
              <Box sx={{ p: 2, height: 'calc(100% - 48px)', overflow: 'auto' }}>
                <Typography variant="h6" gutterBottom>
                  Test Preview
                </Typography>
                <Alert severity="info">
                  Preview functionality coming soon! This will show a simulated test execution.
                </Alert>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Element Properties Dialog */}
      <Dialog
        open={openElementDialog}
        onClose={() => setOpenElementDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Element Properties</DialogTitle>
        <DialogContent>
          {editingElement && (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField
                label="Element Type"
                value={editingElement.type}
                disabled
                fullWidth
              />
              <TextField
                label="Label"
                value={editingElement.properties.label || ''}
                onChange={(e) => setEditingElement(prev => prev ? {
                  ...prev,
                  properties: { ...prev.properties, label: e.target.value }
                } : null)}
                fullWidth
              />
              <TextField
                label="CSS Selector"
                value={editingElement.properties.selector || ''}
                onChange={(e) => setEditingElement(prev => prev ? {
                  ...prev,
                  properties: { ...prev.properties, selector: e.target.value }
                } : null)}
                fullWidth
              />
              {(editingElement.type === 'input' || editingElement.type === 'select') && (
                <TextField
                  label="Value"
                  value={editingElement.properties.value || ''}
                  onChange={(e) => setEditingElement(prev => prev ? {
                    ...prev,
                    properties: { ...prev.properties, value: e.target.value }
                  } : null)}
                  fullWidth
                />
              )}
              {editingElement.type === 'assert' && (
                <TextField
                  label="Assertion Condition"
                  value={editingElement.properties.condition || ''}
                  onChange={(e) => setEditingElement(prev => prev ? {
                    ...prev,
                    properties: { ...prev.properties, condition: e.target.value }
                  } : null)}
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="e.g., url().should('contain', '/success')"
                />
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenElementDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (editingElement && currentFlow) {
                setCurrentFlow(prev => prev ? {
                  ...prev,
                  elements: prev.elements.map(el =>
                    el.id === editingElement.id ? editingElement : el
                  ),
                  modified: new Date()
                } : null);
              }
              setOpenElementDialog(false);
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VisualTestDesigner;
