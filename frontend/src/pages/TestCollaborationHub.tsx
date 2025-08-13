import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Paper,
  Chip,
  Button,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Avatar,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from '@mui/material';
import {
  Group as GroupIcon,
  Message as MessageIcon,
  Assignment as TaskIcon,
  BugReport as BugIcon,
  CheckCircle as CheckIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Share as ShareIcon,
  Comment as CommentIcon,
  MoreVert as MoreVertIcon,
  Notifications as NotificationIcon,
  Schedule as ScheduleIcon,
  FiberManualRecord as StatusIcon,
  Chat as ChatIcon,
  VideoCall as VideoIcon,
  ExpandMore as ExpandMoreIcon,
  Forum as ForumIcon,
  ThumbUp as LikeIcon,
  Reply as ReplyIcon,
  Send as SendIcon,
  Search as SearchIcon,
  Sort as SortIcon,
} from '@mui/icons-material';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'developer' | 'tester' | 'manager' | 'devops' | 'designer';
  avatar: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastActive: string;
  skills: string[];
  currentTasks: number;
  completedTests: number;
  joinedDate: string;
}

interface TestCase {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'review' | 'approved' | 'blocked' | 'obsolete';
  assignee: string;
  reviewer?: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  comments: Comment[];
  attachments: string[];
  testSteps: TestStep[];
}

interface TestStep {
  id: string;
  step: string;
  expected: string;
  actual?: string;
  status?: 'pass' | 'fail' | 'skip';
}

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  replies: Comment[];
  likes: number;
  isResolved: boolean;
}

