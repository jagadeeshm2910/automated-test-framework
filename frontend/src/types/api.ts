// API Types and Interfaces for the UI Testing Framework

export interface FieldMetadata {
  id: number;
  name: string;
  field_type: string;
  label?: string;
  placeholder?: string;
  required: boolean;
  validation_pattern?: string;
  xpath: string;
  css_selector?: string;
  element_attributes?: Record<string, any>;
  created_at: string;
}

export interface MetadataRecord {
  id: number;
  url: string;
  source_type: 'web_page' | 'github_repo';
  title?: string;
  description?: string;
  fields: FieldMetadata[];
  extraction_method: string;
  confidence_score: number;
  created_at: string;
  updated_at: string;
}

export interface TestRun {
  id: number;
  metadata_id: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  generated_data?: Record<string, any>;
  test_results?: Record<string, any>;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface Screenshot {
  id: number;
  test_run_id: number;
  screenshot_type: 'before' | 'after' | 'error';
  file_path: string;
  url?: string;
  step?: string;
  file_size: number;
  taken_at: string;
}

export interface GlobalAnalytics {
  totals: {
    metadata_records: number;
    test_runs: number;
    screenshots: number;
  };
  test_run_status: {
    completed: number;
    failed: number;
    running: number;
    pending: number;
    success_rate_percent: number;
  };
  source_distribution: {
    web_pages: number;
    github_repos: number;
  };
  recent_activity: {
    test_runs_last_7_days: number;
    test_runs_last_30_days: number;
    metadata_added_last_7_days: number;
  };
  generated_at: string;
}

export interface DashboardData {
  overview: {
    total_forms: number;
    total_test_runs: number;
    success_rate: number;
    recent_activity: number;
  };
  status_distribution: {
    completed: number;
    failed: number;
    running: number;
    pending: number;
    success_rate_percent: number;
  };
  performance: {
    avg_execution_time: number;
    tests_this_week: number;
  };
  quality: {
    recent_failures: number;
    most_common_error: string;
  };
  trends: {
    daily_activity: Array<{
      date: string;
      test_runs: number;
      success_rate: number;
    }>;
  };
  last_updated: string;
}

export interface ExtractionRequest {
  url: string;
  wait_for_js?: boolean;
  timeout?: number;
}

export interface GitHubExtractionRequest {
  repository_url: string;
  branch?: string;
  file_patterns?: string[];
}

export interface TestRequest {
  scenario: 'standard_test' | 'comprehensive_test' | 'performance_test';
  take_screenshots?: boolean;
  timeout?: number;
}

export interface GenerateDataRequest {
  scenarios: string[];
  count_per_scenario?: number;
  use_ai?: boolean;
  custom_constraints?: Record<string, any>;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Notification types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// Form state types
export interface FormState {
  loading: boolean;
  error?: string;
  success?: boolean;
}

// App state types
export interface AppState {
  notifications: Notification[];
  loading: boolean;
  connected: boolean;
}

export type TabValue = 'dashboard' | 'extract' | 'tests' | 'analytics' | 'results';

// Additional types for missing interfaces

export interface MetadataResponse {
  metadata: MetadataRecord[];
  total: number;
  page: number;
  size: number;
}

export interface TestResult {
  id: string;
  test_run_id: number;
  test_id?: string;
  status: 'passed' | 'failed' | 'error';
  execution_time: number;
  duration?: number;
  error_message?: string;
  screenshots?: Screenshot[];
  created_at: string;
}

export interface TestResultDetail extends TestResult {
  detailed_logs: string[];
  steps: Array<{
    action: string;
    status: 'success' | 'failure';
    timestamp: string;
    screenshot_path?: string;
  }>;
}

export interface TestConfiguration {
  browser: 'chrome' | 'firefox' | 'safari';
  viewport: {
    width: number;
    height: number;
  };
  timeout: number;
  retries: number;
  parallel: boolean;
}

// Query parameter interfaces
export interface ResultsQuery {
  test_id?: string;
  metadata_id?: string;
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface MetadataQuery {
  limit?: number;
  page?: number;
  status?: string;
}
