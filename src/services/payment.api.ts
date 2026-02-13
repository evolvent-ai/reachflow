import { API_BASE_URL } from './api';

// 套餐类型
export interface Tier {
  id: number;
  uid: string;
  code: string;
  name: string;
  credits_amount: number;
  price: number; // 单位：分
  currency: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
}

// 订单类型
export interface Order {
  id: number;
  uid: string;
  order_no: string;
  user_id: number;
  tier_id: number | null;
  credits_amount: number;
  total_amount: number; // 单位：分
  payment_method: string | null;
  payment_transaction_id: string | null;
  status: 'pending' | 'paid' | 'cancelled' | 'expired';
  paid_at: number | null;
  expired_at: number | null;
  description: string | null;
  created_at: number;
}

// 创建订单请求
export interface CreateOrderRequest {
  tier_uid: string;
  payment_method: 'wechat' | 'alipay';
}

// 创建订单响应
export interface CreateOrderResponse {
  uid: string;
  order_no: string;
  total_amount: number;
  payment_url: string;
  qr_code: string; // base64 图片
  expired_at: number;
}

// 积分余额
export interface CreditsBalance {
  credits: number;
  last_updated: number;
}

// 获取 Clerk JWT Token
async function getClerkToken(): Promise<string | null> {
  try {
    // 从 window.Clerk 获取 token（避免在普通函数中使用 React Hook）
    const clerk = (window as unknown as { Clerk?: { session?: { getToken: () => Promise<string | null> } } }).Clerk;
    if (clerk?.session) {
      return await clerk.session.getToken();
    }
    return null;
  } catch {
    return null;
  }
}

// 401 错误处理
function handleAuthError(): void {
  // 保存当前路径，登录后可以跳转回来
  const currentPath = window.location.pathname + window.location.search;
  if (currentPath !== '/sign-in' && currentPath !== '/sign-up') {
    sessionStorage.setItem('redirectAfterLogin', currentPath);
  }
  // 跳转到登录页
  window.location.href = '/sign-in';
}

// 通用请求封装（带 Clerk JWT）
async function authRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = await getClerkToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  // 处理 401 认证失败
  if (response.status === 401) {
    let errorData: { detail?: string } = {};
    try {
      errorData = await response.json();
    } catch {
      // 解析失败，使用空对象
    }

    // 检查是否是 session token 缺失的错误
    if (errorData.detail?.includes('Authentication failed')) {
      console.warn('[Payment] Session token missing, redirecting to login...');
      handleAuthError();
      throw new Error('Authentication required');
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * 获取积分套餐列表（无需登录）
 */
export async function getTiers(): Promise<{ tiers: Tier[] }> {
  const response = await fetch(`${API_BASE_URL}/v1/public/tiers`);
  if (!response.ok) {
    throw new Error(`Failed to fetch tiers: ${response.status}`);
  }
  return response.json();
}

/**
 * 创建订单（需要登录）
 */
export async function createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
  return authRequest<CreateOrderResponse>('/v1/client/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * 查询订单状态（需要登录）
 */
export async function getOrder(orderUid: string): Promise<Order> {
  return authRequest<Order>(`/v1/client/orders/${orderUid}`);
}

/**
 * 查询积分余额（需要登录）
 */
export async function getCreditsBalance(): Promise<CreditsBalance> {
  return authRequest<CreditsBalance>('/v1/client/credits');
}

/**
 * 轮询订单状态
 * @param orderUid 订单 UID
 * @param onSuccess 支付成功回调
 * @param onFailed 支付失败/过期回调
 * @param interval 轮询间隔（毫秒，默认 3000）
 * @returns 停止轮询的函数
 */
export function pollOrderStatus(
  orderUid: string,
  onSuccess: (order: Order) => void,
  onFailed: (order: Order) => void,
  interval: number = 3000
): () => void {
  const timer = setInterval(async () => {
    try {
      const order = await getOrder(orderUid);

      if (order.status === 'paid') {
        clearInterval(timer);
        onSuccess(order);
      } else if (order.status === 'cancelled' || order.status === 'expired') {
        clearInterval(timer);
        onFailed(order);
      }
      // pending 状态继续轮询
    } catch (error) {
      console.error('Poll order status failed:', error);
      // 错误时继续轮询，不中断
    }
  }, interval);

  // 返回停止轮询的函数
  return () => clearInterval(timer);
}
