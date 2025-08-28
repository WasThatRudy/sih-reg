/**
 * Utility functions for admin API calls
 */

export const adminApiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('adminToken');
  
  if (!token) {
    throw new Error('No admin token found');
  }

  const response = await fetch(endpoint, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
};

export const adminApiRequestForm = async (endpoint: string, formData: FormData) => {
  const token = localStorage.getItem('adminToken');
  
  if (!token) {
    throw new Error('No admin token found');
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      // Don't set Content-Type for FormData - browser will set it with boundary
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
};
