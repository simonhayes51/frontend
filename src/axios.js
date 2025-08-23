import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://backend-production-1f1a.up.railway.app",
  withCredentials: true, // This handles session cookies automatically
  timeout: 10000, // 10 second timeout
});

// Request interceptor for logging and common headers
instance.interceptors.request.use(
  (config) => {
    // Add any common headers if needed
    config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';
    
    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`Making ${config.method?.toUpperCase()} request to:`, config.url);
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
instance.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log('Response received:', response.status, response.config.url);
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.detail || error.message;
    
    // Handle different error types
    switch (status) {
      case 401:
        // Unauthorized - redirect to login
        console.log('Authentication required, redirecting to login...');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        break;
        
      case 403:
        console.error('Access forbidden:', message);
        break;
        
      case 404:
        console.error('Resource not found:', error.config?.url);
        break;
        
      case 500:
        console.error('Server error:', message);
        break;
        
      default:
        console.error('Request failed:', message);
    }
    
    // Return a more user-friendly error object
    const enhancedError = {
      ...error,
      userMessage: getUserFriendlyMessage(status, message)
    };
    
    return Promise.reject(enhancedError);
  }
);

// Helper function to provide user-friendly error messages
function getUserFriendlyMessage(status, originalMessage) {
  switch (status) {
    case 401:
      return 'Please log in to continue';
    case 403:
      return 'You do not have permission to perform this action';
    case 404:
      return 'The requested resource was not found';
    case 500:
      return 'Server error. Please try again later';
    case undefined:
      return 'Network error. Please check your connection';
    default:
      return originalMessage || 'An unexpected error occurred';
  }
}

export default instance;
