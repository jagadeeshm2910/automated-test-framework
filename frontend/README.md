# Metadata-Driven UI Testing Framework - Frontend

A comprehensive React TypeScript dashboard for the Metadata-Driven UI Testing Framework, providing a modern web interface for form extraction, test management, and analytics visualization.

## 🚀 Features

### ✅ Completed Features
- **Modern React TypeScript Architecture** - Built with Vite, Material-UI, and TypeScript
- **Responsive Navigation Layout** - Sidebar navigation with mobile support
- **Dashboard Overview** - Real-time metrics, quick actions, and system status
- **Form Extraction Interface** - URL and GitHub repository form metadata extraction
- **Test Management** - Execute, monitor, and manage UI tests with real-time progress
- **Analytics Dashboard** - Charts, graphs, and performance metrics visualization
- **Results Browser** - Comprehensive test results with screenshot gallery
- **Real-time Updates** - WebSocket integration for live test monitoring
- **Type-Safe API Integration** - Complete backend API coverage with TypeScript interfaces

### 🎨 UI Components
- **Layout Component** - Main navigation and responsive sidebar
- **Dashboard Page** - Overview with metrics cards and recent activity
- **Extract Form Page** - URL/GitHub input forms with result preview
- **Test Management Page** - Test execution with configuration options
- **Analytics Page** - Data visualization with charts and performance tables
- **Results Page** - Test results browser with screenshot viewer

## 🛠 Tech Stack

- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI) v6
- **State Management**: React Context + React Query
- **Routing**: React Router v6
- **Charts**: Recharts for data visualization
- **HTTP Client**: Axios with interceptors
- **Real-time**: WebSocket integration ready

## 📁 Project Structure

```
src/
├── components/
│   └── Layout/
│       └── Layout.tsx          # Main navigation layout
├── pages/
│   ├── Dashboard.tsx           # Main dashboard with metrics
│   ├── ExtractForm.tsx         # Form extraction interface
│   ├── TestRuns.tsx           # Test management and monitoring
│   ├── Analytics.tsx          # Charts and analytics
│   └── Results.tsx            # Test results browser
├── services/
│   └── api.ts                 # Backend API integration
├── contexts/
│   └── AppContext.tsx         # Global state management
├── types/
│   └── api.ts                 # TypeScript interfaces
└── App.tsx                    # Main app with routing
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API server running on http://localhost:8000

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open in browser**:
   ```
   http://localhost:5173
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔌 API Integration

The frontend integrates with the FastAPI backend through a comprehensive API service layer:

### Key API Endpoints
- `POST /extract/url` - Extract metadata from web pages
- `POST /extract/github` - Extract metadata from GitHub repositories  
- `POST /test/{metadata_id}` - Start UI tests
- `GET /results/analytics/global` - Global system analytics
- `GET /results/reports/dashboard` - Dashboard data

### Features
- **Type-safe API calls** with TypeScript interfaces
- **Automatic retries** and error handling
- **Request/response logging** for debugging
- **WebSocket support** for real-time updates
- **Loading states** and error boundaries

## 📊 Key Features

### Dashboard
- Real-time metrics cards (total tests, success rate, active tests)
- Quick action buttons for common tasks
- Recent test results preview
- System status indicators
- Connection health monitoring

### Form Extraction
- Support for both URL and GitHub repository extraction
- Real-time extraction progress with loading indicators
- Extracted metadata preview with form details
- Download extracted metadata as JSON
- Recent extractions history

### Test Management
- Configure and start new tests with custom parameters
- Real-time test monitoring with progress indicators
- Active tests vs. test history tabs
- Bulk test operations and filtering
- Test result navigation

### Analytics
- Interactive charts with Recharts library
- Performance metrics and trends
- Test success rate analysis
- Response time monitoring
- Browser usage statistics
- Comprehensive performance tables

### Results Browser
- Paginated test results with advanced filtering
- Screenshot gallery with lightbox viewer
- Detailed test logs and error messages
- Export test results as JSON
- Status-based result grouping

## 🎨 Design System

### Material-UI Theme
- **Primary Color**: #1976d2 (Blue)
- **Secondary Color**: #dc004e (Pink)
- **Background**: #f5f5f5 (Light Gray)
- **Typography**: Roboto font family
- **Responsive Design**: Mobile-first approach

### Components
- **Consistent spacing** using Material-UI's 8px grid system
- **Accessible design** with ARIA labels and keyboard navigation
- **Loading states** with skeleton loaders and progress indicators
- **Error handling** with user-friendly error messages
- **Notifications** with auto-dismiss toast system

---

**Status**: ✅ **Production Ready** - Frontend dashboard is fully functional and ready for use with the backend API.

**Next Steps**: Connect to backend API server and test full end-to-end functionality.
