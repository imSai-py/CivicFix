import axios from 'axios';
import {
  AuthTokens,
  Category,
  GeoJSONFeatureCollection,
  Issue,
  IssueStatus,
  User,
  AuditLog
} from '../types';

const API_BASE_URL = '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let accessToken: string | null = localStorage.getItem('access_token');
let refreshToken: string | null = localStorage.getItem('refresh_token');

export const setAuthTokens = (tokens: AuthTokens | null) => {
  if (tokens) {
    accessToken = tokens.access_token;
    refreshToken = tokens.refresh_token;
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
  } else {
    accessToken = null;
    refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
};

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && refreshToken) {
      originalRequest._retry = true;
      try {
        const res = await axios.post<AuthTokens>(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });
        setAuthTokens(res.data);
        originalRequest.headers.Authorization = `Bearer ${res.data.access_token}`;
        return apiClient(originalRequest);
      } catch (err) {
        setAuthTokens(null);
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: any) => apiClient.post<User>('/auth/register', data),
  login: (data: any) => apiClient.post<AuthTokens>('/auth/login', data),
  getMe: () => apiClient.get<User>('/users/me'),
  updateProfile: (data: { full_name?: string; phone_number?: string }) =>
    apiClient.patch<User>('/users/me', data),
  changePassword: (data: { current_password: string; new_password: string }) =>
    apiClient.post<{ message: string }>('/users/me/change-password', data),
};

export const issuesApi = {
  list: (params?: any) => apiClient.get<{ items: Issue[]; total_items: number }>('/issues', { params }),
  getNearbyGeoJSON: (latitude: number, longitude: number, radiusKm: number = 10) =>
    apiClient.get<GeoJSONFeatureCollection>('/issues/nearby', {
      params: { latitude, longitude, radius_km: radiusKm },
    }),
  create: (data: any) => apiClient.post<Issue>('/issues', data),
  upvote: (issueId: string) => apiClient.post<Issue>(`/issues/${issueId}/upvote`),
  approve: (issueId: string, remarks?: string) =>
    apiClient.post<Issue>(`/issues/${issueId}/approve`, { remarks }),
  reject: (issueId: string, remarks: string) =>
    apiClient.post<Issue>(`/issues/${issueId}/reject`, { remarks }),
  assign: (issueId: string, departmentId: string, remarks?: string) =>
    apiClient.post<Issue>(`/issues/${issueId}/assign`, { department_id: departmentId, remarks }),
  updateStatus: (issueId: string, status: IssueStatus, remarks?: string) =>
    apiClient.patch<Issue>(`/issues/${issueId}/status`, { status, remarks }),
  uploadAttachment: (issueId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`/issues/${issueId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getAuditLogs: (issueId: string) => apiClient.get<AuditLog[]>(`/issues/${issueId}/audit-logs`),
};

export const categoriesApi = {
  list: () => apiClient.get<Category[]>('/categories'),
};
