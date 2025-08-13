<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Metadata-Driven UI Testing Framework - Frontend

This is a React TypeScript frontend dashboard for the Metadata-Driven UI Testing Framework.

## Project Context
- **Backend API**: FastAPI server running on http://localhost:8000
- **Purpose**: Web UI for form extraction, test management, and analytics visualization
- **Architecture**: React + TypeScript + Vite + Material-UI

## Key Features to Implement
1. **URL/GitHub Input Forms** - Submit web pages and repositories for form extraction
2. **Test Management Dashboard** - Monitor and manage UI test execution
3. **Analytics Visualization** - Charts and metrics from backend analytics API
4. **Real-time Updates** - Live monitoring of test progress with WebSocket
5. **Results Explorer** - Browse test results, screenshots, and detailed reports

## API Integration
- Base URL: `http://localhost:8000`
- Key endpoints:
  - `POST /extract/url` - Extract metadata from web pages
  - `POST /extract/github` - Extract metadata from GitHub repositories
  - `POST /test/{metadata_id}` - Start UI tests
  - `GET /results/analytics/global` - Global system analytics
  - `GET /results/reports/dashboard` - Dashboard data

## Component Structure
```
src/
├── components/
│   ├── Layout/          # Navigation, header, sidebar
│   ├── Forms/           # URL/GitHub input forms
│   ├── Dashboard/       # Main dashboard with metrics
│   ├── TestManagement/  # Test execution and monitoring
│   ├── Analytics/       # Charts and data visualization
│   ├── Results/         # Test results and screenshots
│   └── Common/          # Shared components
├── pages/
│   ├── Dashboard.tsx    # Main dashboard page
│   ├── ExtractForm.tsx  # Form extraction page
│   ├── TestRuns.tsx     # Test management page
│   ├── Analytics.tsx    # Analytics page
│   └── Results.tsx      # Results browser page
├── services/
│   ├── api.ts          # Backend API integration
│   ├── websocket.ts    # Real-time updates
│   └── types.ts        # TypeScript interfaces
└── utils/
    ├── helpers.ts      # Utility functions
    └── constants.ts    # App constants
```

## Design Guidelines
- Use Material-UI components for consistent design
- Implement responsive design for desktop and tablet
- Use TypeScript interfaces for all API responses
- Handle loading states and error conditions gracefully
- Implement real-time updates where beneficial
- Follow React best practices with hooks and context

## State Management
- Use React Context for global state (user settings, notifications)
- Use React Query/SWR for API state management and caching
- Local component state for form inputs and UI state

## Development Notes
- Backend server must be running for full functionality
- Use environment variables for API configuration
- Implement proper error boundaries and loading states
- Add accessibility features (ARIA labels, keyboard navigation)
- Write unit tests for critical components
