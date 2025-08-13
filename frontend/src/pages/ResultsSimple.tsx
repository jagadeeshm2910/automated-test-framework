import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Alert, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Collapse,
  Button,
  Stack,
  CircularProgress
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  GitHub as GitHubIcon,
  Web as WebIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';

interface ExtractedData {
  id: number;
  page_url: string;
  source_type: string;
  fields: any[];
  extracted_at: string;
  page_title?: string;
  repository_branch?: string;
  scanned_files?: string[];
}

const Results: React.FC = () => {
  const [data, setData] = useState<ExtractedData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:8000/metadata/');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      setData(result);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch extraction data');
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getSourceIcon = (sourceType: string) => {
    return sourceType === 'github_repository' ? <GitHubIcon /> : <WebIcon />;
  };

  const getSourceColor = (sourceType: string): "primary" | "secondary" => {
    return sourceType === 'github_repository' ? 'secondary' : 'primary';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Extracted Metadata Results
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Browse and analyze your extracted form metadata from web pages and GitHub repositories
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {data.length === 0 ? (
        <Card>
          <CardContent>
            <Alert severity="info">
              No extracted metadata found. Use the Extract Forms page to analyze web pages or GitHub repositories.
            </Alert>
          </CardContent>
        </Card>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width="50"></TableCell>
                  <TableCell>ID</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Fields</TableCell>
                  <TableCell>Extracted</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row) => (
                  <React.Fragment key={row.id}>
                    <TableRow hover>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => toggleRow(row.id)}
                        >
                          {expandedRows.has(row.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          #{row.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {row.page_url}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getSourceIcon(row.source_type)}
                          label={row.source_type.replace('_', ' ')}
                          size="small"
                          color={getSourceColor(row.source_type)}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip label={`${row.fields.length} fields`} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(row.extracted_at)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => toggleRow(row.id)}>
                          <ViewIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    
                    <TableRow>
                      <TableCell colSpan={7} sx={{ py: 0 }}>
                        <Collapse in={expandedRows.has(row.id)} timeout="auto" unmountOnExit>
                          <Box sx={{ p: 2, backgroundColor: 'grey.50' }}>
                            <Typography variant="h6" gutterBottom>
                              Field Details for #{row.id}
                            </Typography>
                            
                            <Stack spacing={2}>
                              {row.fields.map((field, index) => (
                                <Card key={index} variant="outlined" sx={{ p: 2 }}>
                                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                    {field.field_id}
                                  </Typography>
                                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
                                    <Chip label={`Type: ${field.type}`} size="small" color="primary" />
                                    {field.label && (
                                      <Chip label={`Label: ${field.label}`} size="small" color="secondary" />
                                    )}
                                    {field.placeholder && (
                                      <Chip label={`Placeholder: ${field.placeholder}`} size="small" color="info" />
                                    )}
                                    {field.required && (
                                      <Chip label="Required" size="small" color="error" />
                                    )}
                                    {field.source_file && (
                                      <Chip label={`File: ${field.source_file.split('/').pop()}`} size="small" color="success" />
                                    )}
                                  </Stack>
                                  {field.css_selector && (
                                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                      <strong>Selector:</strong> {field.css_selector}
                                    </Typography>
                                  )}
                                </Card>
                              ))}
                            </Stack>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Box sx={{ mt: 3 }}>
        <Button variant="outlined" onClick={fetchData}>
          Refresh Data
        </Button>
      </Box>
    </Box>
  );
};

export default Results;
