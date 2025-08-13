import axios from 'axios';
import type {
  MetadataRecord,
  TestRun,
  Screenshot,
  GlobalAnalytics,
  DashboardData,
  ExtractionRequest,
  GitHubExtractionRequest,
  TestRequest,
  GenerateDataRequest,
  PaginatedResponse
} from '../types/api';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use((config) => {
  console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
);

// Health Check
export const healthCheck = async (): Promise<{ status: string; timestamp: string }> => {
  const response = await api.get('/health');
  return response.data;
};

// Extraction APIs
export const extractFromUrl = async (request: ExtractionRequest): Promise<MetadataRecord> => {
  // Create a custom axios instance for extraction with extended timeout
  const extractionApi = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000, // 60 seconds for extraction
    headers: { 'Content-Type': 'application/json' },
  });

  console.log(`Starting URL extraction for: ${request.url}`);
  const response = await extractionApi.post('/extract/url', {
    url: request.url,
    wait_for_js: request.wait_for_js ?? false, // Default to false for faster extraction
    timeout: request.timeout ?? 15 // Default to 15 seconds
  });
  console.log(`URL extraction completed for: ${request.url}`);
  return response.data;
};

export const extractFromGitHub = async (request: GitHubExtractionRequest): Promise<MetadataRecord> => {
  const response = await api.post('/extract/github', request);
  return response.data;
};

// Metadata APIs
export const getAllMetadata = async (
  page: number = 1,
  size: number = 20
): Promise<PaginatedResponse<MetadataRecord>> => {
  const response = await api.get('/metadata', {
    params: { page, size }
  });
  return response.data;
};

export const getMetadataById = async (id: number): Promise<MetadataRecord> => {
  const response = await api.get(`/metadata/${id}`);
  return response.data;
};

export const deleteMetadata = async (id: number): Promise<void> => {
  await api.delete(`/metadata/${id}`);
};

// Test Management APIs
export const startTest = async (metadataId: number, request: TestRequest): Promise<TestRun> => {
  const response = await api.post(`/test/${metadataId}`, request);
  return response.data;
};

export const getTestStatus = async (testRunId: number): Promise<TestRun> => {
  const response = await api.get(`/test/status/${testRunId}`);
  return response.data;
};

export const getAllTestRuns = async (
  page: number = 1,
  size: number = 20,
  status?: string
): Promise<PaginatedResponse<TestRun>> => {
  const response = await api.get('/test/runs', {
    params: { page, size, status }
  });
  return response.data;
};

// Results APIs
export const getTestResults = async (testRunId: number): Promise<TestRun> => {
  const response = await api.get(`/results/${testRunId}`);
  return response.data;
};

export const getTestScreenshots = async (testRunId: number): Promise<Screenshot[]> => {
  const response = await api.get(`/results/${testRunId}/screenshots`);
  return response.data;
};

export const getTestSummary = async (testRunId: number): Promise<any> => {
  const response = await api.get(`/results/${testRunId}/summary`);
  return response.data;
};

// Analytics APIs
export const getGlobalAnalytics = async (): Promise<GlobalAnalytics> => {
  const response = await api.get('/results/analytics/global');
  return response.data;
};

export const getPerformanceAnalytics = async (days: number = 30): Promise<any> => {
  const response = await api.get('/results/analytics/performance', {
    params: { days }
  });
  return response.data;
};

export const getFieldTypeAnalytics = async (): Promise<any> => {
  const response = await api.get('/results/analytics/field-types');
  return response.data;
};

export const getFailureAnalysis = async (limit: number = 20): Promise<any> => {
  const response = await api.get('/results/analytics/failures', {
    params: { limit }
  });
  return response.data;
};

export const getScreenshotAnalytics = async (): Promise<any> => {
  const response = await api.get('/results/analytics/screenshots');
  return response.data;
};

export const getMetadataInsights = async (metadataId: number): Promise<any> => {
  const response = await api.get(`/results/analytics/metadata/${metadataId}`);
  return response.data;
};

// Reporting APIs
export const getExecutiveSummary = async (): Promise<any> => {
  const response = await api.get('/results/reports/executive-summary');
  return response.data;
};

export const getDashboardData = async (): Promise<DashboardData> => {
  const response = await api.get('/results/reports/dashboard');
  return response.data;
};

// Advanced Analytics APIs
export const getSuccessRateTrends = async (days: number = 30): Promise<any> => {
  const response = await api.get('/results/analytics/trends/success-rate', {
    params: { days }
  });
  return response.data;
};

export const compareMetadata = async (metadataIds: number[]): Promise<any> => {
  const response = await api.get('/results/analytics/comparison/metadata', {
    params: { metadata_ids: metadataIds.join(',') }
  });
  return response.data;
};

export const getHealthCheck = async (): Promise<any> => {
  const response = await api.get('/results/analytics/health-check');
  return response.data;
};

// Data Generation APIs
export const generateTestData = async (
  metadataId: number,
  request: GenerateDataRequest
): Promise<any> => {
  const response = await api.post(`/generate/${metadataId}`, request);
  return response.data;
};

