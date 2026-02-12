import { API_BASE_URL } from './api';

interface HttpOptions extends RequestInit {
  skipAuthRedirect?: boolean;
}

interface ApiErrorResponse {
  detail?: string;
}

const AUTH_ERROR_MESSAGE = 'Authentication failed: AuthErrorReason.SESSION_TOKEN_MISSING';

/**
 * 统一的 API 请求封装
 * 自动处理 401 认证失败，跳转到登录页
 */
export async function httpRequest<T = unknown>(
  url: string,
  options: HttpOptions = {}
): Promise<T> {
  const { skipAuthRedirect = false, ...fetchOptions } = options;

  // 构建完整 URL
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

  // 设置默认 headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((fetchOptions.headers as Record<string, string>) || {}),
  };

  const response = await fetch(fullUrl, {
    ...fetchOptions,
    headers,
  });

  // 处理 401 认证失败
  if (response.status === 401 && !skipAuthRedirect) {
    let errorData: ApiErrorResponse = {};
    try {
      errorData = await response.json();
    } catch {
      // 解析失败，使用空对象
    }

    // 检查是否是 session token 缺失的错误
    if (errorData.detail?.includes(AUTH_ERROR_MESSAGE)) {
      console.warn('[HTTP] Session token missing, redirecting to login...');
      // 保存当前路径，登录后可以跳转回来
      const currentPath = window.location.pathname + window.location.search;
      if (currentPath !== '/sign-in' && currentPath !== '/sign-up') {
        sessionStorage.setItem('redirectAfterLogin', currentPath);
      }
      // 跳转到登录页
      window.location.href = '/sign-in';
      // 抛出错误阻止后续处理
      throw new Error('Authentication required');
    }
  }

  // 处理其他错误
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch {
      // 解析失败，使用默认错误信息
    }
    throw new Error(errorMessage);
  }

  // 解析响应
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return response.json() as Promise<T>;
  }

  return response.text() as Promise<T>;
}

/**
 * GET 请求
 */
export function get<T = unknown>(url: string, options?: HttpOptions): Promise<T> {
  return httpRequest<T>(url, { ...options, method: 'GET' });
}

/**
 * POST 请求
 */
export function post<T = unknown>(
  url: string,
  data?: unknown,
  options?: HttpOptions
): Promise<T> {
  return httpRequest<T>(url, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT 请求
 */
export function put<T = unknown>(
  url: string,
  data?: unknown,
  options?: HttpOptions
): Promise<T> {
  return httpRequest<T>(url, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE 请求
 */
export function del<T = unknown>(url: string, options?: HttpOptions): Promise<T> {
  return httpRequest<T>(url, { ...options, method: 'DELETE' });
}

/**
 * 检查是否需要登录
 * 用于在发送请求前检查本地认证状态
 */
export function checkAuth(): boolean {
  // 这里可以根据实际需求检查本地存储的 token
  // 返回 true 表示已登录，false 表示未登录
  return true;
}
