const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api';

// Detect if we are running against the Test Database (Port 5001)
export const isTestMode = API_BASE_URL.includes('5001');


/**
 * Custom API Client
 * Wraps the standard fetch API to automatically inject the JWT token
 * into the Authorization header for every request.
 */
export const apiClient = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('ncho_token');

  const headers = new Headers(options.headers || {});
  
  // Only add Content-Type if it's not a FormData (used for file uploads)
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // If unauthorized, clear token and optionally redirect
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('ncho_token');
    localStorage.removeItem('ncho_user');
    // window.location.href = '/'; // Redirect to login
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || `API request failed with status ${response.status}`);
  }

  return data;
};

// Convenience methods
export const api = {
  get: (endpoint: string, options?: RequestInit) => apiClient(endpoint, { ...options, method: 'GET' }),
  post: (endpoint: string, body: any, options?: RequestInit) => 
    apiClient(endpoint, { 
      ...options, 
      method: 'POST', 
      body: body instanceof FormData ? body : JSON.stringify(body) 
    }),
  put: (endpoint: string, body: any, options?: RequestInit) => 
    apiClient(endpoint, { 
      ...options, 
      method: 'PUT', 
      body: body instanceof FormData ? body : JSON.stringify(body) 
    }),
  delete: (endpoint: string, options?: RequestInit) => apiClient(endpoint, { ...options, method: 'DELETE' }),
};
