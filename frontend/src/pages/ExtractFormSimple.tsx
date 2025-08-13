import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Alert, 
  TextField, 
  Button, 
  Stack,
  CircularProgress,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
  Slider,
  LinearProgress,
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  ContentCopy as CopyIcon,
  Web as WebIcon,
  GitHub as GitHubIcon
} from '@mui/icons-material';
import { apiService } from '../services/api';

const ExtractForm: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [url, setUrl] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [filePatterns, setFilePatterns] = useState('*.html,*.jsx,*.tsx,*.vue');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  
  // Advanced options for URL extraction
  const [waitForJs, setWaitForJs] = useState(false);
  const [timeout, setTimeout] = useState(15);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleCopyJson = () => {
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    }
  };

  const handleExtractUrl = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      console.log(`Extracting metadata from URL: ${url.trim()} (timeout: ${timeout}s, js: ${waitForJs})`);
      const response = await apiService.extractFromUrl({ 
        url: url.trim(),
        wait_for_js: waitForJs,
        timeout: timeout
      });
      setResult(response);
      setError('');
      console.log('URL extraction completed successfully');
    } catch (err: any) {
      console.error('URL extraction failed:', err);
      let errorMessage = 'Failed to extract metadata';
      
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        errorMessage = `Request timed out after ${timeout} seconds. Try increasing the timeout or disabling JavaScript waiting.`;
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExtractGitHub = async () => {
    if (!repoUrl.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const patterns = filePatterns.split(',').map(p => p.trim()).filter(p => p);
      const response = await apiService.extractFromGitHub({ 
        repository_url: repoUrl.trim(),
        branch: branch.trim() || 'main',
        file_patterns: patterns.length > 0 ? patterns : undefined
      });
      setResult(response);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to extract metadata from GitHub');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Extract Form Metadata
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Extract form metadata from web pages or GitHub repositories to create automated UI tests
      </Typography>

      {/* Tips Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2" fontWeight="bold" gutterBottom>
          💡 Tips for better extraction:
        </Typography>
        <Typography variant="body2" component="div">
          • Start with <strong>JavaScript disabled</strong> for faster extraction
          • Use shorter timeouts (10-15s) for simple pages
          • Enable JavaScript only if forms are dynamically generated
          • Try increasing timeout if you get timeout errors
        </Typography>
      </Alert>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
            <Tab icon={<WebIcon />} label="Web Page URL" />
            <Tab icon={<GitHubIcon />} label="GitHub Repository" />
          </Tabs>

          {activeTab === 0 && (
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Web Page URL"
                placeholder="https://httpbin.org/forms/post"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
                helperText="Enter a URL with HTML forms to extract metadata"
              />
              
              {/* Advanced Options */}
              <Accordion expanded={showAdvanced} onChange={() => setShowAdvanced(!showAdvanced)}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2">Advanced Options</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={waitForJs}
                          onChange={(e) => setWaitForJs(e.target.checked)}
                          disabled={loading}
                        />
                      }
                      label="Wait for JavaScript to load (slower but more complete)"
                    />
                    
                    <Box>
                      <Typography gutterBottom>
                        Timeout: {timeout} seconds
                      </Typography>
                      <Slider
                        value={timeout}
                        onChange={(_, newValue) => setTimeout(newValue as number)}
                        min={5}
                        max={60}
                        step={5}
                        marks={[
                          { value: 5, label: '5s' },
                          { value: 15, label: '15s' },
                          { value: 30, label: '30s' },
                          { value: 60, label: '60s' },
                        ]}
                        disabled={loading}
                      />
                    </Box>
                  </Stack>
                </AccordionDetails>
              </Accordion>
              
              {loading && (
                <Box sx={{ width: '100%' }}>
                  <LinearProgress />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {waitForJs ? 'Loading page with JavaScript...' : 'Loading page...'} (timeout: {timeout}s)
                  </Typography>
                </Box>
              )}
              
              <Button
                variant="contained"
                onClick={handleExtractUrl}
                disabled={loading || !url.trim()}
                sx={{ alignSelf: 'flex-start' }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Extracting...
                  </>
                ) : (
                  'Extract from URL'
                )}
              </Button>
            </Stack>
          )}

          {activeTab === 1 && (
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="GitHub Repository URL"
                placeholder="https://github.com/username/repository"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                disabled={loading}
                helperText="Enter a GitHub repository URL to extract form metadata from source code"
              />
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  label="Branch"
                  placeholder="main"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  disabled={loading}
                  sx={{ minWidth: 150 }}
                  helperText="Git branch to analyze"
                />
                
                <TextField
                  label="File Patterns"
                  placeholder="*.html,*.jsx,*.tsx,*.vue"
                  value={filePatterns}
                  onChange={(e) => setFilePatterns(e.target.value)}
                  disabled={loading}
                  sx={{ flexGrow: 1, minWidth: 300 }}
                  helperText="Comma-separated file patterns to search for forms"
                />
              </Box>
              
              <Button
                variant="contained"
                onClick={handleExtractGitHub}
                disabled={loading || !repoUrl.trim()}
                sx={{ alignSelf: 'flex-start' }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Analyzing Repository...
                  </>
                ) : (
                  'Extract from GitHub'
                )}
              </Button>
            </Stack>
          )}
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {result && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Extraction Results
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  <strong>Source:</strong> {result.page_url}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Extracted:</strong> {new Date(result.created_at).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>ID:</strong> {result.id}
                </Typography>
              </Box>
              
              {result.fields && result.fields.length > 0 ? (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Form Fields ({result.fields.length})
                  </Typography>
                  
                  {/* Summary chips */}
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} sx={{ mb: 3 }}>
                    {result.fields.map((field: any, index: number) => (
                      <Chip 
                        key={index}
                        label={`${field.field_id} (${field.type})`}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Stack>

                  {/* Detailed field information */}
                  <Typography variant="subtitle2" gutterBottom>
                    Field Details:
                  </Typography>
                  <Stack spacing={2}>
                    {result.fields.map((field: any, index: number) => (
                      <Card key={index} variant="outlined" sx={{ p: 2 }}>
                        <Stack spacing={1}>
                          <Typography variant="body1" fontWeight="bold">
                            {field.field_id}
                          </Typography>
                          <Stack direction="row" spacing={2} flexWrap="wrap">
                            <Chip label={`Type: ${field.type}`} size="small" color="primary" />
                            {field.name && (
                              <Chip label={`Name: ${field.name}`} size="small" color="secondary" />
                            )}
                            {field.label && (
                              <Chip label={`Label: ${field.label}`} size="small" color="success" />
                            )}
                            {field.placeholder && (
                              <Chip label={`Placeholder: ${field.placeholder}`} size="small" color="info" />
                            )}
                            {field.required && (
                              <Chip label="Required" size="small" color="error" />
                            )}
                            {field.value && (
                              <Chip label={`Default: ${field.value}`} size="small" color="warning" />
                            )}
                          </Stack>
                          {field.options && field.options.length > 0 && (
                            <Box>
                              <Typography variant="body2" color="textSecondary" gutterBottom>
                                Options:
                              </Typography>
                              <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
                                {field.options.map((option: string, optIndex: number) => (
                                  <Chip key={optIndex} label={option} size="small" variant="outlined" />
                                ))}
                              </Stack>
                            </Box>
                          )}
                          {field.selector && (
                            <Typography variant="body2" color="textSecondary">
                              <strong>CSS Selector:</strong> {field.selector}
                            </Typography>
                          )}
                        </Stack>
                      </Card>
                    ))}
                  </Stack>

                  {/* Raw JSON Data */}
                  <Accordion sx={{ mt: 3 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2">
                          Raw JSON Data
                        </Typography>
                        <Tooltip title="Copy JSON to clipboard">
                          <IconButton size="small" onClick={handleCopyJson}>
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box
                        component="pre"
                        sx={{
                          backgroundColor: 'grey.100',
                          p: 2,
                          borderRadius: 1,
                          overflow: 'auto',
                          fontSize: '0.875rem',
                          fontFamily: 'monospace',
                          maxHeight: 400,
                        }}
                      >
                        {JSON.stringify(result, null, 2)}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </Box>
              ) : (
                <Alert severity="warning">
                  No form fields found on this page.
                </Alert>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ExtractForm;
