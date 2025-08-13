import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Chip,
  Alert,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ListItemText,
  Grid,
} from '@mui/material';
import {
  PlayArrow,
  AutoAwesome,
  DataArray,
  ExpandMore,
  ContentCopy,
  Psychology,
  Preview,
} from '@mui/icons-material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { useAppContext } from '../contexts/AppContext';
import { createNotification } from '../utils/notifications';

interface GeneratedData {
  scenario: string;
  data: Record<string, any>;
  metadata: {
    scenario_type: string;
    field_count: number;
    generated_at: string;
  };
}

const DataGeneration: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { dispatch } = useAppContext();
  
  const metadataId = searchParams.get('metadata_id');
  const [selectedMetadataId, setSelectedMetadataId] = useState<string>(metadataId || '');
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>(['valid', 'invalid']);
  const [countPerScenario, setCountPerScenario] = useState(5);
  const [useAI, setUseAI] = useState(true);
  const [customConstraints, setCustomConstraints] = useState('{}');
  const [generatedData, setGeneratedData] = useState<GeneratedData[]>([]);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedDataItem, setSelectedDataItem] = useState<GeneratedData | null>(null);

  // Fetch all available metadata records for selection
  const { data: allMetadata, isLoading: isLoadingMetadata } = useQuery({
    queryKey: ['all-metadata'],
    queryFn: () => apiService.getAllMetadata(1, 50), // Get first 50 metadata records
  });

  // Fetch specific metadata to understand what fields we're generating data for
  const { data: metadata } = useQuery({
    queryKey: ['metadata', selectedMetadataId],
    queryFn: () => selectedMetadataId ? apiService.getMetadataById(parseInt(selectedMetadataId)) : null,
    enabled: !!selectedMetadataId,
  });

  // Fetch available scenarios
  const { data: availableScenarios } = useQuery({
    queryKey: ['scenarios'],
    queryFn: () => apiService.getAvailableScenarios?.() || Promise.resolve([
      'valid', 'invalid', 'edge_case', 'boundary', 'malicious', 'empty', 'special_chars'
    ]),
  });

  // Generate test data mutation
  const generateDataMutation = useMutation({
    mutationFn: () => {
      if (!selectedMetadataId) throw new Error('No metadata selected');
      
      let constraints = {};
      try {
        constraints = JSON.parse(customConstraints);
      } catch (e) {
        // Use empty constraints if JSON is invalid
      }

      return apiService.generateTestData(parseInt(selectedMetadataId), {
        scenarios: selectedScenarios,
        count_per_scenario: countPerScenario,
        use_ai: useAI,
        custom_constraints: Object.keys(constraints).length > 0 ? constraints : undefined,
      });
    },
    onSuccess: (data) => {
      setGeneratedData(data.generated_data || []);
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: createNotification('Test data generated successfully!', 'success'),
      });
    },
    onError: (error) => {
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: createNotification(
          `Failed to generate test data: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'error'
        ),
      });
    },
  });

  const handleMetadataSelection = (metadataId: string) => {
    setSelectedMetadataId(metadataId);
    setGeneratedData([]); // Clear existing data when switching metadata
    // Update URL to include selected metadata ID
    setSearchParams({ metadata_id: metadataId });
  };

  const handleScenarioToggle = (scenario: string) => {
    setSelectedScenarios(prev => 
      prev.includes(scenario) 
        ? prev.filter(s => s !== scenario)
        : [...prev, scenario]
    );
  };

  const handleCopyData = (data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: createNotification('Data copied to clipboard!', 'info'),
    });
  };

  const handleRunTests = () => {
    if (selectedMetadataId && generatedData.length > 0) {
      navigate(`/tests?metadata_id=${selectedMetadataId}&data_generated=true`);
    }
  };

  // Metadata Selection Component
  const MetadataSelector = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Select Extracted Metadata
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Choose from previously extracted form metadata to generate test data
        </Typography>

        {isLoadingMetadata ? (
          <LinearProgress sx={{ mb: 2 }} />
        ) : (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Select Metadata Record</InputLabel>
            <Select
              value={selectedMetadataId}
              onChange={(e) => handleMetadataSelection(e.target.value)}
              label="Select Metadata Record"
            >
              {allMetadata?.items?.map((record: any) => (
                <MenuItem key={record.id} value={record.id.toString()}>
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="body1">
                      {record.page_url || 'Unknown URL'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {record.fields?.length || 0} fields • 
                      Extracted {new Date(record.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {allMetadata?.items?.length === 0 && (
          <Alert severity="info">
            No extracted metadata found. 
            <Button sx={{ ml: 1 }} onClick={() => navigate('/extract')}>
              Extract Some Data First
            </Button>
          </Alert>
        )}

        {selectedMetadataId && metadata && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Selected: <strong>{metadata.page_url}</strong> 
            ({metadata.fields?.length || 0} form fields)
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  if (!selectedMetadataId) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Test Data Generation
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Generate realistic test data using AI for extracted form metadata
        </Typography>

        <MetadataSelector />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        AI Test Data Generation
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Generate realistic test data using AI for extracted form metadata
      </Typography>

      {/* Compact Metadata Selector */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ pb: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center' }}>
            <Box sx={{ flex: 1 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Selected Metadata</InputLabel>
                <Select
                  value={selectedMetadataId}
                  onChange={(e) => handleMetadataSelection(e.target.value)}
                  label="Selected Metadata"
                >
                  {allMetadata?.items?.map((record: any) => (
                    <MenuItem key={record.id} value={record.id.toString()}>
                      <ListItemText
                        primary={record.page_url || 'Unknown URL'}
                        secondary={`${record.fields?.length || 0} fields • ${new Date(record.created_at).toLocaleDateString()}`}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ minWidth: 200 }}>
              {metadata && (
                <Typography variant="body2" color="text.secondary">
                  <strong>{metadata.fields?.length || 0}</strong> form fields ready for data generation
                </Typography>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* Configuration Panel */}
        <Box sx={{ flex: '1 1 33%', minWidth: '300px' }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Generation Configuration
              </Typography>
              
              {/* AI Toggle */}
              <FormControlLabel
                control={
                  <Switch
                    checked={useAI}
                    onChange={(e) => setUseAI(e.target.checked)}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Psychology />
                    Use AI (Llama Model)
                  </Box>
                }
                sx={{ mb: 2 }}
              />

              {/* Count per scenario */}
              <TextField
                fullWidth
                label="Count per Scenario"
                type="number"
                value={countPerScenario}
                onChange={(e) => setCountPerScenario(Number(e.target.value))}
                inputProps={{ min: 1, max: 50 }}
                sx={{ mb: 2 }}
              />

              {/* Scenario selection */}
              <Typography variant="subtitle2" gutterBottom>
                Test Scenarios
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {(availableScenarios || ['valid', 'invalid', 'edge_case', 'boundary']).map((scenario) => (
                  <Chip
                    key={scenario}
                    label={scenario.replace('_', ' ')}
                    variant={selectedScenarios.includes(scenario) ? 'filled' : 'outlined'}
                    onClick={() => handleScenarioToggle(scenario)}
                    color={selectedScenarios.includes(scenario) ? 'primary' : 'default'}
                  />
                ))}
              </Box>

              {/* Custom constraints */}
              <TextField
                fullWidth
                label="Custom Constraints (JSON)"
                multiline
                rows={4}
                value={customConstraints}
                onChange={(e) => setCustomConstraints(e.target.value)}
                placeholder='{"field_name": {"min_length": 5}}'
                sx={{ mb: 2 }}
              />

              <Button
                fullWidth
                variant="contained"
                startIcon={<AutoAwesome />}
                onClick={() => generateDataMutation.mutate()}
                disabled={generateDataMutation.isPending || selectedScenarios.length === 0}
                size="large"
              >
                {generateDataMutation.isPending ? 'Generating...' : 'Generate Test Data'}
              </Button>

              {generateDataMutation.isPending && (
                <LinearProgress sx={{ mt: 2 }} />
              )}
            </CardContent>
          </Card>

          {/* Field Information */}
          {metadata && (metadata as any).forms && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Field Information
                </Typography>
                {(metadata as any).forms.map((form: any, formIndex: number) => (
                  <Accordion key={formIndex}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="subtitle2">
                        Form {formIndex + 1} ({form.fields?.length || 0} fields)
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {form.fields?.map((field: any, fieldIndex: number) => (
                        <Box key={fieldIndex} sx={{ mb: 1 }}>
                          <Typography variant="body2">
                            <strong>{field.name}</strong> ({field.type})
                          </Typography>
                          {field.validation && (
                            <Typography variant="caption" color="textSecondary">
                              Validation: {JSON.stringify(field.validation)}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </AccordionDetails>
                  </Accordion>
                ))}
              </CardContent>
            </Card>
          )}
        </Box>

        {/* Generated Data Display */}
        <Box sx={{ flex: '1 1 66%', minWidth: '600px' }}>
          {generatedData.length > 0 ? (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Generated Test Data ({generatedData.length} items)
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<PlayArrow />}
                    onClick={handleRunTests}
                    color="success"
                  >
                    Run Tests with this Data
                  </Button>
                </Box>

                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Scenario</TableCell>
                        <TableCell>Field Count</TableCell>
                        <TableCell>Generated At</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {generatedData.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Chip 
                              label={item.scenario} 
                              size="small"
                              color={item.scenario === 'valid' ? 'success' : 
                                     item.scenario === 'invalid' ? 'error' : 'default'}
                            />
                          </TableCell>
                          <TableCell>{Object.keys(item.data).length}</TableCell>
                          <TableCell>
                            {new Date(item.metadata.generated_at).toLocaleTimeString()}
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Preview Data">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedDataItem(item);
                                  setPreviewDialogOpen(true);
                                }}
                              >
                                <Preview />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Copy to Clipboard">
                              <IconButton
                                size="small"
                                onClick={() => handleCopyData(item.data)}
                              >
                                <ContentCopy />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <DataArray sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  No Test Data Generated Yet
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Configure your generation settings and click "Generate Test Data" to create realistic test data using AI.
                </Typography>
                {!useAI && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    AI is disabled. Data will be generated using regex patterns and simple rules.
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>

      {/* Data Preview Dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Test Data Preview - {selectedDataItem?.scenario}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={15}
            value={selectedDataItem ? JSON.stringify(selectedDataItem.data, null, 2) : ''}
            variant="outlined"
            InputProps={{
              readOnly: true,
              style: { fontFamily: 'monospace', fontSize: '0.875rem' }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>
            Close
          </Button>
          <Button
            onClick={() => selectedDataItem && handleCopyData(selectedDataItem.data)}
            startIcon={<ContentCopy />}
          >
            Copy to Clipboard
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DataGeneration;
