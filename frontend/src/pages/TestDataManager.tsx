import React, { useState, useEffect } from 'react';
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
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  IconButton,
  Fab,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Storage,
  Add,
  Edit,
  Delete,
  Download,
  Upload,
  Refresh,
  Visibility,
  VisibilityOff,
  DataObject,
  TableChart,
  FileCopy,
  CloudUpload,
  CloudDownload,
  Security,
  History,
  Star,
  StarBorder,
  Settings,
  FilterList,
  Search,
  MoreVert
} from '@mui/icons-material';

interface TestData {
  id: string;
  name: string;
  type: 'form_data' | 'api_responses' | 'mock_data' | 'csv' | 'json' | 'xml';
  size: number;
  records: number;
  created: Date;
  modified: Date;
  tags: string[];
  favorite: boolean;
  encrypted: boolean;
  usage_count: number;
  schema?: any;
  sample_data?: any;
}

interface TestDataSet {
  id: string;
  name: string;
  description: string;
  data_sources: TestData[];
  created: Date;
  modified: Date;
  tests_using: number;
}

const TestDataManager: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [testData, setTestData] = useState<TestData[]>([]);
  const [dataSets, setDataSets] = useState<TestDataSet[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDataDialog, setOpenDataDialog] = useState(false);
  const [openSetDialog, setOpenSetDialog] = useState(false);
  const [selectedData, setSelectedData] = useState<TestData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showPreview, setShowPreview] = useState<string | null>(null);

  // Mock data
  useEffect(() => {
    const mockTestData: TestData[] = [
      {
        id: 'td1',
        name: 'User Registration Forms',
        type: 'form_data',
        size: 1024000,
        records: 500,
        created: new Date('2024-01-15'),
        modified: new Date('2024-01-20'),
        tags: ['registration', 'users', 'forms'],
        favorite: true,
        encrypted: false,
        usage_count: 25,
        schema: {
          firstName: 'string',
          lastName: 'string',
          email: 'email',
          password: 'password'
        },
        sample_data: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: '••••••••'
        }
      },
      {
        id: 'td2',
        name: 'Product Catalog API',
        type: 'api_responses',
        size: 2048000,
        records: 1200,
        created: new Date('2024-01-10'),
        modified: new Date('2024-01-22'),
        tags: ['products', 'api', 'catalog'],
        favorite: false,
        encrypted: true,
        usage_count: 42,
        schema: {
          id: 'number',
          name: 'string',
          price: 'currency',
          category: 'string'
        }
      },
      {
        id: 'td3',
        name: 'Payment Test Data',
        type: 'mock_data',
        size: 512000,
        records: 200,
        created: new Date('2024-01-18'),
        modified: new Date('2024-01-21'),
        tags: ['payment', 'financial', 'mock'],
        favorite: true,
        encrypted: true,
        usage_count: 15,
        schema: {
          cardNumber: 'credit_card',
          expiryDate: 'date',
          cvv: 'number',
          amount: 'currency'
        }
      }
    ];

    const mockDataSets: TestDataSet[] = [
      {
        id: 'ds1',
        name: 'E-commerce Full Flow',
        description: 'Complete test data for e-commerce user journey',
        data_sources: [mockTestData[0], mockTestData[1], mockTestData[2]],
        created: new Date('2024-01-20'),
        modified: new Date('2024-01-22'),
        tests_using: 8
      },
      {
        id: 'ds2',
        name: 'User Management Suite',
        description: 'User registration, login, and profile management data',
        data_sources: [mockTestData[0]],
        created: new Date('2024-01-19'),
        modified: new Date('2024-01-21'),
        tests_using: 5
      }
    ];

    setTestData(mockTestData);
    setDataSets(mockDataSets);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateData = () => {
    setSelectedData(null);
    setOpenDataDialog(true);
  };

  const handleEditData = (data: TestData) => {
    setSelectedData(data);
    setOpenDataDialog(true);
  };

  const handleDeleteData = (id: string) => {
    setTestData(prev => prev.filter(d => d.id !== id));
  };

  const handleToggleFavorite = (id: string) => {
    setTestData(prev => 
      prev.map(d => d.id === id ? { ...d, favorite: !d.favorite } : d)
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'form_data': return <DataObject color="primary" />;
      case 'api_responses': return <CloudDownload color="secondary" />;
      case 'mock_data': return <Star color="warning" />;
      case 'csv': return <TableChart color="success" />;
      case 'json': return <DataObject color="info" />;
      case 'xml': return <FileCopy color="error" />;
      default: return <Storage />;
    }
  };

  const filteredData = testData.filter(data => {
    const matchesSearch = data.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         data.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filterType === 'all' || data.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const DataSourcesTab = () => (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search data sources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
          }}
          sx={{ minWidth: 300 }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Type</InputLabel>
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            startAdornment={<FilterList sx={{ mr: 1, color: 'text.secondary' }} />}
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="form_data">Form Data</MenuItem>
            <MenuItem value="api_responses">API Responses</MenuItem>
            <MenuItem value="mock_data">Mock Data</MenuItem>
            <MenuItem value="csv">CSV Files</MenuItem>
            <MenuItem value="json">JSON Files</MenuItem>
            <MenuItem value="xml">XML Files</MenuItem>
          </Select>
        </FormControl>
        <Button
          startIcon={<Refresh />}
          onClick={() => setLoading(true)}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      <Grid container spacing={3}>
        {filteredData.map((data) => (
          <Grid item xs={12} md={6} lg={4} key={data.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {getTypeIcon(data.type)}
                  <Typography variant="h6" sx={{ ml: 1, flexGrow: 1 }}>
                    {data.name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleToggleFavorite(data.id)}
                  >
                    {data.favorite ? <Star color="warning" /> : <StarBorder />}
                  </IconButton>
                </Box>

                <Box sx={{ mb: 2 }}>
                  {data.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Type: {data.type.replace('_', ' ').toUpperCase()}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Size: {formatFileSize(data.size)} • {data.records.toLocaleString()} records
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Used in {data.usage_count} tests
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  {data.encrypted && (
                    <Chip
                      icon={<Security />}
                      label="Encrypted"
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ mr: 1 }}
                    />
                  )}
                  <Typography variant="caption" color="text.secondary">
                    Modified: {data.modified.toLocaleDateString()}
                  </Typography>
                </Box>
              </CardContent>

              <CardActions sx={{ justifyContent: 'space-between' }}>
                <Box>
                  <Tooltip title="Preview Data">
                    <IconButton
                      size="small"
                      onClick={() => setShowPreview(data.id)}
                    >
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Download">
                    <IconButton size="small">
                      <Download />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => handleEditData(data)}
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Button
                  size="small"
                  startIcon={<Delete />}
                  onClick={() => handleDeleteData(data.id)}
                  color="error"
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleCreateData}
      >
        <Add />
      </Fab>
    </Box>
  );

  const DataSetsTab = () => (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenSetDialog(true)}
        >
          Create Data Set
        </Button>
        <Button
          startIcon={<Upload />}
          variant="outlined"
        >
          Import Set
        </Button>
        <Button
          startIcon={<Download />}
          variant="outlined"
        >
          Export Sets
        </Button>
      </Box>

      <Grid container spacing={3}>
        {dataSets.map((dataSet) => (
          <Grid item xs={12} lg={6} key={dataSet.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {dataSet.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {dataSet.description}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Data Sources ({dataSet.data_sources.length})
                  </Typography>
                  <List dense>
                    {dataSet.data_sources.slice(0, 3).map((source) => (
                      <ListItem key={source.id} sx={{ py: 0.5 }}>
                        <ListItemText
                          primary={source.name}
                          secondary={`${source.type} • ${source.records} records`}
                        />
                      </ListItem>
                    ))}
                    {dataSet.data_sources.length > 3 && (
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText
                          primary={`+${dataSet.data_sources.length - 3} more sources`}
                          sx={{ fontStyle: 'italic' }}
                        />
                      </ListItem>
                    )}
                  </List>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Used in {dataSet.tests_using} tests
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Modified: {dataSet.modified.toLocaleDateString()}
                  </Typography>
                </Box>
              </CardContent>

              <CardActions>
                <Button size="small" startIcon={<Edit />}>
                  Edit
                </Button>
                <Button size="small" startIcon={<FileCopy />}>
                  Duplicate
                </Button>
                <Button size="small" startIcon={<Download />}>
                  Export
                </Button>
                <Button size="small" startIcon={<Delete />} color="error">
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Test Data Manager
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage test data sources, data sets, and data generation for comprehensive testing
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<CloudUpload />}
          >
            Import Data
          </Button>
          <Button
            variant="outlined"
            startIcon={<Settings />}
          >
            Settings
          </Button>
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Data Sources" icon={<Storage />} />
          <Tab label="Data Sets" icon={<TableChart />} />
          <Tab label="Schema Manager" icon={<DataObject />} />
          <Tab label="Generation Rules" icon={<Star />} />
        </Tabs>
      </Paper>

      <Box sx={{ mt: 3 }}>
        {tabValue === 0 && <DataSourcesTab />}
        {tabValue === 1 && <DataSetsTab />}
        {tabValue === 2 && (
          <Alert severity="info">
            Schema Manager - Coming soon! Define and manage data schemas for consistent test data generation.
          </Alert>
        )}
        {tabValue === 3 && (
          <Alert severity="info">
            Generation Rules - Coming soon! Create rules for automatic test data generation based on patterns and constraints.
          </Alert>
        )}
      </Box>

      {/* Data Source Dialog */}
      <Dialog
        open={openDataDialog}
        onClose={() => setOpenDataDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedData ? 'Edit Data Source' : 'Create New Data Source'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              label="Data Source Name"
              fullWidth
              sx={{ mb: 2 }}
              defaultValue={selectedData?.name}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Data Type</InputLabel>
              <Select defaultValue={selectedData?.type || 'form_data'}>
                <MenuItem value="form_data">Form Data</MenuItem>
                <MenuItem value="api_responses">API Responses</MenuItem>
                <MenuItem value="mock_data">Mock Data</MenuItem>
                <MenuItem value="csv">CSV File</MenuItem>
                <MenuItem value="json">JSON File</MenuItem>
                <MenuItem value="xml">XML File</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Tags (comma-separated)"
              fullWidth
              sx={{ mb: 2 }}
              defaultValue={selectedData?.tags.join(', ')}
            />
            <FormControlLabel
              control={<Switch defaultChecked={selectedData?.encrypted} />}
              label="Encrypt sensitive data"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDataDialog(false)}>Cancel</Button>
          <Button variant="contained">
            {selectedData ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Data Preview Dialog */}
      <Dialog
        open={!!showPreview}
        onClose={() => setShowPreview(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Data Preview</DialogTitle>
        <DialogContent>
          {showPreview && (() => {
            const data = testData.find(d => d.id === showPreview);
            return data?.sample_data ? (
              <Box>
                <Typography variant="h6" gutterBottom>Schema</Typography>
                <pre style={{ background: '#f5f5f5', padding: '16px', borderRadius: '4px', marginBottom: '16px' }}>
                  {JSON.stringify(data.schema, null, 2)}
                </pre>
                <Typography variant="h6" gutterBottom>Sample Data</Typography>
                <pre style={{ background: '#f5f5f5', padding: '16px', borderRadius: '4px' }}>
                  {JSON.stringify(data.sample_data, null, 2)}
                </pre>
              </Box>
            ) : (
              <Alert severity="info">No preview available for this data source.</Alert>
            );
          })()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreview(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TestDataManager;