export const generateBulkData = async (request: {
  metadata_ids: number[];
  scenarios: string[];
  use_ai?: boolean;
}): Promise<any> => {
  const response = await api.post('/generate/bulk', request);
  return response.data;
};

export const generateFieldData = async (request: {
  field_type: string;
  constraints?: Record<string, any>;
  count?: number;
}): Promise<any> => {
  const response = await api.post('/generate/field', request);
  return response.data;
};

export const generateSyntheticMetadata = async (request: {
  form_type: string;
  complexity?: string;
  field_count?: number;
}): Promise<MetadataRecord> => {
  const response = await api.post('/generate/metadata', request);
  return response.data;
};

// Utility functions
export const downloadScreenshot = async (filePath: string): Promise<Blob> => {
  const response = await api.get(`/files/screenshot/${encodeURIComponent(filePath)}`, {
    responseType: 'blob'
  });
  return response.data;
};

export const exportTestResults = async (testRunId: number, format: 'json' | 'csv' = 'json'): Promise<Blob> => {
  const response = await api.get(`/results/${testRunId}/export`, {
    params: { format },
    responseType: 'blob'
  });
  return response.data;
};

// WebSocket utility (for real-time updates)
export const createWebSocketConnection = (onMessage: (data: any) => void) => {
  const wsUrl = API_BASE_URL.replace('http', 'ws') + '/ws';
  const ws = new WebSocket(wsUrl);
  
  ws.onopen = () => {
    console.log('WebSocket connected');
  };
  
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (error) {
      console.error('WebSocket message parse error:', error);
    }
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  ws.onclose = () => {
    console.log('WebSocket disconnected');
  };
  
  return ws;
};

export const apiService = {
  // Health Check
  healthCheck,
  
  // Extraction APIs
  extractFromUrl,
  extractFromGitHub,
  
  // Metadata APIs
  getAllMetadata,
  getMetadataById,
  deleteMetadata,
  
  // Test Management APIs
  startTest,
  getTestStatus,
  deleteTest: async (testId: string): Promise<void> => {
    await api.delete(`/test/${testId}`);
  },
  
  // Results APIs
  getTestResults,
  getResults: async (params?: { limit?: number; page?: number; status?: string }) => {
    const response = await api.get('/results', { params });
    return response.data;
  },
  getResultDetail: async (resultId: string) => {
    const response = await api.get(`/results/${resultId}`);
    return response.data;
  },
  
  // Analytics APIs
  getGlobalAnalytics,
  getPerformanceMetrics: async () => {
    const response = await api.get('/results/analytics/performance');
    return response.data;
  },
  
  // Dashboard APIs
  getDashboardData: async () => {
    const response = await api.get('/results/reports/dashboard');
    return response.data;
  },
  
  // Screenshots APIs
  getTestScreenshots,
  
  // Data Generation APIs
  generateTestData,
  getAvailableScenarios: async (): Promise<string[]> => {
    const response = await api.get('/generate/scenarios');
    return response.data;
  },
  generateBulkData: async (request: {
    metadata_ids: number[];
    scenarios: string[];
    use_ai?: boolean;
  }) => {
    const response = await api.post('/generate/bulk', request);
    return response.data;
  },
  generateFieldData: async (request: {
    field_type: string;
    constraints?: Record<string, any>;
    count?: number;
  }) => {
    const response = await api.get('/generate/field', { params: request });
    return response.data;
  },
  
  // Enhanced test management
  stopTest: async (testId: string): Promise<void> => {
    await api.post(`/test/stop/${testId}`);
  },
  getTestRuns: async (params?: { page?: number; size?: number; status?: string }) => {
    try {
      // First get metadata records to find test runs
      const metadataResponse = await api.get('/metadata/', { 
        params: { limit: params?.size || 50 } 
      });
      
      if (!metadataResponse.data?.items || metadataResponse.data.items.length === 0) {
        return { items: [], total: 0 };
      }
      
      // Get test runs for each metadata
      const allTestRuns = [];
      for (const metadata of metadataResponse.data.items) {
        try {
          const testRunsResponse = await api.get(`/test/${metadata.id}/runs`);
          if (testRunsResponse.data && Array.isArray(testRunsResponse.data)) {
            allTestRuns.push(...testRunsResponse.data);
          }
        } catch (error) {
          console.warn(`Failed to get test runs for metadata ${metadata.id}:`, error);
        }
      }
      
      // Sort by created_at desc and apply size limit
      let sortedRuns = allTestRuns.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      // Apply status filter if provided
      if (params?.status) {
        sortedRuns = sortedRuns.filter(run => run.status === params.status);
      }
      
      // Apply size limit
      if (params?.size) {
        sortedRuns = sortedRuns.slice(0, params.size);
      }
      
      return { items: sortedRuns, total: sortedRuns.length };
    } catch (error) {
      console.error('Error fetching test runs:', error);
      return { items: [], total: 0 };
    }
  },
  getMetadata: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get('/metadata/', { params });
    return response.data;
  }
};

export default api;
