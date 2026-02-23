export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const ENDPOINTS = {
  LOGIN: '/api/auth/login',
  PROJECTS: '/api/projects',
  PROJECT_DETAILS: '/api/projects/:projectId/details',
  PROJECT_SETUP: '/api/projects/:projectId/setup',
  PROJECT_SECTIONS: '/api/projects/:projectId/sections',
  SPEC_UPLOAD: '/api/spec-upload',
  SUBMITTAL_ASSISTANT: '/api/submittal-assistant',
  SUBMITTAL_PROGRESS: '/api/submittals/:submittalId/progress',
  SUBMITTAL_RESULT: '/api/submittals/:submittalId/result',
} as const;

export const HTTP_METHOD = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
} as const;
