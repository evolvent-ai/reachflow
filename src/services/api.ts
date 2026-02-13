// API configuration

const getApiBaseUrl = (): string => {
  // 根据环境判断：开发环境使用 reachflow.cc，生产环境使用 api.reachflow.cc
  const isProduction = import.meta.env.PROD;
  const baseDomain = isProduction ? 'https://api.reachflow.cc/api' : 'api';
  return `${baseDomain}`;
};

export const API_BASE_URL = getApiBaseUrl();

export const apiConfig = {
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
};
