// Decode Base64 encoded API URL for security
const decodeBase64 = (encoded: string): string => {
  try {
    return atob(encoded);
  } catch {
    return encoded;
  }
};

const encodedUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export const BASE_URL = encodedUrl.includes('http') ? encodedUrl : decodeBase64(encodedUrl);

export const ENDPOINTS = {
  LOGIN: '/api/auth/login',
  PROJECTS: '/api/projects',
  PROJECT_DETAILS: '/api/projects/:projectId/details',
  PROJECT_SETUP: '/api/projects/:projectId/setup',
  PROJECT_SECTIONS: '/api/projects/:projectId/sections',
  SPEC_UPLOAD: '/api/spec-upload',
  SUBMITTAL_ASSISTANT: '/api/submittal-assistant',
  SUBMITTAL: '/api/submittals/:submittalId',
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