interface Activity {
  id: string;
  type: 'test_created' | 'test_updated' | 'test_reviewed' | 'comment_added' | 'bug_reported' | 'test_executed';
  actor: string;
  target: string;
  timestamp: string;
  details: string;
}

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
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const TestCollaborationHub: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);
  const [newComment, setNewComment] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const generateMockTeamMembers = (): TeamMember[] => {
    return [
      {
        id: 'tm1',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        role: 'tester',
        avatar: '/avatars/alice.jpg',
        status: 'online',
        lastActive: new Date().toISOString(),
        skills: ['Selenium', 'Cypress', 'API Testing', 'Performance Testing'],
        currentTasks: 5,
        completedTests: 127,
        joinedDate: '2023-01-15',
      },
      {
        id: 'tm2',
        name: 'Bob Smith',
        email: 'bob@example.com',
        role: 'developer',
        avatar: '/avatars/bob.jpg',
        status: 'away',
        lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        skills: ['JavaScript', 'React', 'Node.js', 'Jest'],
        currentTasks: 3,
        completedTests: 89,
        joinedDate: '2023-02-20',
      },
      {
        id: 'tm3',
        name: 'Carol Davis',
        email: 'carol@example.com',
        role: 'manager',
        avatar: '/avatars/carol.jpg',
        status: 'busy',
        lastActive: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        skills: ['Project Management', 'Test Planning', 'Risk Assessment'],
        currentTasks: 8,
        completedTests: 45,
        joinedDate: '2022-11-10',
      },
      {
        id: 'tm4',
        name: 'David Wilson',
        email: 'david@example.com',
        role: 'devops',
        avatar: '/avatars/david.jpg',
        status: 'online',
        lastActive: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        skills: ['Docker', 'Kubernetes', 'CI/CD', 'AWS'],
        currentTasks: 4,
        completedTests: 67,
        joinedDate: '2023-03-05',
      },
    ];
  };

  const generateMockTestCases = (): TestCase[] => {
    return [
      {
        id: 'tc1',
        title: 'User Login Functionality',
        description: 'Test user login with valid and invalid credentials',
        priority: 'high',
        status: 'review',
        assignee: 'tm1',
        reviewer: 'tm3',
        author: 'tm1',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-16T14:30:00Z',
        tags: ['authentication', 'security', 'critical-path'],
        comments: [
          {
            id: 'c1',
            author: 'tm2',
            content: 'Please add test cases for password complexity validation',
            timestamp: '2024-01-16T09:15:00Z',
            replies: [],
            likes: 2,
            isResolved: false,
          },
        ],
        attachments: ['login-wireframe.png', 'auth-flow.pdf'],
        testSteps: [
          {
            id: 'ts1',
            step: 'Navigate to login page',
            expected: 'Login form is displayed',
          },
          {
            id: 'ts2',
            step: 'Enter valid username and password',
            expected: 'User is redirected to dashboard',
          },
        ],
      },
      {
        id: 'tc2',
        title: 'Shopping Cart Operations',
        description: 'Test adding, removing, and updating items in shopping cart',
        priority: 'medium',
        status: 'approved',
        assignee: 'tm2',
        author: 'tm1',
        createdAt: '2024-01-14T15:20:00Z',
        updatedAt: '2024-01-15T11:45:00Z',
        tags: ['e-commerce', 'cart', 'functional'],
        comments: [],
        attachments: ['cart-requirements.docx'],
        testSteps: [
          {
            id: 'ts3',
            step: 'Add product to cart',
            expected: 'Product appears in cart with correct details',
          },
          {
            id: 'ts4',
            step: 'Update quantity',
            expected: 'Cart total updates correctly',
          },
        ],
      },
    ];
  };

  const generateMockActivities = (): Activity[] => {
    return [
      {
        id: 'a1',
        type: 'test_created',
        actor: 'tm1',
        target: 'User Login Functionality',
        timestamp: '2024-01-15T10:00:00Z',
        details: 'Created new test case for user authentication',
      },
      {
        id: 'a2',
        type: 'comment_added',
        actor: 'tm2',
        target: 'User Login Functionality',
        timestamp: '2024-01-16T09:15:00Z',
        details: 'Added comment about password complexity validation',
      },
      {
        id: 'a3',
        type: 'test_reviewed',
        actor: 'tm3',
        target: 'Shopping Cart Operations',
        timestamp: '2024-01-15T11:45:00Z',
        details: 'Approved test case after review',
      },
      {
        id: 'a4',
        type: 'bug_reported',
        actor: 'tm1',
        target: 'Payment Gateway Integration',
        timestamp: '2024-01-14T16:30:00Z',
        details: 'Found critical bug in payment processing',
      },
    ];
  };

  useEffect(() => {
    setTeamMembers(generateMockTeamMembers());
    setTestCases(generateMockTestCases());
    setActivities(generateMockActivities());
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return '#4caf50';
      case 'away':
        return '#ff9800';
      case 'busy':
        return '#f44336';
      case 'offline':
        return '#757575';
      case 'approved':
        return '#4caf50';
      case 'review':
        return '#ff9800';
      case 'draft':
        return '#2196f3';
      case 'blocked':
        return '#f44336';
      case 'obsolete':
        return '#757575';
      default:
        return '#757575';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return '#d32f2f';
      case 'high':
        return '#f57c00';
      case 'medium':
        return '#1976d2';
      case 'low':
        return '#388e3c';
      default:
        return '#757575';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'test_created':
        return <AddIcon color="primary" />;
      case 'test_updated':
        return <EditIcon color="warning" />;
      case 'test_reviewed':
        return <CheckIcon color="success" />;
      case 'comment_added':
        return <CommentIcon color="info" />;
      case 'bug_reported':
        return <BugIcon color="error" />;
      case 'test_executed':
        return <CheckIcon color="success" />;
      default:
        return <StatusIcon />;
    }
  };

  const handleTestCaseClick = (testCase: TestCase) => {
    setSelectedTestCase(testCase);
    setDialogOpen(true);
  };

  const handleAddComment = () => {
    if (newComment.trim() && selectedTestCase) {
      const comment: Comment = {
        id: `c${Date.now()}`,
        author: 'tm1', // Current user
        content: newComment.trim(),
        timestamp: new Date().toISOString(),
        replies: [],
        likes: 0,
        isResolved: false,
      };

      const updatedTestCase = {
        ...selectedTestCase,
        comments: [...selectedTestCase.comments, comment],
      };

      setSelectedTestCase(updatedTestCase);
      setTestCases(prev => prev.map(tc => tc.id === updatedTestCase.id ? updatedTestCase : tc));
      setNewComment('');
    }
  };

  const filteredTestCases = testCases.filter(tc => {
    const matchesSearch = tc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || tc.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Test Collaboration Hub
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" startIcon={<AddIcon />}>
              New Test Case
            </Button>
            <Button variant="outlined" startIcon={<ChatIcon />}>
              Start Discussion
            </Button>
            <Button variant="contained" startIcon={<VideoIcon />}>
              Join Meeting
            </Button>
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)}>
            <Tab label="Team Dashboard" icon={<GroupIcon />} />
            <Tab label="Test Cases" icon={<TaskIcon />} />
            <Tab label="Activity Feed" icon={<NotificationIcon />} />
            <Tab label="Discussions" icon={<ForumIcon />} />
          </Tabs>
        </Box>

        {/* Team Dashboard Tab */}
        <TabPanel value={selectedTab} index={0}>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {/* Team Overview */}
            <Box sx={{ flex: '1 1 60%', minWidth: '300px' }}>
              <Card>
                <CardHeader title="Team Members" />
                <CardContent>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {teamMembers.map((member) => (
                      <Box sx={{ flex: '1 1 300px', maxWidth: '350px' }} key={member.id}>
                        <Card variant="outlined">
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Badge
                                overlap="circular"
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                badgeContent={
                                  <StatusIcon 
                                    sx={{ 
                                      color: getStatusColor(member.status),
                                      fontSize: 12 
                                    }} 
                                  />
                                }
                              >
                                <Avatar sx={{ mr: 2 }}>
                                  {member.name.charAt(0)}
                                </Avatar>
                              </Badge>
                              <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" fontWeight="bold">
                                  {member.name}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  {member.role}
                                </Typography>
                              </Box>
                            </Box>
                            
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body2" gutterBottom>
                                Current Tasks: {member.currentTasks}
                              </Typography>
                              <Typography variant="body2" gutterBottom>
                                Completed Tests: {member.completedTests}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                Last Active: {new Date(member.lastActive).toLocaleTimeString()}
                              </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              {member.skills.slice(0, 3).map((skill) => (
                                <Chip
                                  key={skill}
                                  size="small"
                                  label={skill}
                                  variant="outlined"
                                />
                              ))}
                              {member.skills.length > 3 && (
                                <Chip
                                  size="small"
                                  label={`+${member.skills.length - 3}`}
                                  variant="outlined"
                                  color="primary"
                                />
                              )}
                            </Box>
                          </CardContent>
                        </Card>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Team Stats */}
            <Box sx={{ flex: '1 1 30%', minWidth: '250px' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Card>
                    <CardHeader title="Team Statistics" />
                    <CardContent>
                      <List>
                        <ListItem>
                          <ListItemText
                            primary="Total Members"
                            secondary={teamMembers.length}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Online Now"
                            secondary={teamMembers.filter(m => m.status === 'online').length}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Active Tasks"
                            secondary={teamMembers.reduce((sum, m) => sum + m.currentTasks, 0)}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Completed Tests"
                            secondary={teamMembers.reduce((sum, m) => sum + m.completedTests, 0)}
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Box>

                <Box>
                  <Card>
                    <CardHeader title="Quick Actions" />
                    <CardContent>
                      <List>
                        <ListItem>
                          <ListItemIcon><MessageIcon /></ListItemIcon>
                          <ListItemText primary="Send Team Message" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><ScheduleIcon /></ListItemIcon>
                          <ListItemText primary="Schedule Review" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><ShareIcon /></ListItemIcon>
                          <ListItemText primary="Share Resources" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><VideoIcon /></ListItemIcon>
                          <ListItemText primary="Start Video Call" />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            </Box>
          </Box>
        </TabPanel>

        {/* Test Cases Tab */}
        <TabPanel value={selectedTab} index={1}>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                size="small"
                placeholder="Search test cases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{ flexGrow: 1 }}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="review">Review</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="blocked">Blocked</MenuItem>
                </Select>
              </FormControl>
              <IconButton>
                <SortIcon />
              </IconButton>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Test Case</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Assignee</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Comments</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTestCases
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((testCase) => {
                    const assignee = teamMembers.find(m => m.id === testCase.assignee);
                    return (
                      <TableRow 
                        key={testCase.id} 
                        hover 
                        sx={{ cursor: 'pointer' }}
                        onClick={() => handleTestCaseClick(testCase)}
                      >
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {testCase.title}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {testCase.description}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={testCase.priority.toUpperCase()}
                            sx={{ 
                              backgroundColor: getPriorityColor(testCase.priority),
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={testCase.status.toUpperCase()}
                            sx={{ 
                              backgroundColor: getStatusColor(testCase.status),
                              color: 'white'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                              {assignee?.name.charAt(0)}
                            </Avatar>
                            <Typography variant="body2">
                              {assignee?.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(testCase.createdAt).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={testCase.comments.length}
                            icon={<CommentIcon />}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={filteredTestCases.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </TabPanel>

        {/* Activity Feed Tab */}
        <TabPanel value={selectedTab} index={2}>
          <Card>
            <CardHeader title="Recent Activity" />
            <CardContent>
              <List>
                {activities.map((activity) => {
                  const actor = teamMembers.find(m => m.id === activity.actor);
                  return (
                    <ListItem key={activity.id}>
                      <ListItemIcon>
                        {getActivityIcon(activity.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 24, height: 24 }}>
                              {actor?.name.charAt(0)}
                            </Avatar>
                            <Typography variant="body2" fontWeight="medium">
                              {actor?.name}
                            </Typography>
                            <Typography variant="body2" fontWeight="medium" color="primary">
                              {activity.target}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              {activity.details}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {new Date(activity.timestamp).toLocaleString()}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Discussions Tab */}
        <TabPanel value={selectedTab} index={3}>
          <Card>
            <CardHeader 
              title="Team Discussions" 
              action={
                <Button variant="contained" startIcon={<AddIcon />}>
                  New Discussion
                </Button>
              }
            />
            <CardContent>
              <Typography variant="body1" color="textSecondary" textAlign="center" sx={{ py: 4 }}>
                Start a discussion to collaborate with your team members.
                Share ideas, ask questions, and solve problems together.
              </Typography>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Test Case Detail Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                {selectedTestCase?.title}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip
                  size="small"
                  label={selectedTestCase?.priority.toUpperCase()}
                  sx={{ 
                    backgroundColor: getPriorityColor(selectedTestCase?.priority || ''),
                    color: 'white'
                  }}
                />
                <Chip
                  size="small"
                  label={selectedTestCase?.status.toUpperCase()}
                  sx={{ 
                    backgroundColor: getStatusColor(selectedTestCase?.status || ''),
                    color: 'white'
                  }}
                />
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedTestCase && (
              <Box>
                <Typography variant="body1" paragraph>
                  {selectedTestCase.description}
                </Typography>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">Test Steps</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List>
                      {selectedTestCase.testSteps.map((step, index) => (
                        <ListItem key={step.id}>
                          <ListItemText
                            primary={`${index + 1}. ${step.step}`}
                            secondary={`Expected: ${step.expected}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">Comments ({selectedTestCase.comments.length})</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List>
                      {selectedTestCase.comments.map((comment) => {
                        const author = teamMembers.find(m => m.id === comment.author);
                        return (
                          <ListItem key={comment.id} alignItems="flex-start">
                            <ListItemIcon>
                              <Avatar sx={{ width: 32, height: 32 }}>
                                {author?.name.charAt(0)}
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <Typography variant="body2" fontWeight="medium" sx={{ mr: 2 }}>
                                    {author?.name}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    {new Date(comment.timestamp).toLocaleString()}
                                  </Typography>
                                </Box>
                              }
                              secondary={comment.content}
                            />
                            <ListItemSecondaryAction>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <IconButton size="small">
                                  <LikeIcon />
                                </IconButton>
                                <Typography variant="caption">{comment.likes}</Typography>
                                <IconButton size="small">
                                  <ReplyIcon />
                                </IconButton>
                              </Box>
                            </ListItemSecondaryAction>
                          </ListItem>
                        );
                      })}
                    </List>
                    
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAddComment();
                          }
                        }}
                      />
                      <Button
                        variant="contained"
                        size="small"
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        startIcon={<SendIcon />}
                      >
                        Send
                      </Button>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Close</Button>
            <Button variant="contained" startIcon={<EditIcon />}>
              Edit Test Case
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default TestCollaborationHub;
