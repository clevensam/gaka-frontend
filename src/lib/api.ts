import { Profile } from './types';
import { getToken } from './auth';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
if (!API_BASE) {
  throw new Error('VITE_API_BASE_URL is not set. Please create a .env file with VITE_API_BASE_URL=https://your-api-url/api');
}

interface ApiError {
  error: { message: string };
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({ error: { message: 'Request failed' } }));
    throw new Error(errorData.error?.message || `HTTP ${response.status}`);
  }
  return response.json();
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  return handleResponse<T>(response);
}

export const api = {
  health: {
    check: () => request<{ status: string; timestamp: string }>('/health'),
    detailed: () => request<{ status: string; services: { supabase: string; gemini: boolean } }>('/health/detailed'),
  },

  auth: {
    register: (data: { username: string; password: string; fullName: string; email: string; avatarUrl?: string }) =>
      request<{ user: Profile; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    login: (data: { username: string; password: string }) =>
      request<{ user: Profile; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    me: () => request<{ user: Profile }>('/auth/me'),
  },

  modules: {
    getAll: () => request<{ modules: any[] }>('/modules'),

    getById: (id: string) =>
      request<{ module: any; resources: any[] }>(`/modules/${id}`),

    create: (data: { code: string; name: string; description?: string; year?: number; semester?: number }) =>
      request<{ module: any }>('/modules', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: { code?: string; name?: string; description?: string; year?: number; semester?: number }) =>
      request<{ module: any }>(`/modules/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      request<{ success: boolean }>(`/modules/${id}`, {
        method: 'DELETE',
      }),
  },

  resources: {
    getAll: (moduleId?: string) =>
      request<{ resources: any[] }>(
        moduleId ? `/resources?module_id=${moduleId}` : '/resources'
      ),

    getById: (id: string) =>
      request<{ resource: any }>(`/resources/${id}`),

    create: (data: { title: string; type: string; view_url?: string; download_url?: string; module_id: string }) =>
      request<{ resource: any }>('/resources', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: { title?: string; type?: string; view_url?: string; download_url?: string; module_id?: string }) =>
      request<{ resource: any }>(`/resources/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      request<{ success: boolean }>(`/resources/${id}`, {
        method: 'DELETE',
      }),
  },
};

export type Api = typeof api;