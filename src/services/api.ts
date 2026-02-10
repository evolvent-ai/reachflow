// API configuration

const getApiBaseUrl = (): string => {
  // Priority: 1. window config, 2. body data attribute, 3. env variable, 4. default
  if (typeof window !== 'undefined' && window.__RESEARCH_CONFIG__?.apiBaseUrl) {
    return window.__RESEARCH_CONFIG__.apiBaseUrl;
  }
  
  if (typeof document !== 'undefined') {
    const bodyAttr = document.body?.dataset.apiBaseUrl;
    if (bodyAttr) return bodyAttr;
  }
  
  return import.meta.env.VITE_API_BASE_URL || '/api';
};

export const API_BASE_URL = getApiBaseUrl();

export const apiConfig = {
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
};
