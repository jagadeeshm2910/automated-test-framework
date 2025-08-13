import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Chip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
} from '@mui/material';
import {
  ExpandMore,
  Web,
  GitHub,
  Send,
  Description,
  Visibility,
  Download,
} from '@mui/icons-material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { useAppContext } from '../contexts/AppContext';
import type { MetadataRecord, ExtractionRequest, GitHubExtractionRequest } from '../types/api';

const ExtractForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { dispatch } = useAppContext();
  
  const [extractionType, setExtractionType] = useState(
    searchParams.get('type') || 'url'
  );
  const [url, setUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [extractedMetadata, setExtractedMetadata] = useState<MetadataRecord | null>(null);

  // Fetch recent extractions
  const { data: recentExtractions } = useQuery({
    queryKey: ['metadata'],
    queryFn: () => apiService.getMetadata({ limit: 10 }),
  });

  // URL extraction mutation
  const urlMutation = useMutation({
    mutationFn: (data: ExtractionRequest) => apiService.extractFromUrl(data),
    onSuccess: (data) => {
      setExtractedMetadata(data);
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: { message: 'Metadata extracted successfully!', type: 'success' },
      });
    },
    onError: (error) => {
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          message: `Extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          type: 'error',
        },
      });
    },
  });

  // GitHub extraction mutation
  const githubMutation = useMutation({
    mutationFn: (data: GitHubExtractionRequest) => apiService.extractFromGitHub(data),
    onSuccess: (data) => {
      setExtractedMetadata(data);
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: { message: 'GitHub metadata extracted successfully!', type: 'success' },
      });
    },
    onError: (error) => {
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          message: `GitHub extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          type: 'error',
        },
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (extractionType === 'url') {
      if (!url.trim()) {
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: { message: 'Please enter a valid URL', type: 'error' },
        });
        return;
      }
      urlMutation.mutate({ url: url.trim() });
    } else {
      if (!githubUrl.trim()) {
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: { message: 'Please enter a valid GitHub URL', type: 'error' },
        });
        return;
      }
      githubMutation.mutate({ repository_url: githubUrl.trim() });
    }
  };

  const handleRunTests = () => {
    if (extractedMetadata) {
      navigate(`/tests?metadata_id=${extractedMetadata.id}`);
    }
  };

  const handleViewMetadata = (metadataId: string) => {
    navigate(`/results?metadata_id=${metadataId}`);
  };

  const isLoading = urlMutation.isPending || githubMutation.isPending;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Extract Form Metadata
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Extract form metadata from web pages or GitHub repositories to create automated UI tests
      </Typography>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '2 1 60%', minWidth: '400px' }}>
          <Card>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <FormControl component="fieldset" sx={{ mb: 3 }}>
                  <FormLabel component="legend">Extraction Source</FormLabel>
                  <RadioGroup
                    row
                    value={extractionType}
                    onChange={(e) => setExtractionType(e.target.value)}
                  >
                    <FormControlLabel
                      value="url"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Web />
                          Web Page URL
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="github"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <GitHub />
                          GitHub Repository
                        </Box>
                      }
                    />
                  </RadioGroup>
                </FormControl>

                {extractionType === 'url' ? (
                  <TextField
                    fullWidth
                    label="Web Page URL"
                    placeholder="https://example.com/contact"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={isLoading}
                    sx={{ mb: 3 }}
                    helperText="Enter the URL of a web page containing forms to extract metadata"
                  />
                ) : (
                  <TextField
                    fullWidth
                    label="GitHub Repository URL"
                    placeholder="https://github.com/username/repository"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    disabled={isLoading}
                    sx={{ mb: 3 }}
                    helperText="Enter the GitHub repository URL to extract form metadata from HTML files"
                  />
                )}

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={<Send />}
                  disabled={isLoading}
                  fullWidth
                >
                  {isLoading ? 'Extracting...' : 'Extract Metadata'}
                </Button>
              </form>

              {isLoading && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress />
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    {extractionType === 'url' 
                      ? 'Analyzing web page and extracting form metadata...' 
                      : 'Scanning repository for HTML files and extracting form metadata...'}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Extracted Metadata Results */}
          {extractedMetadata && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Extraction Results
                  </Typography>
                  <Chip 
                    label={`${extractedMetadata.fields?.length || 0} fields found`}
                    color="success"
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="textSecondary">
                    Source: {extractedMetadata.url}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Extracted: {new Date(extractedMetadata.created_at).toLocaleString()}
                  </Typography>
                </Box>

                {extractedMetadata.fields && extractedMetadata.fields.length > 0 ? (
                  <Box>
                    {extractedMetadata.fields.map((field, index) => (
                      <Accordion key={index} sx={{ mb: 1 }}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                          <Typography variant="subtitle1">
                            Field {index + 1}: {field.name || field.label || 'Unnamed field'}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
                              <Typography variant="body2" gutterBottom>
                                <strong>Type:</strong> {field.field_type || 'text'}
                              </Typography>
                              <Typography variant="body2" gutterBottom>
                                <strong>Name:</strong> {field.name || 'Not specified'}
                              </Typography>
                              <Typography variant="body2" gutterBottom>
                                <strong>Required:</strong> {field.required ? 'Yes' : 'No'}
                              </Typography>
                            </Box>
                            <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
                              <Typography variant="body2" gutterBottom>
                                <strong>Label:</strong> {field.label || 'No label'}
                              </Typography>
                              <Typography variant="body2" gutterBottom>
                                <strong>Placeholder:</strong> {field.placeholder || 'None'}
                              </Typography>
                              {field.validation_pattern && (
                                <Typography variant="body2" gutterBottom>
                                  <strong>Validation:</strong> {field.validation_pattern}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                    
                    
                    <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<Send />}
                        onClick={handleRunTests}
                      >
                        Run Tests
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Download />}
                        onClick={() => {
                          const dataStr = JSON.stringify(extractedMetadata, null, 2);
                          const dataBlob = new Blob([dataStr], { type: 'application/json' });
                          const url = URL.createObjectURL(dataBlob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = `metadata-${extractedMetadata.id}.json`;
                          link.click();
                        }}
                      >
                        Download JSON
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Alert severity="warning">
                    No forms were found in the specified source. Please check the URL and try again.
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </Box>

        <Box sx={{ flex: '1 1 35%', minWidth: '300px' }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Extractions
            </Typography>
            {recentExtractions?.metadata && recentExtractions.metadata.length > 0 ? (
              <List>
                {recentExtractions.metadata.slice(0, 5).map((item: MetadataRecord) => (
                  <ListItem
                    key={item.id}
                    sx={{ px: 0 }}
                    secondaryAction={
                      <Box>
                        <IconButton
                          size="small"
                          onClick={() => handleViewMetadata(item.id.toString())}
                        >
                          <Visibility />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemIcon>
                      <Description />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" noWrap>
                          {item.url}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" color="textSecondary">
                            {new Date(item.created_at).toLocaleDateString()}
                          </Typography>
                          <br />
                          <Chip
                            label={`${item.fields?.length || 0} fields`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="textSecondary" variant="body2">
                No recent extractions found
              </Typography>
            )}
          </Paper>

          <Paper sx={{ p: 3, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Tips
            </Typography>
            <Typography variant="body2" paragraph>
              • Ensure the target URL is accessible and contains HTML forms
            </Typography>
            <Typography variant="body2" paragraph>
              • GitHub repositories should contain HTML files with forms
            </Typography>
            <Typography variant="body2" paragraph>
              • Complex forms with JavaScript may require additional configuration
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default ExtractForm;
